<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add source column to donations to distinguish web vs app.
     * Run this migration in your Laravel backend project.
     */
    public function up(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->string('source', 16)->default('web')->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropColumn('source');
        });
    }
};
