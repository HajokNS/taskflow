<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('boards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('color', 7)->default('#FFFFFF');
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->boolean('is_favorite')->default(false);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->json('attachments')->nullable();
            $table->decimal('estimated_hours', 8, 2)->nullable();
            $table->decimal('estimated_budget', 12, 2)->nullable(); 
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('boards');
    }
};