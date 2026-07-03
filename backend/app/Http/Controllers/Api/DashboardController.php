<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DashboardProjectResource;
use App\Http\Resources\DashboardTaskResource;
use App\Models\Project;
use App\Models\Task;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $workspaceId = $request->query('workspace_id');

        if ($workspaceId) {
            $workspace = Workspace::query()
                ->where('id', $workspaceId)
                ->whereHas('members', function ($query) use ($user) {
                    $query->where('users.id', $user->id);
                })
                ->first();

            if (! $workspace) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to access this workspace.',
                ], 403);
            }
        }

        $activeProjects = Project::query()
            ->select([
                'projects.id',
                'projects.workspace_id',
                'projects.name',
                'projects.status',
                'projects.updated_at',
            ])
            ->whereHas('workspace.members', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->when($workspaceId, function ($query) use ($workspaceId) {
                $query->where('projects.workspace_id', $workspaceId);
            })
            ->whereIn('projects.status', Project::ACTIVE_STATUSES)
            ->latest('projects.updated_at')
            ->get();

        $recentTasks = Task::query()
            ->select([
                'tasks.id',
                'tasks.workspace_id',
                'tasks.project_id',
                'tasks.assigned_to',
                'tasks.created_by',
                'tasks.updated_by',
                'tasks.title',
                'tasks.status',
                'tasks.updated_at',
            ])
            ->with([
                'project:id,name,workspace_id',
            ])
            ->whereHas('workspace.members', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->when($workspaceId, function ($query) use ($workspaceId) {
                $query->where('tasks.workspace_id', $workspaceId);
            })
            ->where(function ($query) use ($user) {
                $query->where('tasks.assigned_to', $user->id)
                    ->orWhere('tasks.created_by', $user->id)
                    ->orWhere('tasks.updated_by', $user->id);
            })
            ->latest('tasks.updated_at')
            ->limit(10)
            ->get();

        $myTasksSortedByDeadline = Task::query()
            ->select([
                'tasks.id',
                'tasks.workspace_id',
                'tasks.project_id',
                'tasks.assigned_to',
                'tasks.created_by',
                'tasks.updated_by',
                'tasks.title',
                'tasks.description',
                'tasks.status',
                'tasks.priority',
                'tasks.deadline',
                'tasks.created_at',
                'tasks.updated_at',
            ])
            ->with([
                'workspace:id,name',
                'project:id,name,workspace_id',
            ])
            ->whereHas('workspace.members', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->when($workspaceId, function ($query) use ($workspaceId) {
                $query->where('tasks.workspace_id', $workspaceId);
            })
            ->where('tasks.assigned_to', $user->id)
            ->orderByRaw('CASE WHEN deadline IS NULL THEN 1 ELSE 0 END')
            ->orderBy('deadline', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Dashboard data fetched successfully.',
            'data' => [
                'active_projects' => DashboardProjectResource::collection($activeProjects),
                'recent_tasks' => DashboardTaskResource::collection($recentTasks),
                'my_tasks_sorted_by_deadline' => $myTasksSortedByDeadline,
            ],
        ]);
    }
}