<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();

            $table->foreignId('workspace_id')
                ->constrained('workspaces')
                ->cascadeOnDelete();

            $table->string('name');
            $table->text('description')->nullable();
            $table->string('status')->default('active');

            $table->timestamps();

            $table->index('workspace_id');
            $table->index('status');
            $table->index('updated_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};