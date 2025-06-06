<?php

namespace App\Services;

use App\Models\Task;
use App\Models\Board;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TaskService
{
    public function getUserTasks(string $userId, array $filters = [])
    {
        return Task::query()
            ->forUser($userId)
            ->when($filters['status'] ?? null, fn($query, $status) => 
                $query->where('status', $status))
            ->when($filters['priority'] ?? null, fn($query, $priority) => 
                $query->where('priority', $priority))
            ->when($filters['board'] ?? null, fn($query, $boardId) => 
                $query->where('board_id', $boardId))
            ->with(['board', 'tags', 'parent'])
            ->orderBy('created_at', 'desc')
            ->paginate(9999999999)
            ->withQueryString();
    }

    public function createTask(string $userId, array $data, array $attachments = []): Task
    {
        return DB::transaction(function () use ($userId, $data, $attachments) {
            $taskData = [
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'start_date' => $data['start_date'] ?? null,
                'end_date' => $data['end_date'] ?? null,
                'priority' => $data['priority'],
                'risk' => $data['risk'],
                'board_id' => $data['board_id'],
                'user_id' => $userId,
                'parent_id' => $data['parent_id'] ?? null,
                'attachments' => $attachments, // Додаємо вкладення
            ];

            $task = Task::create($taskData);

            if (!empty($data['tags'])) {
                $task->tags()->sync($data['tags']);
            }

            return $task->load('tags', 'board');
        });
    }

    public function updateTask(Task $task, array $data): Task
    {
        return DB::transaction(function () use ($task, $data) {
            $updateData = [
                'title' => $data['title'] ?? $task->title,
                'description' => $data['description'] ?? $task->description,
                'start_date' => $data['start_date'] ?? $task->start_date,
                'end_date' => $data['end_date'] ?? $task->end_date,
                'priority' => $data['priority'] ?? $task->priority,
                'risk' => $data['risk'] ?? $task->risk,
                'board_id' => $data['board_id'] ?? $task->board_id,
                'attachments' => $data['attachments'] ?? $task->attachments, // Оновлюємо вкладення
            ];

            if (isset($data['status']) && $data['status'] === 'completed') {
                $updateData['status'] = 'completed';
                $updateData['is_completed'] = true;
            }

            $task->update($updateData);

            if (isset($data['start_date']) || isset($data['end_date'])) {
                $task->autoUpdateStatus();
                $task->save();
            }

            if (array_key_exists('tags', $data)) {
                $task->tags()->sync($data['tags'] ?? []);
            }

            return $task->fresh()->load('tags', 'board');
        });
    }

    public function deleteTask(Task $task): void
    {
        DB::transaction(function () use ($task) {
            $task->tags()->detach();
            
            if ($task->subtasks()->exists()) {
                $task->subtasks()->delete();
            }
            
            $task->delete();
        });
    }

    public function markAsCompleted(Task $task): void
    {
        $task->markAsCompleted();
    }

    public function getUserBoards(string $userId)
    {
        return Board::where('user_id', $userId)
            ->orderBy('is_favorite', 'desc')
            ->orderBy('title')
            ->get(['id', 'title']);
    }
}