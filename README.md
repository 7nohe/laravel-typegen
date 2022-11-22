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

### Enum Support

We also support php8.1 enums.

```php
<!-- app/Enums/GenderType.php -->
<?php

namespace App\Enums;

enum GenderType: string
{
    case Male = 'Male';
    case Female = 'Female';
    case Other = 'Other';
}
```

Then, cast model attributes to enums.

```php
<!-- app/Models/User.php -->
<?php

namespace App\Models;
use App\Enums\GenderType;

class User extends Authenticatable
{
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'gender'            => GenderType::class,
    ];
}
```

This library will generate the following TypeScript types:

```typescript
export type User = {
    id: number;
    name: string;
    email: string;
    gender: GenderType;
    email_verified_at?: string;
    created_at?: string;
    updated_at?: string;
    posts?: Post[];
};
export enum GenderType {
    Male = "Male",
    Female = "Female",
    Other = "Other"
}
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

## Available options

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
