<?php

use App\Http\Controllers\NoteController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});




//Route::get('/notes', [NoteController::class, 'index'])->name('notes.index');
//Route::get('/notes/create',[NoteController::class, 'create'])->name('notes.create');
//Route::post('/notes',[NoteController::class, 'store'])->name('notes.store');
//Route::get('/notes/{id}',[NoteController::class, 'show'])->name('notes.show');
//Route::get('/notes/{id}/edit',[NoteController::class, 'edit'])->name('notes.edit');
//Route::put('/notes/{id}',[NoteController::class, 'update'])->name('notes.update');
//Route::delete('/notes/{id}',[NoteController::class, 'destroy'])->name('notes.destroy');


//Route::resource('notes',NoteController::class);
