<?php

namespace App\Services;

use App\Models\Tag;
use App\Models\Task;
use Illuminate\Support\Facades\DB;

class TagsService
{
    /**
     * Отримати всі теги користувача
     */
    public function getUserTags(int $userId)
    {
        return Tag::where('user_id', $userId)
            ->orderBy('name')
            ->get();
    }

    /**
     * Створити новий тег
     */
    public function createTag(int $userId, array $data): Tag
    {
        return DB::transaction(function () use ($userId, $data) {
            $tag = Tag::create(array_merge($data, [
                'user_id' => $userId
            ]));

            return $tag;
        });
    }

    /**
     * Оновити існуючий тег
     */
    public function updateTag(Tag $tag, array $data): Tag
    {
        return DB::transaction(function () use ($tag, $data) {
            $tag->update($data);
            return $tag->fresh();
        });
    }

    /**
     * Видалити тег
     */
    public function deleteTag(Tag $tag): void
    {
        DB::transaction(function () use ($tag) {
            // Видалити зв'язки з задачами перед видаленням тега
            $tag->tasks()->detach();
            $tag->delete();
        });
    }

    /**
     * Додати тег до задачі
     */
    public function addTagToTask(Tag $tag, Task $task): void
    {
        DB::transaction(function () use ($tag, $task) {
            if (!$task->tags()->where('tag_id', $tag->id)->exists()) {
                $task->tags()->attach($tag);
            }
        });
    }

    /**
     * Видалити тег з задачі
     */
    public function removeTagFromTask(Tag $tag, Task $task): void
    {
        DB::transaction(function () use ($tag, $task) {
            $task->tags()->detach($tag);
        });
    }

    /**
     * Синхронізувати теги задачі
     */
    public function syncTaskTags(Task $task, array $tagIds): void
    {
        DB::transaction(function () use ($task, $tagIds) {
            $task->tags()->sync($tagIds);
        });
    }

    /**
     * Отримати популярні теги (найчастіше використовувані)
     */
    public function getPopularTags(int $userId, int $limit = 5)
    {
        return Tag::where('user_id', $userId)
            ->withCount('tasks')
            ->orderBy('tasks_count', 'desc')
            ->limit($limit)
            ->get();
    }
}