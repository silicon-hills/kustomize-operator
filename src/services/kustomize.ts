import { Options } from 'execa';
import Kubectl from './kubectl';
import { RunCallback, Result } from './command';

export default class Kustomize {
  private kubectl = new Kubectl();

  async help(options?: Options, cb?: RunCallback) {
    return this.run('--help', options, cb);
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
