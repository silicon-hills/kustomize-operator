import KustomizeOperator from './kustomizeOperator';
import config from './config';
import { Kubectl, Kustomize } from './services';

(async () => {
  const kubectl = new Kubectl();
  const kustomize = new Kustomize();
  await kubectl.help();
  await kustomize.help();
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
