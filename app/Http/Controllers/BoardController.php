<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Services\BoardService;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BoardController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected BoardService $service) {}

    // Список всіх дошок
    public function index(Request $request)
    {
        $userId = Auth::id();
        $search = $request->input('search');
        $sort = $request->input('sort');
        
        // Отримуємо дошки з фільтрами
        $boardsQuery = Board::where('user_id', $userId)
            ->when($search, function($query) use ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($sort, function($query, $sort) {
                switch ($sort) {
                    case 'title_asc':
                        $query->orderBy('title', 'asc');
                        break;
                    case 'title_desc':
                        $query->orderBy('title', 'desc');
                        break;
                    case 'date_asc':
                        $query->orderBy('created_at', 'asc');
                        break;
                    case 'date_desc':
                        $query->orderBy('created_at', 'desc');
                        break;
                    default:
                        $query->latest();
                }
            }, function($query) {
                $query->latest();
            });

        $boards = $boardsQuery->get();
        $favorites = Board::where('user_id', $userId)
                        ->where('is_favorite', true)
                        ->orderBy('created_at', 'desc')
                        ->get();

        return Inertia::render('boards', [ 
            'boards' => $boards,
            'favorites' => $favorites,
            'filters' => [
                'search' => $search,
                'sort' => $sort
            ]
        ]);
    }

    // Форма створення нової дошки
    public function create()
{
    return Inertia::render('boardform', [
        
    ]);
}

    // Збереження нової дошки
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:100',
            'description' => 'nullable|string',
            'color' => 'required|string|size:7',
            'is_favorite' => 'sometimes|boolean',
            'is_public' => 'sometimes|boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'estimated_hours' => 'nullable|numeric|min:0',
            'estimated_budget' => 'nullable|numeric|min:0'
        ]);

        $board = $this->service->createBoard(Auth::id(), $validated);

        return redirect()->route('boards.index', $board)
            ->with('success', 'Дошку успішно створено!');
    }

    // Перегляд конкретної дошки
    public function show(Board $board)
    {
        
        return Inertia::render('board-details', [
            'board' => $this->service->loadBoardData($board),
            'tasks' => $board->tasks()->get()
        ]);
    }

    // Форма редагування дошки
    public function edit(Board $board)
    {
        $this->authorize('update', $board);

        return Inertia::render('Boards/Edit', [
            'board' => $this->service->loadBoardData($board)
        ]);
    }

    // Оновлення дошки
    public function update(Request $request, Board $board)
    {
        $this->authorize('update', $board);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:100',
            'description' => 'nullable|string',
            'color' => 'sometimes|string|size:7',
            'is_favorite' => 'sometimes|boolean',
            'is_public' => 'sometimes|boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'estimated_hours' => 'nullable|numeric|min:0',
            'estimated_budget' => 'nullable|numeric|min:0'
        ]);

        $this->service->updateBoard($board, $validated);

        return redirect()->route('boards.show', $board)
            ->with('success', 'Дошку успішно оновлено!');
    }

    // Видалення дошки
    public function destroy(Board $board)
    {
        $this->authorize('delete', $board);
        
        $this->service->deleteBoard($board);
        
        return redirect()->route('boards.index')
            ->with('success', 'Дошку успішно видалено!');
    }
}