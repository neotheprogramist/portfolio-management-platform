#!/usr/bin/env bash

# Delete the existing Kubernetes resources defined in the dev patch
# The 'true' command ensures that the script continues even if the delete command fails (e.g., if the resources do not exist)
kubectl delete --wait -k k8s/patches/dev || true && \

# Build the Docker image using Podman
# The image is tagged as 'emeth-dev'
podman build -t emeth-dev . && \

# Push the Docker image
# The image is pushed to the registry specified by the REGISTRY_USER and REGISTRY_PASS environment variables
podman push --tls-verify=false emeth-dev:latest localhost:30500/emeth-dev:latest && \

# Apply Kubernetes manifests
# This command creates or updates the Kubernetes resources defined in the dev patch
kubectl apply --wait -k k8s/patches/dev
