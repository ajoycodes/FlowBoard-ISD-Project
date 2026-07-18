<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardTaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'workspace_id' => $this->workspace_id,
            'title' => $this->title,
            'status' => $this->status,
            'priority' => $this->priority,
            'deadline' => $this->deadline,
            'assigned_user' => $this->whenLoaded('assignedUser', function () {
                return $this->assignedUser ? [
                    'id' => $this->assignedUser->id,
                    'name' => $this->assignedUser->name,
                ] : null;
            }),
            'project' => $this->whenLoaded('project', function () {
                return $this->project ? [
                    'id' => $this->project->id,
                    'name' => $this->project->name,
                    'workspace_id' => $this->project->workspace_id,
                ] : null;
            }),
            'updated_at' => $this->updated_at,
        ];
    }
}