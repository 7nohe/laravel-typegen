<?php declare(strict_types=1);

namespace App\Enums\Common;

enum Status: string
{
    case DRAFT = 'Draft';
    case IN_REVIEW = 'InReview';
    case PUBLISHED = 'Published';
}
