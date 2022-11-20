<?php

namespace App\Models;

use App\Enums\PostType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $casts = [
        'type'            => PostType::class,
    ];

    public function author()
    {
        return $this->belongsTo(User::class);
    }
}
