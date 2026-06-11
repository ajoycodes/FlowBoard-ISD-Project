<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('workspaces', 'title') && ! Schema::hasColumn('workspaces', 'name')) {
            DB::statement('ALTER TABLE workspaces RENAME COLUMN title TO name');
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('workspaces', 'name') && ! Schema::hasColumn('workspaces', 'title')) {
            DB::statement('ALTER TABLE workspaces RENAME COLUMN name TO title');
        }
    }
};