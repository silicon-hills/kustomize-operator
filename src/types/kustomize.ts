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

import { KubernetesObject } from '@kubernetes/client-node';
import { HashMap } from '.';

export interface Gvk {
  group?: string; // string `json:"group,omitempty" yaml:"group,omitempty"`
  kind?: string; // string `json:"kind,omitempty" yaml:"kind,omitempty"`
  version?: string; // string `json:"version,omitempty" yaml:"version,omitempty"`
}

export interface GeneratorOptions {
  annotations?: HashMap<string>; // map[string]string `json:"annotations,omitempty" yaml:"annotations,omitempty"`
  disableNameSuffixHash?: boolean; // bool `json:"disableNameSuffixHash,omitempty" yaml:"disableNameSuffixHash,omitempty"`
  labels?: HashMap<string>; // map[string]string `json:"labels,omitempty" yaml:"labels,omitempty"`
}

export interface KvPairSources {
  envSources?: string[]; // []string `json:"envs,omitempty" yaml:"envs,omitempty"`
  fileSources?: string[]; // []string `json:"files,omitempty" yaml:"files,omitempty"`
  literalSources?: string[]; // []string `json:"literals,omitempty" yaml:"literals,omitempty"`
}

// KvPairSources; // `json:",inline,omitempty" yaml:",inline,omitempty"`
export interface GeneratorArgs extends KvPairSources {
  namespace?: string; // `json:"namespace,omitempty" yaml:"namespace,omitempty"`
  name?: string; // string `json:"name,omitempty" yaml:"name,omitempty"`
  behavior?: string; // string `json:"behavior,omitempty" yaml:"behavior,omitempty"`
  options?: GeneratorOptions; // *GeneratorOptions `json:"options,omitempty" yaml:"options,omitempty"`
}

// GeneratorArgs `json:",inline,omitempty" yaml:",inline,omitempty"`
export interface ConfigMapArgs extends GeneratorArgs {}

export interface Image {
  digest?: string; // string `json:"digest,omitempty" yaml:"digest,omitempty"`
  name?: string; // string `json:"name,omitempty" yaml:"name,omitempty"`
  newName?: string; // string `json:"newName,omitempty" yaml:"newName,omitempty"`
  newTag?: string; // string `json:"newTag,omitempty" yaml:"newTag,omitempty"`
}

// resid.Gvk `json:",inline,omitempty" yaml:",inline,omitempty"`
export interface Target extends Gvk {
  apiVersion?: string; // string `json:"apiVersion,omitempty" yaml:"apiVersion,omitempty"`
  name: string; // string `json:"name" yaml:"name"`
  namespace?: string; // string `json:"namespace,omitempty" yaml:"namespace,omitempty"`
}

// resid.Gvk `json:",inline,omitempty" yaml:",inline,omitempty"`
export interface Selector extends Gvk {
  annotationSelector?: string; // string `json:"annotationSelector,omitempty" yaml:"annotationSelector,omitempty"`
  labelSelector?: string; // string `json:"labelSelector,omitempty" yaml:"labelSelector,omitempty"`
  name?: string; // string `json:"name,omitempty" yaml:"name,omitempty"`
  namespace?: string; // string `json:"namespace,omitempty" yaml:"namespace,omitempty"`
}

export interface Patch {
  patch?: string; // string `json:"patch,omitempty" yaml:"patch,omitempty"`
  path?: string; // string `json:"path,omitempty" yaml:"path,omitempty"`
  target?: Selector; // *Selector `json:"target,omitempty" yaml:"target,omitempty"`
}

// resid.Gvk `json:",inline,omitempty" yaml:",inline,omitempty"`
export interface PatchTarget extends Gvk {
  name: string; // string `json:"name" yaml:"name"`
  namespace?: string; // string `json:"namespace,omitempty" yaml:"namespace,omitempty"`
}

export interface PatchJson6902 {
  patch?: string; // string `json:"patch,omitempty" yaml:"patch,omitempty"`
  path?: string; // string `json:"path,omitempty" yaml:"path,omitempty"`
  target: PatchTarget; // *PatchTarget `json:"target" yaml:"target"`
}

// type PatchStrategicMerge string
export type PatchStrategicMerge = string;

export interface Replica {
  count: number; // int64 `json:"count" yaml:"count"`
  name?: string; // string `json:"name,omitempty" yaml:"name,omitempty"`
}

// GeneratorArgs `json:",inline,omitempty" yaml:",inline,omitempty"`
export interface SecretArgs extends GeneratorArgs {
  type: string; // string `json:"type,omitempty" yaml:"type,omitempty"`
}

export interface FieldSelector {
  fieldPath?: string; // string `json:"fieldPath,omitempty" yaml:"fieldPath,omitempty"`
}

export interface Var {
  fieldRef?: FieldSelector; // FieldSelector `json:"fieldref,omitempty" yaml:"fieldref,omitempty"`
  name: string; // string `json:"name" yaml:"name"`
  objRef: Target; // Target `json:"objref" yaml:"objref"`
}

