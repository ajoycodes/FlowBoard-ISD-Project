<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectInvitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectInvitationController extends Controller
{
    public function index(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        if (! $this->userIsProjectWorkspaceAdmin($user->id, $project)) {
            return response()->json([
                'success' => false,
                'message' => 'Only workspace owners or admins can view project invitations.',
            ], 403);
        }

        $invitations = $project->invitations()
            ->with('inviter:id,name,email')
            ->latest('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Project invitations fetched successfully.',
            'data' => $invitations,
        ]);
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        if (! $this->userIsProjectWorkspaceAdmin($user->id, $project)) {
            return response()->json([
                'success' => false,
                'message' => 'Only workspace owners or admins can send project invitations.',
            ], 403);
        }

        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        $project->loadMissing('workspace');

        if (! $project->workspace) {
            return response()->json([
                'success' => false,
                'message' => 'Project workspace not found.',
            ], 404);
        }

        // User must already be a workspace member
        $isWorkspaceMember = $project->workspace->members()
            ->where('users.email', $validated['email'])
            ->exists();

        if (! $isWorkspaceMember) {
            return response()->json([
                'success' => false,
                'message' => 'User must be a workspace member first. Invite them to the workspace first.',
            ], 422);
        }

        // Check existing pending invitation
        $existingInvitation = $project->invitations()
            ->where('email', $validated['email'])
            ->where('status', ProjectInvitation::STATUS_PENDING)
            ->exists();

        if ($existingInvitation) {
            return response()->json([
                'success' => false,
                'message' => 'A pending invitation already exists for this email.',
            ], 422);
        }

        // updateOrCreate re-opens a previously accepted/declined invitation
        // instead of violating the (project_id, email) unique constraint.
        $invitation = ProjectInvitation::updateOrCreate(
            [
                'project_id' => $project->id,
                'email' => $validated['email'],
            ],
            [
                'invited_by' => $user->id,
                'status' => ProjectInvitation::STATUS_PENDING,
            ]
        );

        $invitation->load('inviter:id,name,email');

        return response()->json([
            'success' => true,
            'message' => 'Project invitation sent successfully.',
            'data' => $invitation,
        ], 201);
    }

    public function show(Request $request, Project $project, ProjectInvitation $invitation): JsonResponse
    {
        $user = $request->user();

        if ((int) $invitation->project_id !== (int) $project->id) {
            return response()->json([
                'success' => false,
                'message' => 'Invitation does not belong to this project.',
            ], 404);
        }

        if (! $this->userIsProjectWorkspaceAdmin($user->id, $project)) {
            return response()->json([
                'success' => false,
                'message' => 'Only workspace owners or admins can view invitation details.',
            ], 403);
        }

        $invitation->load('inviter:id,name,email');

        return response()->json([
            'success' => true,
            'message' => 'Project invitation fetched successfully.',
            'data' => $invitation,
        ]);
    }

    public function destroy(Request $request, Project $project, ProjectInvitation $invitation): JsonResponse
    {
        $user = $request->user();

        if ((int) $invitation->project_id !== (int) $project->id) {
            return response()->json([
                'success' => false,
                'message' => 'Invitation does not belong to this project.',
            ], 404);
        }

        if (! $this->userIsProjectWorkspaceAdmin($user->id, $project)) {
            return response()->json([
                'success' => false,
                'message' => 'Only workspace owners or admins can remove invitations.',
            ], 403);
        }

        $invitation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Project invitation removed successfully.',
        ]);
    }

    public function accept(Request $request, ProjectInvitation $invitation): JsonResponse
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

        return response()->json([
            'success' => true,
            'message' => 'Project invitation accepted successfully. You can now be assigned to tasks in this project.',
            'data' => $invitation->fresh()->load(
                'inviter:id,name,email',
                'project:id,name,workspace_id'
            ),
        ]);
    }

    public function decline(Request $request, ProjectInvitation $invitation): JsonResponse
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
            'message' => 'Project invitation declined successfully.',
            'data' => $invitation->fresh()->load('inviter:id,name,email'),
        ]);
    }

    public function myInvitations(Request $request): JsonResponse
    {
        $user = $request->user();

        $invitations = ProjectInvitation::where('email', $user->email)
            ->with([
                'project:id,name,workspace_id',
                'inviter:id,name,email',
            ])
            ->latest('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Your project invitations fetched successfully.',
            'data' => $invitations,
        ]);
    }

    private function userIsProjectWorkspaceOwner(int $userId, Project $project): bool
    {
        $project->loadMissing('workspace');

        if (! $project->workspace) {
            return false;
        }

        return (int) $project->workspace->owner_id === (int) $userId;
    }

    private function userIsProjectWorkspaceAdmin(int $userId, Project $project): bool
    {
        $project->loadMissing('workspace');

        if (! $project->workspace) {
            return false;
        }

        if ((int) $project->workspace->owner_id === (int) $userId) {
            return true;
        }

        $member = $project->workspace->members()
            ->where('users.id', $userId)
            ->first();

        return $member && $member->pivot->role === 'admin';
    }
}