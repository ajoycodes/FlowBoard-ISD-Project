<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    public const TASK_CREATED = 'task_created';
    public const TASK_MOVED = 'task_moved';
    public const TASK_COMPLETED = 'task_completed';
    public const MEMBER_JOINED = 'member_joined';
    public const PROJECT_CREATED = 'project_created';

    protected $fillable = [
        'workspace_id',
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'description',
    ];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}