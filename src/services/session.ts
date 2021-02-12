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

import YAML from 'yaml';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { KubernetesObject } from '@kubernetes/client-node';
import Kubectl from './kubectl';
import { KustomizationSpec } from '~/types';

export default class SessionService {
  private kubectl = new Kubectl();

  private _workdir: string | undefined;

  public static queriedResourcesPath = 'resources/_queried.yaml';

  public static kustomizationPath = 'kustomization.yaml';

  public static kustomizeConfigPath = 'kustomizeconfig.yaml';

  async getWorkdir(...paths: string[]) {
    if (!this._workdir) {
      this._workdir = await fs.mkdtemp(
        path.resolve(os.tmpdir(), 'kustomize-operator-')
      );
    }
    const result = path.resolve(this._workdir, ...paths);
    await fs.mkdirp(result.replace(/[^/]+$/g, ''));
    return result;
  }

  async setResources(resources: KubernetesObject[]) {
    const resourcesPath = await this.getWorkdir(
      SessionService.queriedResourcesPath
    );
    await fs.writeFile(resourcesPath, this.kubectl.resources2String(resources));
  }

  async setKustomization(spec: KustomizationSpec = {}) {
    const kustomizationPath = await this.getWorkdir(
      SessionService.kustomizationPath
    );
    const kustomizeConfigPath = await this.getWorkdir(
      SessionService.kustomizeConfigPath
    );
    const kustomization = {
      resources: [SessionService.queriedResourcesPath],
      configurations: [SessionService.kustomizeConfigPath],
      ...(spec.commonLabels ? { commonLabels: spec.commonLabels } : {}),
      ...(spec.crds ? { crds: spec.crds } : {}),
      ...(spec.images ? { images: spec.images } : {}),
      ...(spec.namePrefix ? { namePrefix: spec.namePrefix } : {}),
      ...(spec.nameSuffix ? { nameSuffix: spec.nameSuffix } : {}),
      ...(spec.namespace ? { namespace: spec.namespace } : {}),
      ...(spec.patches ? { patches: spec.patches } : {}),
      ...(spec.replicas ? { replicas: spec.replicas } : {}),
      ...(spec.vars ? { vars: spec.vars } : {}),
      ...(spec.secretGenerator
        ? { secretGenerator: spec.secretGenerator }
        : {}),
      ...(spec.commonAnnotations
        ? { commonAnnotations: spec.commonAnnotations }
        : {}),
      ...(spec.configMapGenerator
        ? { configMapGenerator: spec.configMapGenerator }
        : {}),
      ...(spec.generatorOptions
        ? { generatorOptions: spec.generatorOptions }
        : {}),
      ...(spec.patchesJson6902
        ? { patchesJson6902: spec.patchesJson6902 }
        : {}),
      ...(spec.patchesStrategicMerge
        ? { patchesStrategicMerge: spec.patchesStrategicMerge }
        : {})
    };
    const kustomizeConfig = spec.configuration || {};
    await fs.writeFile(kustomizationPath, YAML.stringify(kustomization));
    await fs.writeFile(kustomizeConfigPath, YAML.stringify(kustomizeConfig));
  }

  async cleanup() {
    if (!this._workdir) return;
    await fs.remove(this._workdir);
    this._workdir = undefined;
  }
}
