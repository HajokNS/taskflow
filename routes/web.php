<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\NotificationController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return redirect(route('boards.index'));
    })->name('dashboard');
});

Route::post('/boards/{board}/upload', [BoardController::class, 'upload'])->name('boards.upload');


Route::get('/reminder', [NotificationController::class, 'reminder'])->middleware(['auth', 'verified']);

Route::get('/gantt', [TaskController::class, 'gantt'])->name('gantt')->middleware(['auth', 'verified']);


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/tasks.php';
require __DIR__.'/boards.php';
require __DIR__.'/tags.php';
require __DIR__.'/calendar.php';
require __DIR__.'/admin.php';