// +build !ignore_autogenerated

/*


Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// Code generated by controller-gen. DO NOT EDIT.

package v1alpha1

import (
	runtime "k8s.io/apimachinery/pkg/runtime"
	"sigs.k8s.io/kustomize/api/types"
)

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *Kustomization) DeepCopyInto(out *Kustomization) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ObjectMeta.DeepCopyInto(&out.ObjectMeta)
	in.Spec.DeepCopyInto(&out.Spec)
	out.Status = in.Status
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new Kustomization.
func (in *Kustomization) DeepCopy() *Kustomization {
	if in == nil {
		return nil
	}
	out := new(Kustomization)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *Kustomization) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KustomizationList) DeepCopyInto(out *KustomizationList) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ListMeta.DeepCopyInto(&out.ListMeta)
	if in.Items != nil {
		in, out := &in.Items, &out.Items
		*out = make([]Kustomization, len(*in))
		for i := range *in {
			(*in)[i].DeepCopyInto(&(*out)[i])
		}
	}
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KustomizationList.
func (in *KustomizationList) DeepCopy() *KustomizationList {
	if in == nil {
		return nil
	}
	out := new(KustomizationList)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *KustomizationList) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KustomizationSpec) DeepCopyInto(out *KustomizationSpec) {
	*out = *in
	if in.CommonAnnotations != nil {
		in, out := &in.CommonAnnotations, &out.CommonAnnotations
		*out = make(map[string]string, len(*in))
		for key, val := range *in {
			(*out)[key] = val
		}
	}
	if in.CommonLabels != nil {
		in, out := &in.CommonLabels, &out.CommonLabels
		*out = make(map[string]string, len(*in))
		for key, val := range *in {
			(*out)[key] = val
		}
	}
	if in.ConfigMapGenerator != nil {
		in, out := &in.ConfigMapGenerator, &out.ConfigMapGenerator
		*out = make([]types.ConfigMapArgs, len(*in))
		for i := range *in {
			(*in)[i].DeepCopyInto(&(*out)[i])
		}
	}
	if in.Crds != nil {
		in, out := &in.Crds, &out.Crds
		*out = make([]string, len(*in))
		copy(*out, *in)
	}
	if in.GeneratorOptions != nil {
		in, out := &in.GeneratorOptions, &out.GeneratorOptions
		*out = new(types.GeneratorOptions)
		(*in).DeepCopyInto(*out)
	}
	if in.Images != nil {
		in, out := &in.Images, &out.Images
		*out = make([]types.Image, len(*in))
		copy(*out, *in)
	}
	if in.Patches != nil {
		in, out := &in.Patches, &out.Patches
		*out = make([]types.Patch, len(*in))
		for i := range *in {
			(*in)[i].DeepCopyInto(&(*out)[i])
		}
	}
	if in.PatchesJson6902 != nil {
		in, out := &in.PatchesJson6902, &out.PatchesJson6902
		*out = make([]types.PatchJson6902, len(*in))
		for i := range *in {
			(*in)[i].DeepCopyInto(&(*out)[i])
		}
	}
	if in.PatchesStrategicMerge != nil {
		in, out := &in.PatchesStrategicMerge, &out.PatchesStrategicMerge
		*out = make([]types.PatchStrategicMerge, len(*in))
		copy(*out, *in)
	}
	if in.Replicas != nil {
		in, out := &in.Replicas, &out.Replicas
		*out = make([]types.Replica, len(*in))
		copy(*out, *in)
	}
	if in.Resources != nil {
		in, out := &in.Resources, &out.Resources
		*out = make([]types.Target, len(*in))
		copy(*out, *in)
	}
	if in.SecretGenerator != nil {
		in, out := &in.SecretGenerator, &out.SecretGenerator
		*out = make([]types.SecretArgs, len(*in))
		for i := range *in {
			(*in)[i].DeepCopyInto(&(*out)[i])
		}
	}
	if in.Vars != nil {
		in, out := &in.Vars, &out.Vars
		*out = make([]types.Var, len(*in))
		copy(*out, *in)
	}
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KustomizationSpec.
func (in *KustomizationSpec) DeepCopy() *KustomizationSpec {
	if in == nil {
		return nil
	}
	out := new(KustomizationSpec)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KustomizationStatus) DeepCopyInto(out *KustomizationStatus) {
	*out = *in
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KustomizationStatus.
func (in *KustomizationStatus) DeepCopy() *KustomizationStatus {
	if in == nil {
		return nil
	}
	out := new(KustomizationStatus)
	in.DeepCopyInto(out)
	return out
}
