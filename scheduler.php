<?php

while (true) {
    echo "[" . date('Y-m-d H:i:s') . "] Running schedule:run...\n";
    shell_exec('php artisan reminders:check');
    sleep(60); // чекати 60 секунд
}