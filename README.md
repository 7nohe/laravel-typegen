# Laravel Typegen

## Table of contents
- [Features](#features)
- [Supported Versions](#supported-versions)
- [Installation](#installation)
- [Usage](#usage)
    - [Enum Support](#enum-support)
    - [Laravel Enum Support](#laravel-enum-support)
    - [Use strongly typed `route()` function for ziggy](#use-strongly-typed-route-function-for-ziggy)
    - [Useful types for Laravel](#useful-types-for-laravel)
    - [Form Request types](#form-request-types)
- [Available Options](#available-options)
- [Development](#development)
    - [Setup example project](#setup-example-project)
    - [Debug](#debug)
- [License](#license)


## Features

- Generate types from Laravel's Models
- Support Relationhips
- Support Enum (from PHP8.1)
- Generate types from Laravel's Form Requests
- Generate types for ziggy (Routing)
- Provide useful types for Laravel (e.g. pagination, etc.)

## Supported Versions
This library supports the following versions:

- Laravel 9.x and 10.x
- TypeScript 5.0 and above

## Installation

```bash
$ npm install -D @7nohe/laravel-typegen
```

Laravel Typegen may require installing `doctrine/dbal` via Composer in order to execute the `php artisan model:show` command internally.

```bash
$ composer require doctrine/dbal
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
If you use [Laravel Enum](https://github.com/BenSampo/laravel-enum), use the option `--laravel-enum`.


```json
{
    "scripts": {
        "typegen": "laravel-typegen --laravel-enum"
    },
}
```

### Use strongly typed `route()` function for ziggy

Running the `laravel-typegen` command with the `--ziggy` option will generate route.d.ts.

It helps typing the `route()` function.

```json
{
    "scripts": {
        "typegen": "laravel-typegen --ziggy"
    },
}
```

For example, define the following routes

```php
// routes/web.php
Route::resource('posts', PostsController::class);
```

```bash
$ php artisan route:list
GET|HEAD posts/{post} posts.show › PostsController@show
```

Parameters will be checked strictly based on the route name.

```ts
// in your TypeScript code

// OK
route('posts.show', { post: post.id })

// Error
route('posts.show', { id: post.id })
```

If you have created a project using the `--typescript` option of Laravel Breeze, you need to delete the declaration for the `route()` function in resources/js/types/global.d.ts.

```diff
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { AxiosInstance } from 'axios';
 import ziggyRoute, { Config as ZiggyConfig } from 'ziggy-js';
import { PageProps as AppPageProps } from './';

declare global {
    interface Window {
        axios: AxiosInstance;
    }

    var route: typeof ziggyRoute;
    var Ziggy: ZiggyConfig;
}

- declare module 'vue' {
-     interface ComponentCustomProperties {
-        route: typeof ziggyRoute;
-     }
- }

declare module '@inertiajs/core' {
    interface PageProps extends InertiaPageProps, AppPageProps {}
}
```

### Useful types for Laravel

We provide useful types for Laravel (especially for Inertia).

For example, to return a paginated Inertia response in DashboardController, you can write the following

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $users = User::latest('id')->paginate(5);
        return Inertia::render(
            'Dashboard',
            [
                'users' => $users
            ]
        );
    }
}

```

You can import types already defined by Laravel Typegen.

```vue
<!-- Dashboard.vue -->
<script setup lang="ts">
import { Paginate } from '@7nohe/laravel-typegen';
import { User } from '@/types/model'; // generated types

defineProps<{ users: Paginate<User> }>();

</script>
<template>
    <div>
        <ul>
            <li v-for="user in users.data">- {{ user.name }}({{ user.email }})</li>
        </ul>
        <div class="flex justify-center mt-4 space-x-4">
            <Link v-for="(link, key) in users.links" :key="key" :href="link.url ?? '#'" v-html="link.label" />
        </div>
    </div>
</template>
```

### Form Request types
You can generate types from Laravel's Form Request by executing the command with the `--form-requests` option.

If you have the Form Request class as shown below:

```php
<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'name' => ['string', 'max:255'],
            'email' => ['email', 'max:255', Rule::unique(User::class)->ignore($this->user()->id)],
        ];
    }
}
```

The corresponding TypeScript types will be automatically generated as follows:

```ts
// formRequests.ts
export type ProfileUpdateRequest = {
    name?: string;
    email?: string;
};
```

By using these generated types in combination with HTTP Client libraries like Axios, you can write more type-safe code.

## Available options

```bash
Usage: laravel-typegen [options]

Generate TypeScript types from your Laravel code

Options:
  -V, --version         output the version number
  -o, --output <value>  Output directory (default: "resources/js/types")
  --laravel-enum        Use Laravel Enum (default: false)
  --enum-path <value>   Path to enum files (default: "app/Enums")
  --model-path <value>  Path to model files (default: "app/Models")
  -z, --ziggy           Generate types for ziggy (default: false)
  --vendor-routes       Include routes defined by vendor packages (default: false)
  --ignore-route-dts    Ignore generating route.d.ts (default: false)
  --form-request        Generate types for FormRequests (default: false)
  -h, --help            display help for command
```


## Development

### Setup example project

```bash
$ cd examples/laravel10-app
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

## License
MIT
