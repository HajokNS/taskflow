<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

use Illuminate\Support\Facades\DB;

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
        $tasks = Task::where('user_id', $request->user()->id)
                    ->where('board_id', $boardId)
                    ->whereNull('parent_id')
                    ->get();

        return inertia('task-form', [
            'tasks' => $tasks,
            'board_id' => $request->input('board_id'),
        ]);
    }

    /**
     * Display a listing of tasks.
     */
    public function index(Request $request)
    {
        $tasks = $this->taskService->getUserTasks($request->user()->id, $request->all());
        
        return inertia('tasks', [
            'tasks' => $tasks,
            'filters' => $request->only(['status', 'priority', 'board'])
        ]);
    }

    /**
     * Store a newly created task.
     */
    public function store(Request $request)
    {   
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
            'priority' => 'required|in:low,medium,high',
            'risk' => 'required|in:low,medium,high',
            'status' => 'required|in:active,completed,archived',
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
                'deadline' => $validated['deadline'] ?? null,
                'priority' => $validated['priority'],
                'risk' => $validated['risk'],
                'status' => $validated['status'],
                'is_completed' => $validated['status'] === 'completed',
                'board_id' => $validated['board_id'],
                'user_id' => $request->user()->id,
                'parent_id' => $validated['parent_id'] ?? null,
            ]);
    
            if (!empty($validated['tags'])) {
                $task->tags()->attach($validated['tags']);
            }
    
            DB::commit();
    
            return response()->json([
                'message' => 'Task created successfully',
                'task' => $task
            ], 201);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create task',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified task.
     */
    public function show(Task $task)
    {
        $this->authorize('view', $task);
        
        $task->load('board', 'subtasks', 'tags', 'reminders');
        
        return inertia('Tasks/Show', [
            'task' => $task,
            'boards' => $this->taskService->getUserBoards($task->user_id)
        ]);
    }

    /**
     * Update the specified task.
     */
    public function update(Request $request, Task $task)
    {
        $this->authorize('update', $task);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
            'priority' => 'sometimes|in:low,medium,high',
            'status' => 'sometimes|in:active,completed,archived',
            'board_id' => 'sometimes|exists:boards,id',
        ]);

        $this->taskService->updateTask($task, $validated);

        return back()->with('success', 'Task updated successfully');
    }

    /**
     * Remove the specified task.
     */
    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);
        
        $this->taskService->deleteTask($task);

        return redirect()->route('tasks.index')
            ->with('success', 'Task deleted successfully');
    }

    /**
     * Mark task as completed
     */
    public function complete(Task $task)
    {
        $this->authorize('update', $task);
        
        $this->taskService->markAsCompleted($task);

        return back()->with('success', 'Task marked as completed');
    }
}