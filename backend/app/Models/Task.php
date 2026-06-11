<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    // Status constants
    public const STATUS_TODO = 'todo';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_REVIEW = 'review';
    public const STATUS_DONE = 'done';

    // Mass assignable fields
    protected $fillable = [
        'workspace_id',
        'project_id',
        'assigned_to',
        'created_by',
        'updated_by',
        'title',
        'description',
        'status',
        'priority',
        'deadline',
    ];

    /**
     * Task belongs to a workspace
     */
    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Task belongs to a project
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * User assigned to this task
     */
    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * User who created this task
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * User who last updated this task
     */
    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}