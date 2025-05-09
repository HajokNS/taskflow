<?php

namespace App\Services;

use App\Models\Task;
use App\Models\Board;
use Illuminate\Support\Facades\DB;

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
            ->paginate(15)
            ->withQueryString();
    }

    public function createTask(string $userId, array $data): Task
    {
        return DB::transaction(function () use ($userId, $data) {
            $taskData = [
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'deadline' => $data['deadline'] ?? null,
                'priority' => $data['priority'],
                'risk' => $data['risk'],
                'status' => $data['status'],
                'is_completed' => $data['status'] === 'completed',
                'board_id' => $data['board_id'],
                'user_id' => $userId,
                'parent_id' => $data['parent_id'] ?? null,
            ];

            $task = Task::create($taskData);

            if (!empty($data['tags'])) {
                $task->tags()->sync($data['tags']);
            }

            return $task;
        });
    }

    public function updateTask(Task $task, array $data): void
    {
        DB::transaction(function () use ($task, $data) {
            $updateData = $data;
            
            if (isset($data['status'])) {
                $updateData['is_completed'] = $data['status'] === 'completed';
            }

            $task->update($updateData);

            if (isset($data['tags'])) {
                $task->tags()->sync($data['tags']);
            }
        });
    }

    public function deleteTask(Task $task): void
    {
        DB::transaction(function () use ($task) {
            $task->tags()->detach();
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