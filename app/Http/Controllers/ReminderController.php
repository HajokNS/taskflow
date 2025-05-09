<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReminderRequest;
use App\Models\Reminder;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReminderController extends Controller
{
    public function index()
    {
        $reminders = Reminder::with('task')
            ->whereHas('task', fn($query) => $query->where('user_id', Auth::id()))
            ->orderBy('remind_at')
            ->get();

        return response()->json($reminders);
    }

    public function store(Request $request)
    {
        $reminder = Reminder::create([
            'task_id' => $request->task_id,
            'remind_at' => $request->remind_at,
            'message' => $request->message,
        ]);

        return response()->json($reminder, 201);
    }

    public function upcoming()
    {
        $reminders = Reminder::with('task')
            ->whereHas('task', fn($query) => $query->where('user_id', Auth::id()))
            ->where('remind_at', '>=', now())
            ->orderBy('remind_at')
            ->get();

        return response()->json($reminders);
    }

    public function destroy(Reminder $reminder)
    {
        $reminder->delete();
        return response()->json(null, 204);
    }
}