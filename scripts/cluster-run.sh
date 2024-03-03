#!/usr/bin/env bash

print_in_blue() {
    echo -e "\033[1;34m$1\033[0m"
}

print_in_blue "Creating python virtual environment..." && \
./scripts/create-venv.sh && \

print_in_blue "Delete cluster if exists" && \
./scripts/cluster-delete.sh && \

print_in_blue "Create new cluster..." && \
./scripts/cluster-create.sh && \

print_in_blue "Install cluster..." && \
./scripts/cluster-install.sh && \

print_in_blue "Deploy the app..." && \
./scripts/local-deploy.sh
