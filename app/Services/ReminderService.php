<?php

namespace App\Services;

use App\Models\Reminder;
use App\Models\Task;
use Illuminate\Support\Carbon;

class ReminderService
{
    public function createReminder(array $data): Reminder
    {
        $task = Task::findOrFail($data['task_id']);

        return Reminder::create([
            'task_id' => $data['task_id'],
            'user_id' => $data['user_id'],
            'remind_at' => $data['remind_at'],
            'message' => $data['message'] ?? $this->generateDefaultMessage(Task::find($data['task_id']))
        ]);
    }

    public function updateReminder(Reminder $reminder, array $data): Reminder
    {
        $reminder->update($data);
        return $reminder->fresh();
    }

    public function deleteReminder(Reminder $reminder): void
    {
        $reminder->delete();
    }

    public function getUpcomingReminders($userId)
    {
        return Reminder::with('task')
            ->whereHas('task', function($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->where('remind_at', '>=', now())
            ->orderBy('remind_at')
            ->get();
    }

    public function getTasksWithCloseDeadlines()
    {
        return Task::with('user')
            ->whereNotNull('deadline')
            ->where('deadline', '<=', now()->addMinutes(5))
            ->where('deadline', '>=', now())
            ->get();
    }

    public function createRemindersForCloseDeadlines()
    {
        $tasks = $this->getTasksWithCloseDeadlines();
        
        foreach ($tasks as $task) {
            // Перевіряємо, чи ще не існує нагадування для цієї задачі
            $existingReminder = Reminder::where('task_id', $task->id)
                ->where('remind_at', '>=', now())
                ->first();
            
            if (!$existingReminder) {
                $this->createReminder([
                    'task_id' => $task->id,
                    'user_id' => $task->user_id,
                    'remind_at' => $task->deadline,
                    'message' => $this->generateDefaultMessage($task)
                ]);
            }
        }
        
        return count($tasks);
    }

    protected function generateDefaultMessage(Task $task): string
    {
        $minutesLeft = Carbon::now()->diffInMinutes($task->deadline);
        return "До дедлайну задачі '{$task->title}' залишилось {$minutesLeft} хвилин!";
    }

    public function getRemindersForTask(Task $task)
    {
        return $task->reminders()
            ->orderBy('remind_at')
            ->get();
    }

    public function deletePastReminders()
    {
        Reminder::where('remind_at', '<', now())
            ->delete();
    }
}