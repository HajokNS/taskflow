<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use App\Models\Board;
use Illuminate\Support\Str;
use App\Services\BoardService;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BoardController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected BoardService $service) {}

    public function create(Request $request)
    {
        return Inertia::render('boardform');
    }

    public function index(Request $request)
    {
        $userId = Auth::id();
        $search = $request->input('search');
        $sort = $request->input('sort');

        $boardsQuery = Board::where('user_id', $userId)
            ->when($search, fn($q) => $q->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            }))
            ->when($sort, function($q, $sort) {
                return match($sort) {
                    'title_asc' => $q->orderBy('title'),
                    'title_desc' => $q->orderByDesc('title'),
                    'date_asc' => $q->orderBy('created_at'),
                    'date_desc' => $q->orderByDesc('created_at'),
                    default => $q->latest(),
                };
            }, fn($q) => $q->latest());

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

    public function store(Request $request)
{
    $validated = $request->validate([
        'title' => 'required|string|max:100',
        'description' => 'nullable|string',
        'color' => 'required|string|size:7',
        'is_favorite' => 'sometimes|boolean',
        'start_date' => 'nullable|date',
        'end_date' => 'nullable|date|after_or_equal:start_date',
        'estimated_hours' => 'nullable|numeric|min:0',
        'estimated_budget' => 'nullable|numeric|min:0',
        'attachments' => 'nullable|array',
        'attachments.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf,docx|max:10240',
    ]);

    $attachments = [];
    if ($request->hasFile('attachments')) {
        foreach ($request->file('attachments') as $file) {
            // Отримуємо розширення файлу
            $extension = $file->getClientOriginalExtension();
            // Генеруємо унікальне ім'я з розширенням
            $filename = Str::uuid() . '.' . $extension;
            // Зберігаємо файл у папку attachments
            $path = Storage::disk('public')->putFileAs('attachments', $file, $filename);
            // Отримуємо публічний URL
            $url = Storage::url($path);
            // Додаємо до масиву об'єкт файлу
            $attachments[] = [
                'url' => $url,
                'name' => $file->getClientOriginalName(),
                'type' => $file->getClientMimeType()
            ];
        }
    }

    $board = $this->service->createBoard(Auth::id(), $validated, $attachments);

    return redirect()->route('boards.index')
        ->with('success', 'Дошку успішно створено!');
}

    public function show(Board $board)
    {
        return Inertia::render('board-details', [
            'board' => $this->service->loadBoardData($board),
            'tasks' => $board->tasks()->get()
        ]);
    }

    public function edit(Board $board)
    {
        $this->authorize('update', $board);

        return Inertia::render('Boards/Edit', [
            'board' => $this->service->loadBoardData($board)
        ]);
    }

    public function upload(Board $board, Request $request)
    {

        $data = $request->validate(['file' => 'required|file|max:10240']);

        $extension =  $data['file']->getClientOriginalExtension();
            // Генеруємо унікальне ім'я з розширенням
            $filename = Str::uuid() . '.' . $extension;
            // Зберігаємо файл у папку attachments
            $path = Storage::disk('public')->putFileAs('attachments', $data['file'], $filename);
            // Отримуємо публічний URL
            $url = Storage::url($path);
            // Додаємо до масиву об'єкт файлу
            $attachments[] = [
                'url' => $url,
                'name' => $data['file']->getClientOriginalName(),
                'type' => $data['file']->getClientMimeType()
            ];
          $prevAttachments = $board->attachments;
        $board->attachments = array_merge($prevAttachments, $attachments);
        $board->save();

        return redirect()->back()->with('success', 'Файл успішно завантажено');
    }

    public function update(Request $request, Board $board)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:100',
            'description' => 'nullable|string',
            'color' => 'sometimes|string|size:7',
            'is_favorite' => 'sometimes|boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'estimated_hours' => 'nullable|numeric|min:0',
            'estimated_budget' => 'nullable|numeric|min:0',
            'attachments' => 'nullable|array'
        ]);

        // Перевірка чи attachments є у validated, інакше залишаємо попередні
        if (!isset($validated['attachments'])) {
            $validated['attachments'] = $board->attachments;
        }

        $this->service->updateBoard($board, $validated);

        return redirect()->route('boards.show', $board)
            ->with('success', 'Дошку успішно оновлено!');
    }

    public function destroy(Board $board)
    {
        $this->service->deleteBoard($board);

        return redirect()->route('boards.index')
            ->with('success', 'Дошку успішно видалено!');
    }
}
