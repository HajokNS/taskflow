<?php

namespace App\Console\Commands;

use App\Services\ReminderService;
use Illuminate\Console\Command;

class CheckReminders extends Command
{
    protected $signature = 'reminders:check';
    protected $description = 'Check and send upcoming reminders';

    public function handle(ReminderService $reminderService)
    {
        logger(111111111);
        $reminderService->createRemindersForCloseDeadlines();
        $this->info('Reminders checked successfully');
    }
}