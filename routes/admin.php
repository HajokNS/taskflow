<?php

use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin', [AdminController::class, 'index'])->name('admin.index');
    Route::post('/admin/users/{user}', [AdminController::class, 'destroy'])->name('admin.users.destroy');
     Route::put('/admin/users/{user}', [AdminController::class, 'update'])->name('admin.users.update');
});