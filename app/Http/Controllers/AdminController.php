<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
   
    public function index()
    {
        $users = User::all()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at->toDateTimeString(),
            ];
        });

        return Inertia::render('admin', [
            'users' => $users
        ]);
    }

    public function destroy(User $user)
    {
        // Не можна видалити себе
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Ви не можете видалити самого себе');
        }

        // Не можна видалити адмінів
        if ($user->is_admin) {
            return back()->with('error', 'Не можна видаляти адміністраторів');
        }

        $user->delete();

        return response()->json(['success' => 'Successfuly deleted']);
    }
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$user->id,
            'is_admin' => 'required|boolean'
        ]);

        $user->update($validated);

        return redirect()->back()->with('success', 'Дані користувача оновлено');
    }

}