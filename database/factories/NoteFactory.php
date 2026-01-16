<?php

namespace Database\Factories;

use App\Models\Note;
use Illuminate\Database\Eloquent\Factories\Factory;

class NoteFactory extends Factory
{
    protected $model = Note::class;

    public function definition() : array
    {
        return [
            'title' => fake()->realText(200),
            'note' => fake()->realText(2000),
            'user_id'=> 1
        ];
    }
}
