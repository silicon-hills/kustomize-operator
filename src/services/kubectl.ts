import { ExecaChildProcess, Options } from 'execa';
import { Readable } from 'stream';
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

  async get<T = any>(
    getOptions: Partial<GetOptions> | string = {},
    options?: Options
  ): Promise<T> {
    let { stdin } = getOptions as Partial<GetOptions>;
    if (typeof getOptions === 'string') stdin = getOptions;
    const { file, output, ignoreNotFound } = {
      ignoreNotFound: true,
      ...((stdin ? { file: '-' } : {}) as Partial<GetOptions>),
      ...(typeof getOptions === 'string'
        ? ({} as Partial<GetOptions>)
        : getOptions)
    };
    return this.run<T>(
      [
        'get',
        ...(file ? ['-f', file] : []),
        ...(output ? ['-o', output] : []),
        ...(ignoreNotFound ? ['--ignore-not-found'] : [])
      ],
      options,
      stdin
        ? (p: ExecaChildProcess) => {
            const stream = Readable.from([stdin]);
            if (p.stdin) stream.pipe(p.stdin);
          }
        : undefined
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
  ignoreNotFound?: boolean;
  output?: Output;
  stdin?: string;
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
