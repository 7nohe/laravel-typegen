<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static Public()
 * @method static static Private()
 */
final class PostType extends Enum
{
    const Public = 10;
    const Private = 20;
}
