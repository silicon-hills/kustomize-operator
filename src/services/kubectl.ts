import { Options } from 'execa';
import Command, { RunCallback } from './command';

export default class Kubectl extends Command {
  command = 'kubectl';

  async help(options?: Options, cb?: RunCallback) {
    return this.run('--help', options, cb);
  }

  async apply(
    applyOptions: Partial<ApplyOptions> = {},
    options?: Options,
    cb: RunCallback = () => {}
  ) {
    const { file } = { ...applyOptions };
    return this.run(['apply', ...(file ? ['-f', file] : [])], options, cb);
  }

  async get(
    getOptions: Partial<GetOptions> = {},
    options?: Options,
    cb: RunCallback = () => {}
  ) {
    const { file, output } = { ...getOptions };
    return this.run(
      ['get', ...(file ? ['-f', file] : []), ...(output ? ['-o', output] : [])],
      options,
      cb
    );
  }

  async delete(
    deleteOptions: Partial<DeleteOptions> = {},
    options?: Options,
    cb: RunCallback = () => {}
  ) {
    const { file } = { ...deleteOptions };
    return this.run(['delete', ...(file ? ['-f', file] : [])], options, cb);
  }

  async kustomize(args: string[] = []) {
    return this.run(['kustomize', ...args]);
  }
}

export interface GetOptions {
  file?: string;
  output?: Output;
}

export interface ApplyOptions {
  file?: string;
}

export interface DeleteOptions {
  file?: string;
}

export enum Output {
  Yaml = 'yaml',
  Json = 'json'
}
