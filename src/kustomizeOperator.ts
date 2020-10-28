import Operator, {
  ResourceEventType,
  ResourceMetaImpl
} from '@dot-i/k8s-operator';
import YAML from 'yaml';
import fs from 'fs-extra';
import ora from 'ora';
import path from 'path';
import Logger from './logger';
import { Config } from './config';
import { Kustomize } from './services';
import { OperatorFrameworkProject, KustomizationResource } from './types';

export const project: OperatorFrameworkProject = YAML.parse(
  fs.readFileSync(path.resolve(__dirname, '../PROJECT')).toString()
);

export default class KustomizeOperator extends Operator {
  static labelNamespace = 'dev.siliconhills.helm2cattle';

  spinner = ora();

  constructor(protected config: Config, protected log = new Logger()) {
    super(log);
  }

  protected async addedKustomization(
    resource: KustomizationResource,
    _meta: ResourceMetaImpl
  ) {
    const kustomize = new Kustomize(resource);
    await kustomize.apply();
  }

  protected async modifiedKustomization(
    resource: KustomizationResource,
    _meta: ResourceMetaImpl
  ) {
    const kustomize = new Kustomize(resource);
    await kustomize.apply();
  }

  protected async init() {
    this.watchResource(
      KustomizeOperator.resource2Group(ResourceGroup.Kustomize),
      ResourceVersion.V1alpha1,
      KustomizeOperator.kind2plural(ResourceKind.Kustomization),
      async (e) => {
        try {
          if (e.type === ResourceEventType.Deleted) return;
          switch (e.type) {
            case ResourceEventType.Added: {
              await this.addedKustomization(e.object, e.meta);
              break;
            }
            case ResourceEventType.Modified: {
              await this.modifiedKustomization(e.object, e.meta);
              break;
            }
          }
        } catch (err) {
          console.log(err);
          this.spinner.fail(
            [
              err.message || '',
              err.body?.message || err.response?.body?.message || ''
            ].join(': ')
          );
          if (this.config.debug) this.log.error(err);
        }
      }
    ).catch(console.error);
  }

  static resource2Group(group: string) {
    return `${group}.${project.domain}`;
  }

  static kind2plural(kind: string) {
    const lowercasedKind = kind.toLowerCase();
    if (lowercasedKind[lowercasedKind.length - 1] === 's') {
      return lowercasedKind;
    }
    return `${lowercasedKind}s`;
  }
}

export enum ResourceGroup {
  Kustomize = 'kustomize'
}

export enum ResourceKind {
  Kustomization = 'Kustomization'
}

export enum ResourceVersion {
  V1alpha1 = 'v1alpha1'
}
