<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'title',
        'description',
        'start_date',
        'end_date',
        'priority',
        'risk',
        'status',
        'is_completed',
        'user_id',
        'board_id',
        'parent_id',
        'attachments'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_completed' => 'boolean',
        'attachments' => 'array'
    ];

    protected static function booted()
    {
        static::saving(function ($task) {
            $task->autoUpdateStatus();
        });
    }

    public function autoUpdateStatus()
    {
        // Якщо статус вручну встановлено як "completed" - не змінюємо
        if ($this->status === 'completed') {
            $this->is_completed = true;
            return;
        }

        $now = now();
        $startDate = $this->start_date;
        $endDate = $this->end_date;

        if (!$startDate && !$endDate) {
            $this->status = 'not_started';
        } elseif ($startDate && $now->lt($startDate)) {
            $this->status = 'not_started';
        } elseif ($endDate && $now->gt($endDate)) {
            $this->status = 'overdue';
        } else {
            $this->status = 'active';
        }

        $this->is_completed = ($this->status === 'completed');
    }

    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            'not_started' => 'Не розпочато',
            'active' => 'Активне',
            'overdue' => 'Прострочене',
            'completed' => 'Завершене',
            default => $this->status,
        };
    }

    // Відносини
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    public function parent()
    {
        return $this->belongsTo(Task::class, 'parent_id');
    }

    public function subtasks() 
    {
        return $this->hasMany(Task::class, 'parent_id');
    }

    public function reminders()
    {
        return $this->hasMany(Reminder::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'task_tag');
    }

    public function markAsCompleted()
    {
        $this->update([
            'status' => 'completed',
            'is_completed' => true,
            'completed_at' => now()
        ]);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function getPriorityAttribute($value)
    {
        return $value ?? 'medium';
    }

    public function getRiskAttribute($value)
    {
        return $value ?? 'medium';
    }

    public function getStatusAttribute($value)
    {
        return $value ?? 'not_started';
    }
}