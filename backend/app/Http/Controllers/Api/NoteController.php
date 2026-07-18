<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Note;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoteController extends Controller
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
                'message' => 'You are not authorized to view notes in this workspace.',
            ], 403);
        }

        $notes = $workspace->notes()
            ->with('user:id,name,email')
            ->latest('updated_at')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Notes fetched successfully.',
            'data' => $notes,
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
                'message' => 'You are not authorized to create notes in this workspace.',
            ], 403);
        }

        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        $note = Note::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'content' => $validated['content'],
        ]);

        $note->load('user:id,name,email');

        ActivityLog::record(
            $workspace->id,
            $user->id,
            ActivityLog::NOTE_CREATED,
            'note',
            $note->id,
            'Created a note'
        );

        return response()->json([
            'success' => true,
            'message' => 'Note created successfully.',
            'data' => $note,
        ], 201);
    }

    public function show(Request $request, Workspace $workspace, Note $note): JsonResponse
    {
        $user = $request->user();

        if ($note->workspace_id !== $workspace->id) {
            return response()->json([
                'success' => false,
                'message' => 'Note does not belong to this workspace.',
            ], 404);
        }

        $isWorkspaceMember = $workspace->members()
            ->where('users.id', $user->id)
            ->exists();

        if (! $isWorkspaceMember) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to view this note.',
            ], 403);
        }

        $note->load('user:id,name,email');

        return response()->json([
            'success' => true,
            'message' => 'Note fetched successfully.',
            'data' => $note,
        ]);
    }

    public function update(Request $request, Workspace $workspace, Note $note): JsonResponse
    {
        $user = $request->user();

        if ($note->workspace_id !== $workspace->id) {
            return response()->json([
                'success' => false,
                'message' => 'Note does not belong to this workspace.',
            ], 404);
        }

        $isWorkspaceMember = $workspace->members()
            ->where('users.id', $user->id)
            ->exists();

        if (! $isWorkspaceMember) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to update this note.',
            ], 403);
        }

        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        $note->update([
            'content' => $validated['content'],
        ]);

        $note->load('user:id,name,email');

        return response()->json([
            'success' => true,
            'message' => 'Note updated successfully.',
            'data' => $note,
        ]);
    }

    public function destroy(Request $request, Workspace $workspace, Note $note): JsonResponse
    {
        $user = $request->user();

        if ($note->workspace_id !== $workspace->id) {
            return response()->json([
                'success' => false,
                'message' => 'Note does not belong to this workspace.',
            ], 404);
        }

        $isWorkspaceMember = $workspace->members()
            ->where('users.id', $user->id)
            ->exists();

        if (! $isWorkspaceMember) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to delete this note.',
            ], 403);
        }

        $note->delete();

        return response()->json([
            'success' => true,
            'message' => 'Note deleted successfully.',
        ]);
    }
}
