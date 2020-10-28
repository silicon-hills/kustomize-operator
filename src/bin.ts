import YAML from 'yaml';
import fs from 'fs-extra';
import path from 'path';
import KustomizeOperator from './kustomizeOperator';
import config from './config';
import { Kustomization } from './types';
import { Kustomize } from './services';

(async () => {
  const kustomization = YAML.parse(
    (
      await fs.readFile(
        path.resolve(
          __dirname,
          '../config/samples/kustomize_v1alpha1_kustomization.yaml'
        )
      )
    ).toString()
  ) as Kustomization;
  const kustomize = new Kustomize(kustomization);
  await kustomize.apply();
  // const kustomizeOperator = new KustomizeOperator(config);
  function exit(_reason: string) {
    // kustomizeOperator.stop();
    process.exit(0);
  }
  process
    .on('SIGTERM', () => exit('SIGTERM'))
    .on('SIGINT', () => exit('SIGINT'));
  // await kustomizeOperator.start();
})().catch(console.error);
