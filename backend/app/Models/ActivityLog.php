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
    public const TASK_DELETED = 'task_deleted';
    public const MEMBER_JOINED = 'member_joined';
    public const PROJECT_CREATED = 'project_created';
    public const NOTE_CREATED = 'note_created';

    public static function record(
        int $workspaceId,
        int $userId,
        string $action,
        string $entityType,
        ?int $entityId,
        string $description
    ): self {
        return self::create([
            'workspace_id' => $workspaceId,
            'user_id' => $userId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'description' => $description,
        ]);
    }

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