#!/bin/bash

# build contract schema
cwtools build ../aioracle-contract -s

# build contract
cwtools build ../aioracle-contract -o packages/contracts-build/data/

# build sdk typescript code
cwtools gents ../aioracle-contract/ -o packages/contracts-sdk/src/