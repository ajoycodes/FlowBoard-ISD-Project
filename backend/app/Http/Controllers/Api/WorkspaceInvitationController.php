<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkspaceInvitationController extends Controller
{
    public function index(Request $request, Workspace $workspace): JsonResponse
    {
        $user = $request->user();

        if (! $this->userIsWorkspaceAdmin($user->id, $workspace)) {
            return response()->json([
                'success' => false,
                'message' => 'Only workspace owners or admins can view invitations.',
            ], 403);
        }

        $invitations = $workspace->invitations()
            ->with('inviter:id,name,email')
            ->latest('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Invitations fetched successfully.',
            'data' => $invitations,
        ]);
    }

    public function store(Request $request, Workspace $workspace): JsonResponse
    {
        $user = $request->user();

        if (! $this->userIsWorkspaceAdmin($user->id, $workspace)) {
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
            ->where('status', WorkspaceInvitation::STATUS_PENDING)
            ->exists();

        if ($existingInvitation) {
            return response()->json([
                'success' => false,
                'message' => 'A pending invitation already exists for this email.',
            ], 422);
        }

        $invitation = WorkspaceInvitation::create([
            'workspace_id' => $workspace->id,
            'invited_by' => $user->id,
            'email' => $validated['email'],
            'status' => WorkspaceInvitation::STATUS_PENDING,
        ]);

        $invitation->load('inviter:id,name,email');

        // TODO: Send email notification here

        return response()->json([
            'success' => true,
            'message' => 'Invitation sent successfully.',
            'data' => $invitation,
        ], 201);
    }

    public function show(Request $request, Workspace $workspace, WorkspaceInvitation $invitation): JsonResponse
    {
        $user = $request->user();

        if ($invitation->workspace_id !== $workspace->id) {
            return response()->json([
                'success' => false,
                'message' => 'Invitation does not belong to this workspace.',
            ], 404);
        }

        if (! $this->userIsWorkspaceAdmin($user->id, $workspace)) {
            return response()->json([
                'success' => false,
                'message' => 'Only workspace owners or admins can view invitation details.',
            ], 403);
        }

        $invitation->load('inviter:id,name,email');

        return response()->json([
            'success' => true,
            'message' => 'Invitation fetched successfully.',
            'data' => $invitation,
        ]);
    }

    public function destroy(Request $request, Workspace $workspace, WorkspaceInvitation $invitation): JsonResponse
    {
        $user = $request->user();

        if ($invitation->workspace_id !== $workspace->id) {
            return response()->json([
                'success' => false,
                'message' => 'Invitation does not belong to this workspace.',
            ], 404);
        }

        if (! $this->userIsWorkspaceAdmin($user->id, $workspace)) {
            return response()->json([
                'success' => false,
                'message' => 'Only workspace owners or admins can remove invitations.',
            ], 403);
        }

        $invitation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Invitation removed successfully.',
        ]);
    }

    public function accept(Request $request, WorkspaceInvitation $invitation): JsonResponse
    {
        $user = $request->user();

        if ($invitation->email !== $user->email) {
            return response()->json([
                'success' => false,
                'message' => 'This invitation is not for your email address.',
            ], 403);
        }

        if (! $invitation->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'This invitation has already been processed.',
            ], 422);
        }

        $invitation->accept();

        // Add user to workspace
        $invitation->workspace->members()->syncWithoutDetaching([
            $user->id => ['role' => 'member'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Invitation accepted successfully. You have been added to the workspace.',
            'data' => $invitation->fresh()->load('inviter:id,name,email'),
        ]);
    }

    public function decline(Request $request, WorkspaceInvitation $invitation): JsonResponse
    {
        $user = $request->user();

        if ($invitation->email !== $user->email) {
            return response()->json([
                'success' => false,
                'message' => 'This invitation is not for your email address.',
            ], 403);
        }

        if (! $invitation->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'This invitation has already been processed.',
            ], 422);
        }

        $invitation->decline();

        return response()->json([
            'success' => true,
            'message' => 'Invitation declined successfully.',
            'data' => $invitation->fresh()->load('inviter:id,name,email'),
        ]);
    }

    public function myInvitations(Request $request): JsonResponse
    {
        $user = $request->user();

        $invitations = WorkspaceInvitation::where('email', $user->email)
            ->with(['workspace:id,name,description', 'inviter:id,name,email'])
            ->latest('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Your invitations fetched successfully.',
            'data' => $invitations,
        ]);
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
