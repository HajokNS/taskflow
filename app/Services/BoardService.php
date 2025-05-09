<?php

namespace App\Services;

use App\Models\Board;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class BoardService
{
    public function getUserBoards(
        string $userId, 
        ?string $search = null, 
        ?string $sort = null,
        bool $onlyFavorites = false
    ): Collection {
        return Board::where('user_id', $userId)
            ->when($onlyFavorites, fn($q) => $q->where('is_favorite', true))
            ->when($search, function($query) use ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($sort, function($query, $sort) {
                switch ($sort) {
                    case 'title_asc':
                        return $query->orderBy('title');
                    case 'title_desc':
                        return $query->orderByDesc('title');
                    case 'date_asc':
                        return $query->orderBy('created_at');
                    case 'date_desc':
                        return $query->orderByDesc('created_at');
                    default:
                        return $query->latest();
                }
            }, fn($q) => $q->latest())
            ->get();
    }

    public function getFavoriteBoards(string $userId, ?string $search = null): Collection
    {
        return $this->getUserBoards($userId, $search, null, true);
    }

    public function createBoard(string $userId, array $data): Board
    {
        try {
            return Board::create([
                'user_id' => $userId,
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'is_favorite' => $data['is_favorite'] ?? false,
                'color' => $data['color'],
                'is_public' => $data['is_public'] ?? false,
                'start_date' => $data['start_date'] ?? null,
                'end_date' => $data['end_date'] ?? null,
                'estimated_hours' => $data['estimated_hours'] ?? 0,
                'estimated_budget' => $data['estimated_budget'] ?? 0,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create board: ' . $e->getMessage());
            throw $e;
        }
    }

    public function updateBoard(Board $board, array $data): Board
    {
        try {
            $board->update([
                'title' => $data['title'] ?? $board->title,
                'description' => $data['description'] ?? $board->description,
                'is_favorite' => $data['is_favorite'] ?? $board->is_favorite,
                'color' => $data['color'] ?? $board->color,
                'is_public' => $data['is_public'] ?? $board->is_public,
                'start_date' => $data['start_date'] ?? $board->start_date,
                'end_date' => $data['end_date'] ?? $board->end_date,
                'estimated_hours' => $data['estimated_hours'] ?? $board->estimated_hours,
                'estimated_budget' => $data['estimated_budget'] ?? $board->estimated_budget,
            ]);

            return $board->fresh();
        } catch (\Exception $e) {
            Log::error('Failed to update board: ' . $e->getMessage());
            throw $e;
        }
    }

    public function deleteBoard(Board $board): void
    {
        try {
            $board->delete();
        } catch (\Exception $e) {
            Log::error('Failed to delete board: ' . $e->getMessage());
            throw $e;
        }
    }

    public function loadBoardData(Board $board): Board
    {
        return $board->load([
            'user:id,name,email',
            'tasks' => fn($query) => $query,
            'tasks.tags:id,name,color'
        ]);
    }

    public function toggleFavorite(Board $board): Board
    {
        $board->update(['is_favorite' => !$board->is_favorite]);
        return $board->fresh();
    }
}