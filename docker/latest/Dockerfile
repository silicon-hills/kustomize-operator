# Copyright 2020 Silicon Hills LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM node:12-alpine AS builder

RUN apk add --no-cache \
  make

WORKDIR /tmp/app

COPY package*.json Makefile *.mk /tmp/app/
RUN mkdir src && make install

FROM node:12-alpine

RUN apk add --no-cache \
  bash \
  curl \
  make
RUN curl -LO \
  https://storage.googleapis.com/kubernetes-release/release/v1.19.0/bin/linux/amd64/kubectl && \
  chmod +x ./kubectl && \
  mv ./kubectl /usr/local/bin/kubectl
RUN curl -L \
  "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" \
  | bash && \
  mv ./kustomize /usr/local/bin/kustomize

COPY docker/latest/entrypoint.sh /usr/local/sbin/entrypoint

RUN chmod +x /usr/local/sbin/entrypoint

COPY --from=builder /tmp/app /opt/app

WORKDIR /opt/app

COPY . /opt/app/
RUN make +build

ENV DEBUG_OPERATOR=false

ENTRYPOINT [ "/usr/local/sbin/entrypoint" ]
