<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\WorkspaceController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\WorkspaceInvitationController;
use App\Http\Controllers\Api\ProjectInvitationController;

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotpassword']);
Route::post('/reset-password', [AuthController::class, 'resetpassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/workspaces', [WorkspaceController::class, 'index']);
    Route::post('/workspaces', [WorkspaceController::class, 'store']);
    Route::get('/workspaces/{workspace}', [WorkspaceController::class, 'show']);
    Route::put('/workspaces/{workspace}', [WorkspaceController::class, 'update']);
    Route::delete('/workspaces/{workspace}', [WorkspaceController::class, 'destroy']);
    Route::post('/workspaces/{workspace}/members', [WorkspaceController::class, 'addMember']);
    Route::delete('/workspaces/{workspace}/members/{user}', [WorkspaceController::class, 'removeMember']);
    Route::get('/workspaces/{workspace}/invitations', [WorkspaceInvitationController::class, 'index']);
    Route::post('/workspaces/{workspace}/invitations', [WorkspaceInvitationController::class, 'store']);
    Route::get('/workspaces/{workspace}/invitations/{invitation}', [WorkspaceInvitationController::class, 'show']);
    Route::delete('/workspaces/{workspace}/invitations/{invitation}', [WorkspaceInvitationController::class, 'destroy']);

    Route::get('/invitations/my', [WorkspaceInvitationController::class, 'myInvitations']);
    Route::post('/invitations/{invitation}/accept', [WorkspaceInvitationController::class, 'accept']);
    Route::post('/invitations/{invitation}/decline', [WorkspaceInvitationController::class, 'decline']);

    Route::post('/workspaces/{workspace}/tasks', [TaskController::class, 'store']);
    Route::get('/workspaces/{workspace}/tasks', [TaskController::class, 'index']);
    Route::put('/tasks/{task}', [TaskController::class, 'update']);
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus']);
    Route::patch('/tasks/{task}/assign', [TaskController::class, 'assign']);

    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/{project}', [ProjectController::class, 'show']);
    Route::put('/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);

    Route::get('/projects/{project}/invitations', [ProjectInvitationController::class, 'index']);
    Route::post('/projects/{project}/invitations', [ProjectInvitationController::class, 'store']);
    Route::get('/projects/{project}/invitations/{invitation}', [ProjectInvitationController::class, 'show']);
    Route::delete('/projects/{project}/invitations/{invitation}', [ProjectInvitationController::class, 'destroy']);

    Route::get('/project-invitations/my', [ProjectInvitationController::class, 'myInvitations']);
    Route::post('/project-invitations/{invitation}/accept', [ProjectInvitationController::class, 'accept']);
    Route::post('/project-invitations/{invitation}/decline', [ProjectInvitationController::class, 'decline']);

    Route::get('/workspaces/{workspace}/activity', [ActivityLogController::class, 'index']);

    Route::get('/workspaces/{workspace}/notes', [NoteController::class, 'index']);
    Route::post('/workspaces/{workspace}/notes', [NoteController::class, 'store']);
    Route::get('/workspaces/{workspace}/notes/{note}', [NoteController::class, 'show']);
    Route::put('/workspaces/{workspace}/notes/{note}', [NoteController::class, 'update']);
    Route::delete('/workspaces/{workspace}/notes/{note}', [NoteController::class, 'destroy']);
});
