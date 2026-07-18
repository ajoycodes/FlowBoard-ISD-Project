<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    /**
     * List all projects (optionally, only those in workspaces the user belongs to)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $projects = Project::whereHas('workspace.members', function ($q) use ($user) {
            $q->where('users.id', $user->id);
        })->get();

        return response()->json([
            'success' => true,
            'data' => $projects
        ]);
    }

    /**
     * Create a new project under a workspace
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'workspace_id' => 'required|exists:workspaces,id',
        ]);

        $workspace = Workspace::find($validated['workspace_id']);

        // Check that the user belongs to the workspace
        if (! $workspace->members()->where('users.id', $request->user()->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a member of this workspace.',
            ], 403);
        }

        $project = Project::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
            'workspace_id' => $validated['workspace_id'],
            'created_by' => $request->user()->id,
        ]);

        ActivityLog::record(
            $workspace->id,
            $request->user()->id,
            ActivityLog::PROJECT_CREATED,
            'project',
            $project->id,
            "Created project \"{$project->name}\""
        );

        return response()->json([
            'success' => true,
            'message' => 'Project created successfully',
            'data' => $project
        ], 201);
    }

    /**
     * Show a single project
     */
    public function show(Project $project, Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $project->workspace->members()->where('users.id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to view this project.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $project
        ]);
    }

    /**
     * Update a project
     */
    public function update(Project $project, Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $project->workspace->members()->where('users.id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to update this project.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $project->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Project updated successfully',
            'data' => $project
        ]);
    }

    /**
     * Delete a project
     */
    public function destroy(Project $project, Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $project->workspace->members()->where('users.id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to delete this project.',
            ], 403);
        }

        $project->delete();

        return response()->json([
            'success' => true,
            'message' => 'Project deleted successfully'
        ]);
    }
}