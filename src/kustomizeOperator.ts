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
import Logger from '~/logger';
import ResourceTracker from '~/resourceTracker';
import { Config } from '~/config';
import { KustomizeService, OperatorService, TrackingService } from '~/services';
import {
  KustomizationResource,
  KustomizationStatus,
  KustomizationStatusPhase,
  OperatorFrameworkProject,
  ResourceGroup,
  ResourceKind,
  ResourceVersion
} from '~/types';

const logger = console;

export const project: OperatorFrameworkProject = YAML.parse(
  fs.readFileSync(path.resolve(__dirname, '../PROJECT')).toString()
);

export default class KustomizeOperator extends Operator {
  static labelNamespace = 'dev.siliconhills.helm2cattle';

  spinner = ora();

  private trackingService = new TrackingService<KustomizationResource>();

  private customObjectsApi: k8s.CustomObjectsApi;

  private resourceTracker = new ResourceTracker<KustomizationResource>();

  private operatorService = new OperatorService();

  constructor(protected config: Config, protected log = new Logger()) {
    super(log);
    this.customObjectsApi = this.kubeConfig.makeApiClient(k8s.CustomObjectsApi);
  }

  protected async deletedKustomization(
    resource: KustomizationResource,
    _meta: ResourceMetaImpl,
    _oldResource?: KustomizationResource
  ) {
    this.trackingService.unregisterTracking(resource);
  }

  protected async addedKustomization(
    resource: KustomizationResource,
    _meta: ResourceMetaImpl,
    _oldResource?: KustomizationResource
  ) {
    try {
      this.trackingService.registerTracking(resource, 'kustomization');
      await this.updateStatus(
        {
          message: 'creating kustomization',
          phase: KustomizationStatusPhase.Pending,
          ready: false
        },
        resource
      );
      const kustomizeService = new KustomizeService(resource);
      await kustomizeService.apply(this.trackingService, resource);
      if (!this.trackingService.isTracking(resource)) return;
      await this.updateStatus(
        {
          message: 'created kustomization',
          phase: KustomizationStatusPhase.Succeeded,
          ready: true
        },
        resource
      );
      this.trackingService.registerTracking(resource);
    } catch (err) {
      if (this.trackingService.isTracking(resource)) {
        await this.updateStatus(
          {
            message: err.message?.toString() || '',
            phase: KustomizationStatusPhase.Failed,
            ready: false
          },
          resource
        );
      }
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
    this.trackingService.registerTracking(resource);
    try {
      await this.updateStatus(
        {
          message: 'updating kustomization',
          phase: KustomizationStatusPhase.Pending,
          ready: false
        },
        resource
      );
      const kustomizeService = new KustomizeService(resource);
      await kustomizeService.apply(this.trackingService, resource);
      if (!this.trackingService.isTracking(resource)) return;
      await this.updateStatus(
        {
          message: 'updated kustomization',
          phase: KustomizationStatusPhase.Succeeded,
          ready: true
        },
        resource
      );
      this.trackingService.registerTracking(resource);
    } catch (err) {
      if (this.trackingService.isTracking(resource)) {
        await this.updateStatus(
          {
            message: err.message?.toString() || '',
            phase: KustomizationStatusPhase.Failed,
            ready: false
          },
          resource
        );
      }
      throw err;
    }
  }

  protected async init() {
    this.watchResource(
      KustomizeOperator.resource2Group(ResourceGroup.Kustomize),
      ResourceVersion.V1alpha1,
      this.operatorService.kind2Plural(ResourceKind.Kustomization),
      async (e) => {
        // spawn as non blocking process
        (async () => {
          const {
            oldResource,
            newResource
          } = this.resourceTracker.rotateResource(e.object);
          try {
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
              case ResourceEventType.Deleted: {
                await this.deletedKustomization(
                  newResource,
                  e.meta,
                  oldResource
                );
                break;
              }
            }
          } catch (err) {
            this.spinner.fail(this.operatorService.getErrorMessage(err));
            if (this.config.debug) logger.error(err);
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
      this.operatorService.kind2Plural(ResourceKind.Kustomization),
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
}
