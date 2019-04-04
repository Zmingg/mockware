#!/usr/bin/env bash

# find path
bin_dir=$(dirname $0)
cd ${bin_dir}
work_dir=$(dirname $(readlink $0))
cd ${work_dir}
cd ../
sudo chmod -R 777 ./

# run mock commander
node ./dist/commander/index.js $*