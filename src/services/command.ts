import execa, { ExecaChildProcess, ExecaReturnValue, Options } from 'execa';
import { HashMap } from '../types';

export default abstract class Command {
  protected config: CommandConfig;

  protected abstract command: string;

  protected execa = execa;

  constructor(config: Partial<CommandConfig> = {}) {
    this.config = {
      debug: false,
      ...config
    };
  }

  async run(
    args: string | string[] = [],
    options: Options = {},
    cb: RunCallback = (p: ExecaChildProcess) => {
      p.stderr?.pipe(process.stderr);
      p.stdout?.pipe(process.stdout);
    }
  ): Promise<Result> {
    if (this.config.debug) {
      console.debug('$', [this.command, ...args].join(' '));
    }
    if (!Array.isArray(args)) args = [args];
    const p = execa(this.command, args, options);
    cb(p);
    return this.smartParse(await p);
  }

  smartParse(result: ExecaReturnValue<string>): Result {
    try {
      return JSON.parse(result.stdout);
    } catch (err) {
      return result.stdout as string;
    }
  }
}

export type Result = string | HashMap;

export interface CommandConfig {
  debug: boolean;
}

export type RunCallback = (p: ExecaChildProcess) => any;
