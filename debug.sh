#!/usr/bin/env sh

pnpm run build
cd ./examples/laravel9-app
./vendor/bin/sail restart laravel.test
./vendor/bin/sail bash -c "rm -rf /var/www/html/node_modules/@7nohe/laravel-typegen"
./vendor/bin/sail bash -c "cp -R /laravel-typegen/dist /var/www/html/node_modules/@7nohe/laravel-typegen"
./vendor/bin/sail npm run typegen
# ./vendor/bin/sail npm run typegen:laravel-enum

