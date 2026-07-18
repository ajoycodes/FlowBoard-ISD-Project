<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    public const STATUS_PLANNING = 'planning';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_ON_HOLD = 'on_hold';
    public const STATUS_COMPLETED = 'completed';

    public const ACTIVE_STATUSES = [
        self::STATUS_PLANNING,
        self::STATUS_ACTIVE,
        self::STATUS_ON_HOLD,
    ];

    protected $fillable = [
        'workspace_id',
        'name',
        'description',
        'status',
        'created_by',
    ];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function invitations()
    {
        return $this->hasMany(ProjectInvitation::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}