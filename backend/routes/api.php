<?php

use Illuminate\Support\Facades\Route;

<<<<<<< Updated upstream
Route::get('/test', function () {
    return response()->json([
        'message' => 'API working'
    ]);
=======
Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);


>>>>>>> Stashed changes
});