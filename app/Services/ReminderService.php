<?php

namespace App\Services;

use App\Models\Reminder;
use App\Models\Task;
use Illuminate\Support\Carbon;

class ReminderService
{
    public function createReminder(array $data): Reminder
    {
        $task = Task::where('id', $data['task_id'])
                   ->where('user_id', $data['user_id'])
                   ->firstOrFail();

        return Reminder::create([
            'task_id' => $task->id,
            'user_id' => $task->user_id,
            'remind_at' => Carbon::parse($data['remind_at']),
            'message' => $data['message'] ?? $this->generateSimpleTaskMessage($task)
        ]);
    }

    protected function generateSimpleTaskMessage(Task $task): string
    {
        return "Завдання: {$task->title}";
    }

    public function createRemindersForCloseDeadlines(): int
    {
        $tasks = Task::whereNotNull('end_date')
                   ->where('end_date', '<=', now()->addMinutes(5))
                   ->where('end_date', '>=', now())
                   ->get();

        $createdCount = 0;

        foreach ($tasks as $task) {
            if (!$this->hasActiveReminder($task)) {
                $this->createReminder([
                    'task_id' => $task->id,
                    'user_id' => $task->user_id,
                    'remind_at' => $task->end_date,
                    'message' => $this->generateSimpleTaskMessage($task)
                ]);
                $createdCount++;
            }
        }
        
        return $createdCount;
    }

    protected function hasActiveReminder(Task $task): bool
    {
        return Reminder::where('task_id', $task->id)
                     ->where('remind_at', '>=', now())
                     ->exists();
    }

    public function getUpcomingReminders($userId)
    {
        return Reminder::with('task')
                     ->where('user_id', $userId)
                     ->where('remind_at', '>=', now())
                     ->orderBy('remind_at')
                     ->get();
    }
}