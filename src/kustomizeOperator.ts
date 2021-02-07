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

import * as k8s from '@kubernetes/client-node';
import YAML from 'yaml';
import fs from 'fs-extra';
import ora from 'ora';
import path from 'path';
import Operator, {
  ResourceEventType,
  ResourceMetaImpl
} from '@dot-i/k8s-operator';
import Logger from './logger';
import { Config } from './config';
import { Kustomize } from './services';
import ResourceTracker from './resourceTracker';
import {
  KustomizationResource,
  KustomizationStatus,
  KustomizationStatusPhase,
  OperatorFrameworkProject,
  ResourceGroup,
  ResourceKind,
  ResourceVersion
} from './types';

const logger = console;

export const project: OperatorFrameworkProject = YAML.parse(
  fs.readFileSync(path.resolve(__dirname, '../PROJECT')).toString()
);

export default class KustomizeOperator extends Operator {
  static labelNamespace = 'dev.siliconhills.helm2cattle';

  spinner = ora();

  customObjectsApi: k8s.CustomObjectsApi;

  resourceTracker = new ResourceTracker<KustomizationResource>();

  constructor(protected config: Config, protected log = new Logger()) {
    super(log);
    this.customObjectsApi = this.kubeConfig.makeApiClient(k8s.CustomObjectsApi);
  }

  protected async addedKustomization(
    resource: KustomizationResource,
    _meta: ResourceMetaImpl,
    _oldResource?: KustomizationResource
  ) {
    try {
      await this.updateStatus(
        {
          message: 'creating kustomization',
          phase: KustomizationStatusPhase.Pending,
          ready: false
        },
        resource
      );
      const kustomize = new Kustomize(resource);
      await kustomize.apply();
      await this.updateStatus(
        {
          message: 'created kustomization',
          phase: KustomizationStatusPhase.Succeeded,
          ready: true
        },
        resource
      );
    } catch (err) {
      await this.updateStatus(
        {
          message: err.message?.toString() || '',
          phase: KustomizationStatusPhase.Failed,
          ready: false
        },
        resource
      );
      throw err;
    }
  }

  protected async modifiedKustomization(
    resource: KustomizationResource,
    _meta: ResourceMetaImpl,
    oldResource?: KustomizationResource
  ) {
    if (resource.metadata?.generation === oldResource?.metadata?.generation) {
      return;
    }
    try {
      await this.updateStatus(
        {
          message: 'modifying kustomization',
          phase: KustomizationStatusPhase.Pending,
          ready: false
        },
        resource
      );
      const kustomize = new Kustomize(resource);
      await kustomize.apply();
      await this.updateStatus(
        {
          message: 'modified kustomization',
          phase: KustomizationStatusPhase.Succeeded,
          ready: true
        },
        resource
      );
    } catch (err) {
      await this.updateStatus(
        {
          message: err.message?.toString() || '',
          phase: KustomizationStatusPhase.Failed,
          ready: false
        },
        resource
      );
      throw err;
    }
  }

  protected async init() {
    this.watchResource(
      KustomizeOperator.resource2Group(ResourceGroup.Kustomize),
      ResourceVersion.V1alpha1,
      KustomizeOperator.kind2Plural(ResourceKind.Kustomization),
      async (e) => {
        // spawn as non blocking process
        (async () => {
          const {
            oldResource,
            newResource
          } = this.resourceTracker.rotateResource(e.object);
          try {
            if (e.type === ResourceEventType.Deleted) return;
            switch (e.type) {
              case ResourceEventType.Added: {
                await this.addedKustomization(newResource, e.meta, oldResource);
                break;
              }
              case ResourceEventType.Modified: {
                await this.modifiedKustomization(
                  newResource,
                  e.meta,
                  oldResource
                );
                break;
              }
            }
          } catch (err) {
            this.spinner.fail(
              [
                err.message || '',
                err.body?.message || err.response?.body?.message || ''
              ].join(': ')
            );
            if (this.config.debug) this.log.error(err);
          }
        })().catch(logger.error);
      }
    ).catch(logger.error);
  }

  async updateStatus(
    status: KustomizationStatus,
    resource: KustomizationResource
  ): Promise<void> {
    if (!resource.metadata?.name || !resource.metadata.namespace) return;
    await this.customObjectsApi.patchNamespacedCustomObjectStatus(
      KustomizeOperator.resource2Group(ResourceGroup.Kustomize),
      ResourceVersion.V1alpha1,
      resource.metadata.namespace,
      KustomizeOperator.kind2Plural(ResourceKind.Kustomization),
      resource.metadata.name,
      [
        {
          op: 'replace',
          path: '/status',
          value: status
        }
      ],
      undefined,
      undefined,
      undefined,
      {
        headers: { 'Content-Type': 'application/json-patch+json' }
      }
    );
  }

  static resource2Group(group: string) {
    return `${group}.${project.domain}`;
  }

  static kind2Plural(kind: string) {
    const lowercasedKind = kind.toLowerCase();
    if (lowercasedKind[lowercasedKind.length - 1] === 's') {
      return lowercasedKind;
    }
    return `${lowercasedKind}s`;
  }
}
