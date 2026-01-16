<?php

namespace App\Http\Controllers;

use App\Models\Note;

use Illuminate\Http\Request;

class NoteController extends Controller
{

    /**
     * Display a listing of the resource.
     * Show all notes
     */
    public function index()
    {
        //
        return response()->json(Note::all());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
        return "create";
    }

    /**
     * Store a newly created resource in storage.
     *
     */
    public function store(Request $request)
    {
        //

        $validated = $request->validate([
            'title' => 'required|max: 200',
            'note' => 'required',
            'user_id' => 'required'
        ]);

//        $userId = $request->user() ? $request->user()->id : 1;
//        $validated['user_id'] = $userId;

        $note = Note::query()->create($validated);

        return response()->json(['message'=>'Created successfully','note'=>$note],201) ;
    }

    /**
     * Display the specified resource.
     */
    public function show(Note $note)
    {
        //
        return response()->json($note);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Note $note)
    {
        //
        return "edit";
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request,Note $note) // Change Note $note to $id
    {
//        $note = Note::query()->find($id);
//
//        if (!$note) {
//            return response()->json(['message' => 'Note not found'], 404);
//        }

        $validated = $request->validate([
            'title' => 'required|max:200',
            'note' => 'required|string',
        ]);

        $note->update($validated);

        return response()->json(['message' => 'Updated successfully', 'note' => $note], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Note $note)
    {
        //
        Note::query()->delete();
        return response()->json(['message'=>'Deleted successfully'],200) ;
    }
}
