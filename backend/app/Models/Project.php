<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Workspace;

class Project extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_ONGOING = 'ongoing';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_ARCHIVED = 'archived';

    public const ACTIVE_STATUSES = [
        self::STATUS_ACTIVE,
        self::STATUS_IN_PROGRESS,
        self::STATUS_ONGOING,
    ];

    protected $fillable = [
        'workspace_id',
        'name',
        'description',
        'status',
    ];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}