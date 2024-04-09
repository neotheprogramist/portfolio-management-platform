#!/usr/bin/env bash

set -euo pipefail

source .venv/bin/activate && \
ansible-playbook kind/install.yaml && \
deactivate
