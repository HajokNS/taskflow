<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TaskController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return redirect(route('boards.index'));
    })->name('dashboard');
});

Route::get('/gantt', [TaskController::class, 'gantt'])->name('gantt');


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/tasks.php';
require __DIR__.'/boards.php';
require __DIR__.'/tags.php';
require __DIR__.'/calendar.php';
require __DIR__.'/admin.php';