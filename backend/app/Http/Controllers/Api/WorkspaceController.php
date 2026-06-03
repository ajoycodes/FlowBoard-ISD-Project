<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkspaceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $workspaces = Workspace::query()
            ->with([
                'owner:id,name,email',
                'members:id,name,email',
            ])
            ->where(function ($query) use ($user) {
                $query->where('owner_id', $user->id)
                    ->orWhereHas('members', function ($memberQuery) use ($user) {
                        $memberQuery->where('users.id', $user->id);
                    });
            })
            ->latest('updated_at')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Workspaces fetched successfully.',
            'data' => $workspaces,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $workspace = Workspace::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'owner_id' => $request->user()->id,
        ]);

        $workspace->members()->syncWithoutDetaching([
            $request->user()->id,
        ]);

        $workspace->load([
            'owner:id,name,email',
            'members:id,name,email',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Workspace created successfully.',
            'data' => $workspace,
        ], 201);
    }

    public function show(Request $request, Workspace $workspace): JsonResponse
    {
        if (! $this->userCanAccessWorkspace($request->user()->id, $workspace)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to access this workspace.',
            ], 403);
        }

        $workspace->load([
            'owner:id,name,email',
            'members:id,name,email',
            'projects:id,workspace_id,name,status,created_at,updated_at',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Workspace fetched successfully.',
            'data' => $workspace,
        ]);
    }

    public function update(Request $request, Workspace $workspace): JsonResponse
    {
        if (! $this->userIsWorkspaceOwner($request->user()->id, $workspace)) {
            return response()->json([
                'success' => false,
                'message' => 'Only the workspace owner can update this workspace.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $workspace->update($validated);

        $workspace->load([
            'owner:id,name,email',
            'members:id,name,email',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Workspace updated successfully.',
            'data' => $workspace,
        ]);
    }

    public function destroy(Request $request, Workspace $workspace): JsonResponse
    {
        if (! $this->userIsWorkspaceOwner($request->user()->id, $workspace)) {
            return response()->json([
                'success' => false,
                'message' => 'Only the workspace owner can delete this workspace.',
            ], 403);
        }

        $workspace->delete();

        return response()->json([
            'success' => true,
            'message' => 'Workspace deleted successfully.',
        ]);
    }

    public function addMember(Request $request, Workspace $workspace): JsonResponse
    {
        if (! $this->userIsWorkspaceOwner($request->user()->id, $workspace)) {
            return response()->json([
                'success' => false,
                'message' => 'Only the workspace owner can add members.',
            ], 403);
        }

        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        $member = User::where('email', $validated['email'])->firstOrFail();

        $workspace->members()->syncWithoutDetaching([
            $member->id,
        ]);

        $workspace->load([
            'owner:id,name,email',
            'members:id,name,email',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Member added to workspace successfully.',
            'data' => $workspace,
        ]);
    }

    public function removeMember(Request $request, Workspace $workspace, User $user): JsonResponse
    {
        if (! $this->userIsWorkspaceOwner($request->user()->id, $workspace)) {
            return response()->json([
                'success' => false,
                'message' => 'Only the workspace owner can remove members.',
            ], 403);
        }

        if ($workspace->owner_id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Workspace owner cannot be removed from the workspace.',
            ], 422);
        }

        $workspace->members()->detach($user->id);

        $workspace->load([
            'owner:id,name,email',
            'members:id,name,email',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Member removed from workspace successfully.',
            'data' => $workspace,
        ]);
    }

    private function userCanAccessWorkspace(int $userId, Workspace $workspace): bool
    {
        if ($workspace->owner_id === $userId) {
            return true;
        }

        return $workspace->members()
            ->where('users.id', $userId)
            ->exists();
    }

    private function userIsWorkspaceOwner(int $userId, Workspace $workspace): bool
    {
        return $workspace->owner_id === $userId;
    }
}