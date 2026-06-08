<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\WorkspaceController;


Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotpassword']);
Route::post('/reset-password', [AuthController::class, 'resetpassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::put('/tasks/{task}', [TaskController::class, 'update']);
    Route::get('/workspaces', [WorkspaceController::class, 'index']);
    Route::post('/workspaces', [WorkspaceController::class, 'store']);
    Route::get('/workspaces/{workspace}', [WorkspaceController::class, 'show']);
    Route::put('/workspaces/{workspace}', [WorkspaceController::class, 'update']);
    Route::delete('/workspaces/{workspace}', [WorkspaceController::class, 'destroy']);
});
