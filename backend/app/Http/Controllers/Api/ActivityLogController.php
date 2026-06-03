<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request, Workspace $workspace): JsonResponse
    {
        $user = $request->user();

        if (! $this->userCanAccessWorkspace($user->id, $workspace)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to view activity logs for this workspace.',
            ], 403);
        }

        $perPage = min((int) $request->query('per_page', 20), 50);

        $activityLogs = ActivityLog::query()
            ->with([
                'actor:id,name,email',
            ])
            ->where('workspace_id', $workspace->id)
            ->latest('created_at')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Workspace activity logs fetched successfully.',
            'data' => $activityLogs->getCollection()->map(function (ActivityLog $activityLog) {
                return [
                    'id' => $activityLog->id,
                    'workspace_id' => $activityLog->workspace_id,
                    'event_type' => $activityLog->event_type,
                    'description' => $activityLog->description,
                    'related_item' => [
                        'type' => $activityLog->subject_type,
                        'id' => $activityLog->subject_id,
                        'title' => $activityLog->subject_title,
                    ],
                    'actor' => $activityLog->actor ? [
                        'id' => $activityLog->actor->id,
                        'name' => $activityLog->actor->name,
                        'email' => $activityLog->actor->email,
                    ] : null,
                    'metadata' => $activityLog->metadata,
                    'created_at' => $activityLog->created_at,
                    'updated_at' => $activityLog->updated_at,
                ];
            }),
            'meta' => [
                'current_page' => $activityLogs->currentPage(),
                'per_page' => $activityLogs->perPage(),
                'total' => $activityLogs->total(),
                'last_page' => $activityLogs->lastPage(),
            ],
        ]);
    }

    private function userCanAccessWorkspace(int $userId, Workspace $workspace): bool
    {
        if ((int) $workspace->owner_id === $userId) {
            return true;
        }

        return $workspace->members()
            ->where('users.id', $userId)
            ->exists();
    }
}