<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->enum('priority', ['low', 'medium', 'high'])->nullable();
            $table->enum('risk', ['low', 'medium', 'high'])->nullable();
            $table->enum('status', ['not_started', 'active', 'overdue', 'completed'])->default('not_started');
            $table->boolean('is_completed')->default(false);
            $table->json('attachments')->nullable(); 
            $table->foreignUuid('board_id')->constrained('boards')->onDelete('cascade');
            $table->uuid('parent_id')->nullable();
            $table->timestamps();


            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('parent_id')->references('id')->on('tasks')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
