#!/usr/bin/env bash

source .venv/bin/activate && \
ansible-playbook kind/install.yaml && \
deactivate
