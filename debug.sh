#!/usr/bin/env sh

pnpm run build
cd ./examples/laravel9-app
./vendor/bin/sail bash -c 'sh ./reinstall-packages.sh'
./vendor/bin/sail npm run typegen

