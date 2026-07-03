<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // projects may already have workspace_id when created via
        // 2026_06_03_061542_create_projects_table on a fresh database
        if (Schema::hasColumn('projects', 'workspace_id')) {
            return;
        }

        Schema::table('projects', function (Blueprint $table) {
            $table->foreignId('workspace_id')
                ->nullable()
                ->constrained('workspaces')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('projects', 'workspace_id')) {
            return;
        }

        Schema::table('projects', function (Blueprint $table) {
            $table->dropConstrainedForeignId('workspace_id');
        });
    }
};