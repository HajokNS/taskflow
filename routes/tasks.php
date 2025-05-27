<?php

use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
   
    Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::get('/tasks/create', [TaskController::class, 'create'])->name('tasks.create');
    Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store'); 
    Route::get('/tasks/{task}', [TaskController::class, 'show'])->name('tasks.show');
    Route::put('/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::post('/tasks/{task}/complete', [TaskController::class, 'complete'])->name('tasks.complete');
        Route::post('/tasks/{task}/complete-subtask', [TaskController::class, 'completeSubtask'])->name('tasks.completeSubtask');
    Route::get('/tasks/{task}/edit', [TaskController::class, 'edit'])->name('tasks.edit');

    Route::get('/boards/{board}', function ($board) {
        return Inertia::render('Boards/Show', [
            'board_id' => $board
        ]);
    })->name('boards.show');
});