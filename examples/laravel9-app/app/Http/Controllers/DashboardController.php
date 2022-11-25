<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     *
     * @return \Illuminate\Http\Response
     */
    public function __invoke()
    {
        $users = User::latest('id')->paginate(5);
        return Inertia::render(
            'Dashboard',
            [
                'users' => $users
            ]
        );
    }
}
