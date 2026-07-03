<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'user_id',
        'content',
    ];

    /**
     * Note belongs to a workspace
     */
    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Note belongs to a user (creator)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
