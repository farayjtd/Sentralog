<?php

use Illuminate\Support\Facades\Route;

// Halaman Utama
Route::get('/', function () {
    return view('welcome');
});

Route::prefix('admin')->group(function () {
    Route::get('/dashboard', function () { return view('admin.index'); });
    Route::get('/karyawan', function () { return view('admin.karyawan'); });
    Route::get('/warehouse', function () { return view('admin.warehouse'); });
    Route::get('/tasks', function () { return view('admin.tasks'); });
    Route::get('/inventory', function () { return view('admin.inventory'); });
});