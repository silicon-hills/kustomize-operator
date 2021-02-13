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
import { KubernetesObject } from '@kubernetes/client-node';
import { HashMap } from '~/types';
import OperatorService from './operator';

export default class TrackingService<T = KubernetesObject> {
  private tracking: HashMap<string | true> = {};

  private spinner = ora();

  private operatorService = new OperatorService();

  registerTracking(resource: T, waitingOn?: string) {
    this.tracking[
      `${(resource as KubernetesObject).metadata?.name || ''}.${
        (resource as KubernetesObject).metadata?.namespace || ''
      }`
    ] = waitingOn || true;
  }

  unregisterTracking(resource: T) {
    const waitingOn = this.tracking[
      `${(resource as KubernetesObject).metadata?.name || ''}.${
        (resource as KubernetesObject).metadata?.namespace || ''
      }`
    ];
    delete this.tracking[
      `${(resource as KubernetesObject).metadata?.name || ''}.${
        (resource as KubernetesObject).metadata?.namespace || ''
      }`
    ];
    if (waitingOn !== true) {
      this.spinner.info(
        `stopped retrying ${this.operatorService.getFullName({
          resource
        })}`
      );
    }
  }

  isTracking(resource: T) {
    return !!this.tracking[
      `${(resource as KubernetesObject).metadata?.name || ''}.${
        (resource as KubernetesObject).metadata?.namespace || ''
      }`
    ];
  }
}
