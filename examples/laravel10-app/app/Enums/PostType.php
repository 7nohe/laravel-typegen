<?php declare(strict_types=1);

namespace App\Enums;

enum PostType: int
{
    case Public = 10;
    case Private = 20;
}
