<?php declare(strict_types=1);

namespace App\LaravelEnums;

use BenSampo\Enum\Enum;

/**
 * @method static static Male()
 * @method static static Female()
 * @method static static Other()
 */
final class GenderType extends Enum
{
    const Male = 'Male';
    const Female = 'Female';
    const Other = 'Other';
}
