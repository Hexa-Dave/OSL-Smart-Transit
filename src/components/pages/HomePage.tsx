"use client";

import React from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen pt-6 pb-20 bg-pink-50">
      <div className="max-w-md mx-auto px-4">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-pink-600">OSL</h1>
          <div className="text-sm text-slate-500">Welcome</div>
        </header>

        <section className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Customer messages</h2>
          <p className="text-center text-pink-600 font-medium">No new messages.</p>
        </section>
      </div>
    </div>
  );
}
