<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TaskTagController;

Route::middleware(['auth'])->group(function () {
    // Основні маршрути для тегів
    Route::get('/tags', [TagController::class, 'index'])->name('tags.index');
    Route::post('/tags', [TagController::class, 'store'])->name('tags.store');
    Route::put('/tags/{tag}', [TagController::class, 'update'])->name('tags.update');
    Route::delete('/tags/{tag}', [TagController::class, 'destroy'])->name('tags.destroy');

    // Маршрути для роботи з тегами задач
    Route::post('/tasks/{task}/tags/{tag}', [TaskTagController::class, 'attach'])->name('task-tag.attach');
    Route::delete('/tasks/{task}/tags/{tag}', [TaskTagController::class, 'detach'])->name('task-tag.detach');
});