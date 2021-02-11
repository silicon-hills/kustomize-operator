/**
 * Copyright 2020 Silicon Hills LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import KustomizeOperator from './kustomizeOperator';
import config from './config';

const logger = console;

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
})().catch(logger.error);
