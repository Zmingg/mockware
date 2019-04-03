#!/usr/bin/env bash

# find path
bin_dir=$(dirname $0)
cd ${bin_dir}
work_dir=$(dirname $(readlink $0))
cd ${work_dir}
cd ../../
chmod -R 755 ./

# run mock commander
./node_modules/.bin/ts-node ./src/commander/index.ts $*