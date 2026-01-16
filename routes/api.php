<?php

use App\Http\Controllers\NoteController;
use App\Http\Controllers\UserController;
use \Illuminate\Support\Facades\Route;


Route::post('/register',[UserController::class,'register'])->name('register');
Route::get('/users',[UserController::class,'index'])->name('users.index');
Route::post('/login',[UserController::class,'login'])->name('login');
Route::post('/logout',[UserController::class,'logout'])->name('logout');


Route::resource('notes',NoteController::class);
//Route::put('/notes/{id}',[NoteController::class, 'update'])->name('notes.update');
