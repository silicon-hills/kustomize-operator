import fs from 'fs-extra';
import path from 'path';
import { KubernetesObject } from '@kubernetes/client-node';
import { resources2String } from './util';
import pkg from '~/../package.json';

export default class Session {
  private _workdir: string | undefined;

  public static queriedResourcesPath = 'resources/_queried.yaml';

  async getWorkdir(...paths: string[]) {
    if (!this._workdir) this._workdir = await fs.mkdtemp(pkg.name);
    const result = path.resolve(this._workdir, ...paths);
    await fs.mkdirp(result.replace(/[^/]+$/g, ''));
    return result;
  }

  async setResources(resources: KubernetesObject[]) {
    const resourcesPath = await this.getWorkdir(Session.queriedResourcesPath);
    await fs.writeFile(resourcesPath, resources2String(resources));
  }

  async cleanup() {
    if (!this._workdir) return;
    await fs.remove(this._workdir);
    this._workdir = undefined;
  }
}
