<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

// Приклад команди
Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Твоя команда reminders:check
Artisan::command('reminders:check', function () {
    $this->info('Checking reminders...');
    // Тут твоя логіка перевірки нагадувань
})->purpose('Check reminders every 5 minutes');

// Планування розкладу
Schedule::command('reminders:check')->everyMinute();

