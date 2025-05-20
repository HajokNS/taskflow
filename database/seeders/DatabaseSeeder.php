<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
        'name' => 'Денис',
        'email' => 'c.chornopyskyi.denys@student.uzhnu.edu.ua',
        'password' => Hash::make('123123123'),
        'is_admin' => true,
    ]);
    }
}
