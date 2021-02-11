/**
 * Copyright 2020 Silicon Hills LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import ora from 'ora';
import { Options } from 'execa';
import {
  KubernetesListObject,
  KubernetesObject,
  V1OwnerReference
} from '@kubernetes/client-node';
import { Selector, KustomizationResource, ResourceKind } from '~/types';
import CommandService, { RunCallback } from './command';
import KubectlService, { Output } from './kubectl';
import OperatorService from './operator';
import SessionService from './session';

export default class KustomizeService extends CommandService {
  command = 'kustomize';

  private operatorService = new OperatorService();

  constructor(private kustomizationResource: KustomizationResource) {
    super();
  }

  private spinner = ora();

  private kubectlService = new KubectlService();

  async help(options?: Options, cb?: RunCallback) {
    return this.run('--help', options, cb);
  }

  // TODO: improve selector match
  async getResources(): Promise<KubernetesObject[]> {
    const { namespace } = this.kustomizationResource.metadata || {};
    if (!namespace || !this.kustomizationResource.spec?.resources?.length) {
      return [];
    }
    const resources = (this.kustomizationResource.spec?.resources).map(
      (resource: Selector) => ({
        apiVersion: `${resource.group ? `${resource.group}/` : ''}${
          resource.version
        }`,
        kind: resource.kind,
        metadata: {
          name: resource.name,
          namespace: resource.namespace || namespace
        }
      })
    );
    return (
      (
        await this.kubectlService.get<KubernetesListObject<KubernetesObject>>({
          stdin: resources,
          output: Output.Json
        })
      )?.items || []
    );
  }

  async apply(owner?: KubernetesObject) {
    const resources = (await this.patch())
      .filter(
        (resource: KubernetesObject) =>
          resource.kind !== ResourceKind.Kustomization
      )
      .map((resource: KubernetesObject) => {
        const ns = resource.metadata?.namespace;
        const name = resource.metadata?.name;
        if (typeof ns === 'undefined' || typeof name === 'undefined') {
          throw new Error('metadata.name and metadata.namespace must be set');
        }
        const ownerReferences = resource.metadata?.ownerReferences || [];
        const ownerReferencesUidSet = new Set(
          ownerReferences.map(
            (ownerReference: V1OwnerReference) => ownerReference.uid
          )
        );
        if (
          typeof owner !== 'undefined' &&
          owner.metadata?.namespace === ns &&
          !ownerReferencesUidSet.has(owner.metadata?.uid || '')
        ) {
          ownerReferences.push(
            this.operatorService.getOwnerReference(owner, ns)
          );
        }
        return {
          ...resource,
          metadata: {
            ...resource.metadata,
            ...(ownerReferences.length
              ? {
                  ownerReferences
                }
              : {})
          }
        };
      });
    if (!resources.length) return;
    await this.kubectlService.apply({
      stdin: resources,
      stdout: true
    });
  }

  async patch(
    options: Options = {},
    timeLeft?: number
  ): Promise<KubernetesObject[]> {
    const retryTimeout =
      this.kustomizationResource?.spec?.retryTimeout || 60000;
    if (typeof timeLeft !== 'number') timeLeft = retryTimeout;
    try {
      const sessionService = new SessionService();
      const resources = await this.getResources();
      if (
        resources.length <
        (this.kustomizationResource?.spec?.resources || []).length
      ) {
        // TODO: improve error message
        throw new Error(
          `failed to find some resources for ${this.operatorService.getFullName(
            { resource: this.kustomizationResource }
          )}`
        );
      }
      if (!resources.length) return [];
      await sessionService.setResources(resources);
      await sessionService.setKustomization(this.kustomizationResource.spec);
      const workdir = await sessionService.getWorkdir();
      const patched = await this.kustomize({ cwd: workdir, ...options });
      await sessionService.cleanup();
      const result = this.kubectlService.string2Resources(patched.toString());
      this.spinner.succeed(
        `applied patches for ${this.operatorService.getFullName({
          resource: this.kustomizationResource
        })}`
      );
      return result;
    } catch (err) {
      if (timeLeft <= 0) throw err;
      const waitTime = Math.max(5000, retryTimeout / 10);
      this.spinner.warn(
        `received the following error, but will retry in ${waitTime}ms and will keep retrying until ${timeLeft}ms expires\n${(
          err.stderr ||
          err.message ||
          err
        ).toString()}`
      );
      await new Promise((r) => setTimeout(r, waitTime));
      return this.patch(options, timeLeft - waitTime);
    }
  }

  async kustomize(options: Options = {}) {
    return this.run(['build', '.'], options, () => {});
  }
}
