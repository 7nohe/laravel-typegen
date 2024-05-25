#!/usr/bin/env sh

pnpm run build
cd ./examples/laravel10-app
mv ../../dist ./
SKIP_ARTISAN_COMMAND=true KEEP_LARAVEL_JSON=true node ./dist/src/cli.js --ziggy --form-request
rm -rf ./dist
