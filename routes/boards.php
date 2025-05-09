<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BoardController;

Route::middleware(['auth'])->group(function () {
    // Список всіх дошок
    Route::get('/boards', [BoardController::class, 'index'])->name('boards.index');
    
    // Форма створення нової дошки
    Route::get('/boards/create', [BoardController::class, 'create'])->name('boards.create');
    
    // Збереження нової дошки
    Route::post('/boards', [BoardController::class, 'store'])->name('boards.store');
    
    // Перегляд конкретної дошки
    Route::get('/boards/{board}', [BoardController::class, 'show'])->name('boards.show');
    
    // Форма редагування дошки
    Route::get('/boards/{board}/edit', [BoardController::class, 'edit'])->name('boards.edit');
    
    // Оновлення дошки
    Route::put('/boards/{board}', [BoardController::class, 'update'])->name('boards.update');
    
    // Видалення дошки
    Route::delete('/boards/{board}', [BoardController::class, 'destroy'])->name('boards.destroy');
});