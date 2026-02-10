"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export default function TravelGuidePage() {
  return (
    <div className="min-h-screen pt-6 pb-20 bg-white">
      <div className="max-w-md mx-auto px-4">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[hsl(220,65%,25%)]">Where to?</h1>
        </header>

        <div className="space-y-4 mb-4">
          <div className="rounded-xl border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded flex items-center justify-center text-emerald-600">📍</div>
            <input placeholder="Enter origin" className="flex-1 bg-transparent outline-none" />
          </div>
          <div className="rounded-xl border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-pink-100 rounded flex items-center justify-center text-pink-600">📍</div>
            <input placeholder="Enter destination" className="flex-1 bg-transparent outline-none" />
          </div>

          <div className="flex items-center gap-3">
            <div className="text-pink-600">⏰</div>
            <div className="font-semibold text-pink-600">Leaving now</div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 rounded-xl border border-slate-200 py-3">Add home</button>
            <button className="flex-1 rounded-xl border border-slate-200 py-3">Add work</button>
            <button className="w-12 rounded-xl border border-slate-200 py-3">+</button>
          </div>
        </div>

        <section className="mt-6">
          <button className="w-full p-4 rounded-xl border-2 border-slate-200 text-left flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center">🚌</div>
            <div>
              <div className="font-semibold">Buses and nearby stops on map</div>
            </div>
          </button>

          <div className="mt-4 rounded-xl border border-slate-200 p-3">
            <input placeholder="Search stops and routes" className="w-full outline-none bg-transparent" />
          </div>
        </section>
      </div>
    </div>
  );
}
