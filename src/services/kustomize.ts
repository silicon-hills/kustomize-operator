import fs from 'fs-extra';
import { Options } from 'execa';
import {
  KubernetesListObject,
  KubernetesObject
} from '@kubernetes/client-node';
import { Selector, Kustomization } from '~/types';
import Kubectl, { Output } from './kubectl';
import { RunCallback, Result } from './command';
import Session from './session';
import { resources2String } from './util';

export default class Kustomize {
  constructor(private kustomization: Kustomization) {}

  private kubectl = new Kubectl();

  async help(options?: Options, cb?: RunCallback) {
    return this.run('--help', options, cb);
  }

  // TODO: improve selector match
  async getResources() {
    const resourcesStr = resources2String(
      (this.kustomization.spec?.resources || []).map((resource: Selector) => ({
        apiVersion: resource.version,
        kind: resource.kind,
        metadata: {
          name: resource.name,
          ...(resource.namespace ? { namespace: resource.namespace } : {})
        }
      }))
    );
    return (
      await this.kubectl.get<KubernetesListObject<KubernetesObject>>({
        stdin: resourcesStr,
        output: Output.Json
      })
    ).items;
  }

  async apply() {
    const session = new Session();
    const resources = await this.getResources();
    await session.setResources(resources);
    await session.setKustomization(this.kustomization.spec);
    const queriedResourcesPath = await session.getWorkdir(
      Session.queriedResourcesPath
    );
    const kustomizationPath = await session.getWorkdir(
      Session.kustomizationPath
    );
    const result = (await fs.readFile(queriedResourcesPath)).toString();
    const k = (await fs.readFile(kustomizationPath)).toString();
    await session.cleanup();
    console.log(result);
    console.log(k);
  }

  async run(
    args: string | string[] = [],
    options?: Options,
    cb: RunCallback = () => {}
  ): Promise<Result> {
    if (!Array.isArray(args)) args = [args];
    return this.kubectl.run(['kustomize', ...args], options, cb);
  }
}
