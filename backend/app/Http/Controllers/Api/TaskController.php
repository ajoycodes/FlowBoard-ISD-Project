<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'project_id' => ['required', 'exists:projects,id'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string'],
            'priority' => ['nullable', 'string'],
            'deadline' => ['nullable', 'date'],
        ]);

        $project = Project::query()
            ->with('workspace')
            ->where('id', $validated['project_id'])
            ->whereHas('workspace.members', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->first();

        if (! $project) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to create a task for this project.',
            ], 403);
        }

        if (! empty($validated['assigned_to'])) {
            $isAssigneeWorkspaceMember = $project->workspace
                ->members()
                ->where('users.id', $validated['assigned_to'])
                ->exists();

            if (! $isAssigneeWorkspaceMember) {
                return response()->json([
                    'success' => false,
                    'message' => 'Assigned user must be a member of this workspace.',
                ], 422);
            }
        }

        $task = Task::create([
            'workspace_id' => $project->workspace_id,
            'project_id' => $project->id,
            'assigned_to' => $validated['assigned_to'] ?? null,
            'created_by' => $user->id,
            'updated_by' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? Task::STATUS_TODO,
            'priority' => $validated['priority'] ?? 'medium',
            'deadline' => $validated['deadline'] ?? null,
        ]);

        $task->load('project:id,name,workspace_id');

        return response()->json([
            'success' => true,
            'message' => 'Task created successfully.',
            'data' => [
                'id' => $task->id,
                'workspace_id' => $task->workspace_id,
                'project_id' => $task->project_id,
                'title' => $task->title,
                'description' => $task->description,
                'status' => $task->status,
                'priority' => $task->priority,
                'deadline' => $task->deadline,
                'assigned_to' => $task->assigned_to,
                'created_by' => $task->created_by,
                'updated_by' => $task->updated_by,
                'project' => $task->project ? [
                    'id' => $task->project->id,
                    'name' => $task->project->name,
                    'workspace_id' => $task->project->workspace_id,
                ] : null,
                'created_at' => $task->created_at,
                'updated_at' => $task->updated_at,
            ],
        ], 201);
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $user = $request->user();

        $isWorkspaceMember = $task->workspace()
            ->whereHas('members', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->exists();

        if (! $isWorkspaceMember) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to update this task.',
            ], 403);
        }

        $validated = $request->validate([
            'assigned_to' => ['nullable', 'exists:users,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string'],
            'priority' => ['nullable', 'string'],
            'deadline' => ['nullable', 'date'],
        ]);

        if (! empty($validated['assigned_to'])) {
            $isAssigneeWorkspaceMember = $task->workspace
                ->members()
                ->where('users.id', $validated['assigned_to'])
                ->exists();

            if (! $isAssigneeWorkspaceMember) {
                return response()->json([
                    'success' => false,
                    'message' => 'Assigned user must be a member of this workspace.',
                ], 422);
            }
        }

        $task->update([
            'assigned_to' => array_key_exists('assigned_to', $validated)
                ? $validated['assigned_to']
                : $task->assigned_to,

            'title' => $validated['title'] ?? $task->title,
            'description' => array_key_exists('description', $validated)
                ? $validated['description']
                : $task->description,

            'status' => $validated['status'] ?? $task->status,
            'priority' => $validated['priority'] ?? $task->priority,

            'deadline' => array_key_exists('deadline', $validated)
                ? $validated['deadline']
                : $task->deadline,

            'updated_by' => $user->id,
        ]);

        $task->load('project:id,name,workspace_id');

        return response()->json([
            'success' => true,
            'message' => 'Task updated successfully.',
            'data' => [
                'id' => $task->id,
                'workspace_id' => $task->workspace_id,
                'project_id' => $task->project_id,
                'title' => $task->title,
                'description' => $task->description,
                'status' => $task->status,
                'priority' => $task->priority,
                'deadline' => $task->deadline,
                'assigned_to' => $task->assigned_to,
                'created_by' => $task->created_by,
                'updated_by' => $task->updated_by,
                'project' => $task->project ? [
                    'id' => $task->project->id,
                    'name' => $task->project->name,
                    'workspace_id' => $task->project->workspace_id,
                ] : null,
                'created_at' => $task->created_at,
                'updated_at' => $task->updated_at,
            ],
        ]);
    }
}