export interface KustomizationSpec {
  commonAnnotations?: HashMap<string>; // map[string]string `json:"commonAnnotations,omitempty" yaml:"commonAnnotations,omitempty"`
  commonLabels?: HashMap<string>; // map[string]string `json:"commonLabels,omitempty" yaml:"commonLabels,omitempty"`
  configMapGenerator?: ConfigMapArgs[]; // []kustomizeTypes.ConfigMapArgs `json:"configMapGenerator,omitempty" yaml:"configMapGenerator,omitempty"`
  configuration?: TransformerConfig; // TransformerConfig `json:"configuration,omitempty" yaml:"configuration,omitempty"`
  crds?: string[]; // []string `json:"crds,omitempty" yaml:"crds,omitempty"`
  retryTimeout?: number; // string `json:"retryTimeout,omitempty" yaml:"retryTimeout,omitempty"`
  generatorOptions?: any; // *kustomizeTypes.GeneratorOptions `json:"generatorOptions,omitempty" yaml:"generatorOptions,omitempty"`
  images?: Image[]; // []kustomizeTypes.Image `json:"images,omitempty" yaml:"images,omitempty"`
  namePrefix?: string; // string `json:"namePrefix,omitempty" yaml:"namePrefix,omitempty"`
  nameSuffix?: string; // string `json:"nameSuffix,omitempty" yaml:"nameSuffix,omitempty"`
  namespace?: string; // string `json:"namespace,omitempty" yaml:"namespace,omitempty"`
  patches?: Patch[]; // []kustomizeTypes.Patch `json:"patches,omitempty" yaml:"patches,omitempty"`
  patchesJson6902?: PatchJson6902[]; // []kustomizeTypes.PatchJson6902 `json:"patchesJson6902,omitempty" yaml:"patchesJson6902,omitempty"`
  patchesStrategicMerge?: PatchStrategicMerge[]; // []kustomizeTypes.PatchStrategicMerge `json:"patchesStrategicMerge,omitempty" yaml:"patchesStrategicMerge,omitempty"`
  replicas?: Replica[]; // []kustomizeTypes.Replica `json:"replicas,omitempty" yaml:"replicas,omitempty"`
  resources?: Selector[]; // []*kustomizeTypes.Selector `json:"resources,omitempty" yaml:"resources,omitempty"`
  secretGenerator?: SecretArgs[]; // []kustomizeTypes.SecretArgs `json:"secretGenerator,omitempty" yaml:"secretGenerator,omitempty"`
  vars?: Var[]; // []kustomizeTypes.Var `json:"vars,omitempty" yaml:"vars,omitempty"`
}

export interface KustomizationResource extends KubernetesObject {
  spec?: KustomizationSpec;
  status?: KustomizationStatus;
}

export interface KustomizationStatus {
  lastUpdateTime?: string; // string `json:"lastUpdateTime,omitempty"`
  message?: string; // string `json:"message,omitempty"`
  phase?: KustomizationStatusPhase; // string `json:"phase,omitempty"`
  ready?: boolean; // bool `json:"ready,omitempty"`
}

export interface TransformerConfig {
  // nameReference?: NbrSlice; // nbrSlice      `json:"nameReference,omitempty" yaml:"nameReference,omitempty"`
  commonAnnotations?: FsSlice; // kustomizeTypes.FsSlice `json:"commonAnnotations,omitempty" yaml:"commonAnnotations,omitempty"`
  commonLabels?: FsSlice; // kustomizeTypes.FsSlice `json:"commonLabels,omitempty" yaml:"commonLabels,omitempty"`
  images?: FsSlice; // kustomizeTypes.FsSlice `json:"images,omitempty" yaml:"images,omitempty"`
  namePrefix?: FsSlice; // kustomizeTypes.FsSlice `json:"namePrefix,omitempty" yaml:"namePrefix,omitempty"`
  nameSpace?: FsSlice; // kustomizeTypes.FsSlice `json:"namespace,omitempty" yaml:"namespace,omitempty"`
  nameSuffix?: FsSlice; // kustomizeTypes.FsSlice `json:"nameSuffix,omitempty" yaml:"nameSuffix,omitempty"`
  replicas?: FsSlice; // kustomizeTypes.FsSlice `json:"replicas,omitempty" yaml:"replicas,omitempty"`
  varReference?: FsSlice; // kustomizeTypes.FsSlice `json:"varReference,omitempty" yaml:"varReference,omitempty"`
}

// type FsSlice []FieldSpec
export type FsSlice = FieldSpec[];

// resid.Gvk `json:",inline,omitempty" yaml:",inline,omitempty"`
export interface FieldSpec extends Gvk {
  createIfNotPresent: boolean; // bool `json:"create,omitempty" yaml:"create,omitempty"`
  path: string; // string `json:"path,omitempty" yaml:"path,omitempty"`
}

// export interface NbrSlice {}

export enum KustomizationStatusPhase {
  Failed = 'Failed',
  Pending = 'Pending',
  Succeeded = 'Succeeded',
  Unknown = 'Unknown'
}

export enum ResourceGroup {
  Kustomize = 'kustomize'
}

export enum ResourceKind {
  Kustomization = 'Kustomization'
}

export enum ResourceVersion {
  V1alpha1 = 'v1alpha1'
}
