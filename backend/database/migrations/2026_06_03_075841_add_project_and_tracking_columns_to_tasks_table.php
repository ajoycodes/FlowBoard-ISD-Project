<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('tasks', 'project_id')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->foreignId('project_id')
                    ->nullable()
                    ->constrained('projects')
                    ->nullOnDelete();

                $table->index('project_id');
            });
        }

        if (! Schema::hasColumn('tasks', 'created_by')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->foreignId('created_by')
                    ->nullable()
                    ->constrained('users')
                    ->nullOnDelete();

                $table->index('created_by');
            });
        }

        if (! Schema::hasColumn('tasks', 'updated_by')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->foreignId('updated_by')
                    ->nullable()
                    ->constrained('users')
                    ->nullOnDelete();

                $table->index('updated_by');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('tasks', 'updated_by')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->dropForeign(['updated_by']);
                $table->dropIndex(['updated_by']);
                $table->dropColumn('updated_by');
            });
        }

        if (Schema::hasColumn('tasks', 'created_by')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->dropForeign(['created_by']);
                $table->dropIndex(['created_by']);
                $table->dropColumn('created_by');
            });
        }

        if (Schema::hasColumn('tasks', 'project_id')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->dropForeign(['project_id']);
                $table->dropIndex(['project_id']);
                $table->dropColumn('project_id');
            });
        }
    }
};