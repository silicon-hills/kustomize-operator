import YAML from 'yaml';
import fs from 'fs-extra';
import path from 'path';
import KustomizeOperator from './kustomizeOperator';
import config from './config';
import { Kubectl, Kustomize } from './services';
import { Kustomization } from './types';

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

  const kubectl = new Kubectl();
  const kustomize = new Kustomize(kustomization);
  await kubectl.help();
  await kustomize.help();
  await kustomize.apply();
  const kustomizeOperator = new KustomizeOperator(config);
  function exit(_reason: string) {
    kustomizeOperator.stop();
    process.exit(0);
  }
  process
    .on('SIGTERM', () => exit('SIGTERM'))
    .on('SIGINT', () => exit('SIGINT'));
  // await kustomizeOperator.start();
})().catch(console.error);
