<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Services\TagsService;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;

class TagController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected TagsService $service) {}

    public function index()
    {
        return inertia('tags', [
            'tags' => $this->service->getUserTags(Auth::id())
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'color' => 'required|string|size:7'
        ]);

        $tag = Tag::create($validated);

        return back()->with([
            'tags' => Tag::all(),
            'flash' => ['message' => 'Тег успішно створено', 'type' => 'success']
        ]);
    }

    public function update(Request $request, Tag $tag)
    {
       
        $validated = $request->validate([
            'name' => 'sometimes|string|max:20',
            'color' => 'sometimes|string|size:7'
        ]);

        $this->service->updateTag($tag, $validated);

        return back()->with('success', 'Tag updated successfully');
    }

    public function destroy(Tag $tag)
    {
       
        $this->service->deleteTag($tag);
        return back()->with('success', 'Tag deleted successfully');
    }
}