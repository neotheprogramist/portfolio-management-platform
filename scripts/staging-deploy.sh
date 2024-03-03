#!/usr/bin/env bash

# Load environment variables
# .env and .env.local files contain environment-specific settings
source k8s/patches/staging/.env && \
source k8s/patches/staging/.env.local && \

# Delete the existing Kubernetes resources defined in the staging patch
# The 'true' command ensures that the script continues even if the delete command fails (e.g., if the resources do not exist)
kubectl \
  --context kubernetes-admin-cluster.visoft.dev@cluster.visoft.dev \
  delete --wait -k k8s/patches/staging \
  || true && \

# Build the Docker image using Podman
# The image is tagged as 'emeth-staging'
podman build \
  --build-arg-file k8s/patches/staging/.env \
  -t emeth-staging:latest \
  . && \

# Push the Docker image
# The image is pushed to the registry specified by the REGISTRY_USER and REGISTRY_PASS environment variables
podman push --creds $REGISTRY_USER:$REGISTRY_PASS emeth-staging:latest registry.visoft.dev/emeth-staging:latest && \

# Create or update the Docker registry secret
# This secret is used by Kubernetes to pull the Docker image from the private registry
kubectl --context kubernetes-admin-cluster.visoft.dev@cluster.visoft.dev \
  -n emeth-staging create secret docker-registry regcred \
  --docker-server registry.visoft.dev \
  --docker-username $REGISTRY_USER \
  --docker-password $REGISTRY_PASS \
  --dry-run=client \
  -o yaml | \
  kubectl --context kubernetes-admin-cluster.visoft.dev@cluster.visoft.dev \
    apply -f - && \

# Apply Kubernetes manifests
# This command creates or updates the Kubernetes resources defined in the staging patch
kubectl --context kubernetes-admin-cluster.visoft.dev@cluster.visoft.dev \
  apply --wait -k k8s/patches/staging
