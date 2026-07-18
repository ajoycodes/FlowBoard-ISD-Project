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
            'tasks:id,workspace_id,title,status,priority,assigned_to,created_at,updated_at',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Workspace fetched successfully.',
            'data' => $workspace,
        ]);
    }

    public function update(Request $request, Workspace $workspace): JsonResponse
    {
        if (! $this->userIsWorkspaceAdmin($request->user()->id, $workspace)) {
            return response()->json([
                'success' => false,
                'message' => 'Only workspace owners or admins can update this workspace.',
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
        if (! $this->userIsWorkspaceAdmin($request->user()->id, $workspace)) {
            return response()->json([
                'success' => false,
                'message' => 'Only workspace owners or admins can delete this workspace.',
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
        if (! $this->userIsWorkspaceAdmin($request->user()->id, $workspace)) {
            return response()->json([
                'success' => false,
                'message' => 'Only workspace owners or admins can send invitations.',
            ], 403);
        }

        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        // Check if user is already a member
        $existingMember = $workspace->members()
            ->where('users.email', $validated['email'])
            ->exists();

        if ($existingMember) {
            return response()->json([
                'success' => false,
                'message' => 'User is already a member of this workspace.',
            ], 422);
        }

        // Check if there's already a pending invitation
        $existingInvitation = $workspace->invitations()
            ->where('email', $validated['email'])
            ->where('status', 'pending')
            ->exists();

        if ($existingInvitation) {
            return response()->json([
                'success' => false,
                'message' => 'A pending invitation already exists for this email.',
            ], 422);
        }

        // updateOrCreate re-opens a previously accepted/declined invitation
        // instead of violating the (workspace_id, email) unique constraint.
        $invitation = \App\Models\WorkspaceInvitation::updateOrCreate(
            [
                'workspace_id' => $workspace->id,
                'email' => $validated['email'],
            ],
            [
                'invited_by' => $request->user()->id,
                'status' => 'pending',
            ]
        );

        $invitation->load('inviter:id,name,email');

        // TODO: Send email notification here

        return response()->json([
            'success' => true,
            'message' => 'Invitation sent successfully.',
            'data' => $invitation,
        ], 201);
    }

    public function removeMember(Request $request, Workspace $workspace, User $user): JsonResponse
    {
        if (! $this->userIsWorkspaceAdmin($request->user()->id, $workspace)) {
            return response()->json([
                'success' => false,
                'message' => 'Only workspace owners or admins can remove members.',
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
        return $workspace->owner_id == $userId;
    }

    private function userIsWorkspaceAdmin(int $userId, Workspace $workspace): bool
    {
        if ($workspace->owner_id == $userId) {
            return true;
        }

        $member = $workspace->members()
            ->where('users.id', $userId)
            ->first();

        return $member && $member->pivot->role === 'admin';
    }
}