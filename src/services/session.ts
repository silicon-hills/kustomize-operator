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
import pkg from '~/../package.json';
import { KustomizationSpec } from '~/types';
import { resources2String } from './util';

export default class Session {
  private _workdir: string | undefined;

  public static queriedResourcesPath = 'resources/_queried.yaml';

  public static kustomizationPath = 'kustomization.yaml';

  async getWorkdir(...paths: string[]) {
    if (!this._workdir) {
      this._workdir = await fs.mkdtemp(
        path.resolve(os.tmpdir(), `${pkg.name}-`)
      );
    }
    const result = path.resolve(this._workdir, ...paths);
    await fs.mkdirp(result.replace(/[^/]+$/g, ''));
    return result;
  }

  async setResources(resources: KubernetesObject[]) {
    const resourcesPath = await this.getWorkdir(Session.queriedResourcesPath);
    await fs.writeFile(resourcesPath, resources2String(resources));
  }

  async setKustomization(spec: KustomizationSpec = {}) {
    const kustomizationPath = await this.getWorkdir(Session.kustomizationPath);
    const kustomization = {
      resources: [Session.queriedResourcesPath],
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
    await fs.writeFile(kustomizationPath, YAML.stringify(kustomization));
  }

  async cleanup() {
    if (!this._workdir) return;
    await fs.remove(this._workdir);
    this._workdir = undefined;
  }
}
