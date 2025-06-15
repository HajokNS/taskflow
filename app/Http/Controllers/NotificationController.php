<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
   


    public function reminder()
    {
        $user = Auth::user();
        $reminders = $user->reminders;

        return Inertia::render('reminder', [
            'reminders' => $reminders
        ]);
    }


}
