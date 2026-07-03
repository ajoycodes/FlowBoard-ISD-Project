<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function index(Request $request, Workspace $workspace): JsonResponse
    {
        $user = $request->user();

        $isWorkspaceMember = $workspace->members()
            ->where('users.id', $user->id)
            ->exists();

        if (! $isWorkspaceMember) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to view tasks in this workspace.',
            ], 403);
        }

        $tasks = $workspace->tasks()
            ->with([
                'assignedUser:id,name,email',
                'createdBy:id,name,email',
                'updatedBy:id,name,email',
            ])
            ->latest('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Tasks fetched successfully.',
            'data' => $tasks,
        ]);
    }

    public function store(Request $request, Workspace $workspace): JsonResponse
    {
        $user = $request->user();

        $isWorkspaceMember = $workspace->members()
            ->where('users.id', $user->id)
            ->exists();

        if (! $isWorkspaceMember) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to create tasks in this workspace.',
            ], 403);
        }

        $validated = $request->validate([
            'assigned_to' => ['nullable', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', Rule::in([
                Task::STATUS_TODO,
                Task::STATUS_IN_PROGRESS,
                Task::STATUS_REVIEW,
                Task::STATUS_DONE,
            ])],
            'priority' => ['nullable', 'string'],
            'deadline' => ['nullable', 'date'],
        ]);

        if (! empty($validated['assigned_to'])) {
            $isAssigneeWorkspaceMember = $workspace->members()
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
            'workspace_id' => $workspace->id,
            'project_id' => null,
            'assigned_to' => $validated['assigned_to'] ?? null,
            'created_by' => $user->id,
            'updated_by' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? Task::STATUS_TODO,
            'priority' => $validated['priority'] ?? 'medium',
            'deadline' => $validated['deadline'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Task created successfully.',
            'data' => $task->fresh(),
        ], 201);
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $user = $request->user();

        if (! $task->workspace->members()->where('users.id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to update this task.',
            ], 403);
        }

        $validated = $request->validate([
            'assigned_to' => ['nullable', 'exists:users,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', Rule::in([
                Task::STATUS_TODO,
                Task::STATUS_IN_PROGRESS,
                Task::STATUS_REVIEW,
                Task::STATUS_DONE,
            ])],
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
            'assigned_to' => array_key_exists('assigned_to', $validated) ? $validated['assigned_to'] : $task->assigned_to,
            'title' => $validated['title'] ?? $task->title,
            'description' => array_key_exists('description', $validated) ? $validated['description'] : $task->description,
            'status' => $validated['status'] ?? $task->status,
            'priority' => $validated['priority'] ?? $task->priority,
            'deadline' => array_key_exists('deadline', $validated) ? $validated['deadline'] : $task->deadline,
            'updated_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Task updated successfully.',
            'data' => $task->fresh(),
        ]);
    }

    public function updateStatus(Request $request, Task $task): JsonResponse
    {
        $user = $request->user();

        if (! $task->workspace->members()->where('users.id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Not authorized to update this task.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in([
                Task::STATUS_TODO,
                Task::STATUS_IN_PROGRESS,
                Task::STATUS_REVIEW,
                Task::STATUS_DONE,
            ])],
        ]);

        $task->update([
            'status' => $validated['status'],
            'updated_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Task status updated successfully.',
            'data' => $task->fresh(),
        ]);
    }

    public function assign(Request $request, Task $task): JsonResponse
    {
        $user = $request->user();

        if (! $task->workspace->members()->where('users.id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to assign this task.',
            ], 403);
        }

        $validated = $request->validate([
            'assigned_to' => ['required', 'exists:users,id'],
        ]);

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

        $task->update([
            'assigned_to' => $validated['assigned_to'],
            'updated_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Task assigned successfully.',
            'data' => $task->fresh(),
        ]);
    }

    public function destroy(Request $request, Task $task): JsonResponse
    {
        $user = $request->user();

        if (! $task->workspace->members()->where('users.id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to delete this task.',
            ], 403);
        }

        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Task deleted successfully.',
        ]);
    }
}