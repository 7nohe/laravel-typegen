<?php declare(strict_types=1);

namespace App\Enums;

enum GenderType: string
{
    case Male = 'Male';
    case Female = 'Female';
    case Other = 'Other';
}
