<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Board extends Model
{
    use HasUuids, HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'title',
        'description',
        'color',
        'is_favorite',
        'is_public',
        'user_id',
        'start_date',
        'end_date',
        'estimated_hours',
        'estimated_budget',
        'views_count',
    ];

    protected $casts = [
        'is_favorite' => 'boolean',
        'is_public' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'estimated_hours' => 'float',
        'estimated_budget' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->id = \Illuminate\Support\Str::uuid();
            $model->color = $model->color ?? '#'.dechex(rand(0x000000, 0xFFFFFF));
        });
    }
}