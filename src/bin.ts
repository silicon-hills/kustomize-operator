import KustomizeOperator from './kustomizeOperator';
import config from './config';

(async () => {
  const kustomizeOperator = new KustomizeOperator(config);
  function exit(_reason: string) {
    kustomizeOperator.stop();
    process.exit(0);
  }
  process
    .on('SIGTERM', () => exit('SIGTERM'))
    .on('SIGINT', () => exit('SIGINT'));
  await kustomizeOperator.start();
})().catch(console.error);
