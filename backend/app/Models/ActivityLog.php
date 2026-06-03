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
        'actor_id',
        'event_type',
        'description',
        'subject_type',
        'subject_id',
        'subject_title',
        'metadata',
    ];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}