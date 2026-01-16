<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Note extends Model
{
    // Notes schema buildup
    use HasFactory;

    protected $fillable = ['title', 'note', 'user_id'];


}
