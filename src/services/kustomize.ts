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

import { Options } from 'execa';
import {
  KubernetesListObject,
  KubernetesObject
} from '@kubernetes/client-node';
import Kubectl, { Output } from './kubectl';
import Session from './session';
import Command, { RunCallback } from './command';
import { Selector, KustomizationResource } from '~/types';
import { resources2String } from './util';

export default class Kustomize extends Command {
  command = 'kustomize';

  constructor(private kustomizationResource: KustomizationResource) {
    super();
  }

  private kubectl = new Kubectl();

  async help(options?: Options, cb?: RunCallback) {
    return this.run('--help', options, cb);
  }

  // TODO: improve selector match
  async getResources() {
    const { namespace } = this.kustomizationResource.metadata || {};
    if (!namespace || !this.kustomizationResource.spec?.resources) return [];
    const resourcesStr = resources2String(
      (this.kustomizationResource.spec?.resources).map(
        (resource: Selector) => ({
          apiVersion: resource.version,
          kind: resource.kind,
          metadata: {
            name: resource.name,
            namespace: resource.namespace || namespace
          }
        })
      )
    );
    return (
      (
        await this.kubectl.get<KubernetesListObject<KubernetesObject>>({
          stdin: resourcesStr,
          output: Output.Json
        })
      )?.items || []
    );
  }

  async apply() {
    const result = await this.patch();
    if (!result) return;
    console.log('STDIO', result);
    await this.kubectl.apply({ stdin: result, stdout: true });
  }

  async patch(options: Options = {}) {
    const session = new Session();
    const resources = await this.getResources();
    if (!resources.length) return;
    await session.setResources(resources);
    await session.setKustomization(this.kustomizationResource.spec);
    const workdir = await session.getWorkdir();
    const patched = await this.kustomize({ cwd: workdir, ...options });
    // await session.cleanup();
    return patched.toString();
  }

  async kustomize(options: Options = {}) {
    return this.run(['build', '.'], options, () => {});
  }
}
