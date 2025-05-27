<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Models\Task;
use App\Models\Board;
use App\Services\TaskService;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TaskController extends Controller
{
    use AuthorizesRequests;

    protected $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    public function create(Request $request)
    {   
        $boardId = $request->query('board_id');

$board = Board::findOrFail($boardId); // витягуємо дошку

        $tasks = Task::where('user_id', $request->user()->id)
                    ->where('board_id', $boardId)
                    ->whereNull('parent_id')
                    ->get();

        $tags = Tag::all();

        return Inertia::render('task-form', [
            'tasks' => $tasks,
            'board_id' => $request->input('board_id'),
            'tags' => $tags,
            'board' => $board, // <-- оце додали
        ]);
    }

    public function index(Request $request)
    {
        $tasks = $this->taskService->getUserTasks($request->user()->id, $request->all());
        
        return Inertia::render('tasks', [
            'tasks' => $tasks,
            'filters' => $request->only(['status', 'priority', 'board']),
            'availableTags' => Tag::all(),
        ]);
    }

     public function store(Request $request)
    {   
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'priority' => 'required|in:low,medium,high',
            'risk' => 'required|in:low,medium,high',
            'board_id' => 'required|exists:boards,id',
            'parent_id' => 'nullable',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ]);
    
        DB::beginTransaction();
        try {
            $task = Task::create([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'start_date' => $validated['start_date'] ?? null,
                'end_date' => $validated['end_date'] ?? null,
                'priority' => $validated['priority'],
                'risk' => $validated['risk'],
                'board_id' => $validated['board_id'],
                'user_id' => $request->user()->id,
                'parent_id' => $validated['parent_id'] ?? null,
            ]);
    
            if (!empty($validated['tags'])) {
                $task->tags()->attach($validated['tags']);
            }
    
            DB::commit();
    
            return response()->json(['message' => 'Created successfully']);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed']);
        }
    }

    public function show(Task $task)
    {
        $task->load('board', 'subtasks', 'tags', 'reminders');
        $tags = Tag::all();

        return Inertia::render('tasks', [
            'task' => $task,
            'boards' => $this->taskService->getUserBoards($task->user_id),
            'tags' => $tags,
        ]);
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date', // Changed from deadline
        'end_date' => 'nullable|date|after_or_equal:start_date', // New field
            'priority' => 'sometimes|required|in:low,medium,high',
            'risk' => 'sometimes|required|in:low,medium,high',
            'status' => 'sometimes|required|in:active,completed,archived',
            'board_id' => 'sometimes|required|exists:boards,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ]);

        DB::beginTransaction();
        try {
            $this->taskService->updateTask($task, $validated);
            
            $task->refresh()->load('tags', 'board');
            
            DB::commit();
    
            return redirect('/tasks')->with('success', 'Task updated successfully');
    
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to update task: ' . $e->getMessage());
        }
    }

    public function calendar(Request $request)
{
    $tasks = Task::where('user_id', $request->user()->id)
        ->with('board', 'tags')
        ->get();

    $boards = Board::where('user_id', $request->user()->id)->get();

    return Inertia::render('calendar', [
        'tasks' => $tasks,
        'boards' => $boards,
    ]);
}

    public function destroy(Task $task)
    {
        $this->taskService->deleteTask($task);
        return redirect()->route('tasks.index')->with('success', 'Task deleted successfully');
    }

    public function edit(Task $task)
    {
        $task->load('board', 'tags');
        $availableTags = Tag::all();

        return Inertia::render('edit-task', [
            'task' => $task,
            'availableTags' => $availableTags,
        ]);
    }

    public function gantt(Request $request)
{
    $tasks = Task::where('user_id', $request->user()->id)
        ->get()
        ->map(function ($task) {
            return [
                'id' => $task->id,
                'name' => $task->title,
                'start' => optional($task->start_date)->toDateString(),
                'end' => optional($task->end_date)->toDateString() ?? now()->addDays(7)->toDateString(),
                'progress' => $task->is_completed ? 100 : 0,
                'dependencies' => '',
            ];
        });

    return Inertia::render('gantt', [
        'tasks' => $tasks
    ]);
}

    public function complete(Task $task)
    {
        $this->taskService->markAsCompleted($task);
        return redirect()->back()->with('success', 'Task marked as completed');
    }

    public function completeSubtask(Task $task)
    {
        $this->taskService->markAsCompleted($task);
        return response()->json('completed successfuly');
    }
}