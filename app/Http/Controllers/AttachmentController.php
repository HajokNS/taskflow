<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AttachmentController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf,docx,doc,xls,xlsx,ppt,pptx,txt|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->store('public/attachments');
        
        return response()->json([
            'url' => Storage::url($path),
            'name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'type' => $file->getMimeType()
        ]);
    }

    public function download($filename)
    {
        $path = 'public/attachments/' . basename($filename);
        
        if (!Storage::exists($path)) {
            abort(404);
        }

        return Storage::download($path);
    }

    public function delete(Request $request)
    {
        $request->validate([
            'url' => 'required|string'
        ]);

        $path = 'public/attachments/' . basename($request->url);
        
        if (Storage::exists($path)) {
            Storage::delete($path);
            return response()->json(['success' => true]);
        }

        return response()->json(['error' => 'File not found'], 404);
    }
}