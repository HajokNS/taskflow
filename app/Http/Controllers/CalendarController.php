<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Task;
use App\Models\Board;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    
    public function index(Request $request)
    {
        $tasks = Task::with(['board', 'tags'])
            ->where(function($query) {
                $query->whereNotNull('start_date')
                    ->orWhereNotNull('end_date');
            })
            ->where('user_id', $request->user()->id)
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'start_date' => $task->start_date,
                    'end_date' => $task->end_date,
                    'priority' => $task->priority,
                    'status' => $task->status,
                    'is_completed' => $task->is_completed,
                    'board' => [
                        'id' => $task->board->id,
                        'title' => $task->board->title,
                        'color' => $task->board->color,
                    ],
                    'tags' => $task->tags->map(fn($tag) => [
                        'id' => $tag->id,
                        'name' => $tag->name,
                        'color' => $tag->color,
                    ]),
                ];
            });

        $boards = Board::whereNotNull('end_date')
            ->where('user_id', $request->user()->id)
            ->get()
            ->map(function ($board) {
                return [
                    'id' => $board->id,
                    'title' => $board->title,
                    'color' => $board->color,
                    'end_date' => $board->end_date,
                    'is_favorite' => $board->is_favorite,
                ];
            });

        return Inertia::render('calendar', [
            'tasks' => $tasks,
            'boards' => $boards,
            'filters' => $request->only(['search']),
        ]);
    }
}