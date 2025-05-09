<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Tag;
use App\Services\TagsService;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;


class TaskTagController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected TagsService $service) {}

    public function attach(Task $task, Tag $tag)
    {
        $this->authorize('attachToTask', $tag);
        $this->service->addTagToTask($tag, $task);
        return back()->with('success', 'Tag added to task');
    }

    public function detach(Task $task, Tag $tag)
    {
        $this->authorize('attachToTask', $tag);
        $this->service->removeTagFromTask($tag, $task);
        return back()->with('success', 'Tag removed from task');
    }
}