<?php



namespace App\Http\Controllers\Api;



use App\Http\Controllers\Controller;

use App\Models\Workspace;

use Illuminate\Http\JsonResponse;

use Illuminate\Http\Request;



class ActivityLogController extends Controller

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

                'message' => 'You are not authorized to view activity logs for this workspace.',

            ], 403);

        }



        $perPage = $request->query('per_page', 10);

        $query = $workspace->activityLogs()
            ->select([
                'id',
                'workspace_id',
                'user_id',
                'action',
                'entity_type',
                'entity_id',
                'description',
                'created_at',
            ])
            ->with('user:id,name,email')
            ->orderByDesc('created_at');

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        $logs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Activity logs fetched successfully.',
            'data' => $logs,
        ]);

    }

}