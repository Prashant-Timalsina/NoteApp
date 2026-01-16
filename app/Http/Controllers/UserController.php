<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{

    public function register(): User{

        $validated = request()->validate([
            'name' => 'required|max:50',
            'email' => 'required|email|unique:users',
            'password' => 'min:8',
        ]);

        $validated['password'] = bcrypt($validated['password']);
        return User::query()->create($validated);
    }

    public function login(){
        if (!auth()->attempt(request(['email', 'password']))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }
        return auth()->user();
    }

    public function logout(){
        auth()->logout();
        return ['message'=>'Logged out'];
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        return response()->json(User::all());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        //
    }
}
