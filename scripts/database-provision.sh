#!/usr/bin/env bash

surreal import \
    --conn http://localhost:8000 \
    --user root --pass root \
    --ns test --db test \
    fixtures/nonce-schema.surql && \

surreal import \
    --conn http://localhost:8000 \
    --user root --pass root \
    --ns test --db test \
    fixtures/tokens.surql
