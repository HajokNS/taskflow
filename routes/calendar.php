<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CalendarController;

Route::middleware(['auth', 'verified'])->group(function () {
   
    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar');
    
});