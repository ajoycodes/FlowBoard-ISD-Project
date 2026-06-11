<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('workspace_members') && ! Schema::hasTable('workspace_user')) {
            DB::statement('ALTER TABLE workspace_members RENAME TO workspace_user');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('workspace_user') && ! Schema::hasTable('workspace_members')) {
            DB::statement('ALTER TABLE workspace_user RENAME TO workspace_members');
        }
    }
};