<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReminderController;


Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('reminders', ReminderController::class);
    
    // Additional reminder routes if needed
    Route::get('/upcoming-reminders', [ReminderController::class, 'upcoming']);
});