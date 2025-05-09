<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_statistics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->unsignedInteger('total_created')->default(0);
            $table->unsignedInteger('total_completed')->default(0);
            $table->unsignedInteger('total_active')->default(0);
            $table->unsignedInteger('total_deleted')->default(0);
            $table->timestamp('last_update');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_statistics');
    }
};
