import YAML from 'yaml';
import { KubernetesObject } from '@kubernetes/client-node';

export function resources2String(resources: KubernetesObject[]): string {
  return resources
    .map((resource: KubernetesObject) => YAML.stringify(resource))
    .join('---\n');
}
