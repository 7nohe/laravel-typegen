# Laravel Typegen


## Features

- Generate TypeScript types from Laravel models
- Support Relationhips
- Support Enum (from PHP8.1)

## Installation

```bash
$ npm install -D @7nohe/laravel-typegen
```

## Usage

Edit package.json
```json
{
    "scripts": {
        "typegen": "laravel-typegen"
    },
}
```

```bash
$ npm run typegen
```

### Available options

```bash
Usage: laravel-typegen [options]

Generate TypeScript types from your Laravel models

Options:
  -V, --version         output the version number
  -o, --output <value>  Output directory (default: "resources/ts/types")
  --laravel-enum        Use Laravel Enum (default: false)
  --enum-path <value>   Path to enum files (default: "app/Enums")
  -h, --help            display help for command
```

### Laravel Enum Support
If you use (Laravel Enum)[https://github.com/BenSampo/laravel-enum], use the option `--laravel-enum`.


```json
{
    "scripts": {
        "typegen": "laravel-typegen --laravel-enum"
    },
}
```


## Development

### Setup example project

```bash
$ cd examples/laravel9-app
$ cp .env.example .env
$ docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php81-composer:latest \
    composer install --ignore-platform-reqs
$ ./vendor/bin/sail up -d
$ ./vendor/bin/sail php artisan key:generate
$ ./vendor/bin/sail php artisan migrate --seed
$ ./vendor/bin/sail npm install
```

### Debug

```bash
$ pnpm install
$ sh debug.sh
```
