<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/password');
    }

    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ], [
            'current_password.required' => 'Поточний пароль обов\'язковий',
            'current_password.current_password' => 'Невірний поточний пароль',
            'password.required' => 'Новий пароль обов\'язковий',
            'password.confirmed' => 'Паролі не співпадають',
            'password.min' => 'Пароль має містити мінімум :min символів',
            'password.mixed' => 'Пароль має містити великі та малі літери',
            'password.letters' => 'Пароль має містити літери',
            'password.numbers' => 'Пароль має містити цифри',
            'password.symbols' => 'Пароль має містити спеціальні символи',
            'password.uncompromised' => 'Цей пароль було викрадено в інших сервісах',
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back();
    }
}
