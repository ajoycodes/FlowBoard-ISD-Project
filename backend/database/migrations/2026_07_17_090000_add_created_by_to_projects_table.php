<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('projects', 'created_by')) {
            return;
        }

        Schema::table('projects', function (Blueprint $table) {
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('projects', 'created_by')) {
            return;
        }

        Schema::table('projects', function (Blueprint $table) {
            $table->dropConstrainedForeignId('created_by');
        });
    }
};
