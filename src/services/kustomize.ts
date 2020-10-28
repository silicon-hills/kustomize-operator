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
    const result = await this.patch();
    await this.kubectl.apply({ stdin: result, stdout: true });
  }

  async patch(options: Options = {}) {
    const session = new Session();
    const resources = await this.getResources();
    await session.setResources(resources);
    await session.setKustomization(this.kustomization.spec);
    const workdir = await session.getWorkdir();
    const patched = await this.kustomize({ cwd: workdir, ...options });
    await session.cleanup();
    return patched.toString();
  }

  async kustomize(options: Options = {}) {
    return this.run([], options, () => {});
  }

  async run(
    args: string | string[] = [],
    options?: Options,
    cb?: RunCallback
  ): Promise<Result> {
    if (!Array.isArray(args)) args = [args];
    return this.kubectl.run(['kustomize', ...args], options, cb);
  }
}
