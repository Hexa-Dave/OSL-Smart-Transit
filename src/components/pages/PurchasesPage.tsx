"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export default function PurchasesPage() {
  return (
    <div className="min-h-screen pt-6 pb-20 bg-pink-50">
      <div className="max-w-md mx-auto px-4">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-pink-600">Purchases</h1>
        </header>

        <div className="flex gap-3 mb-6">
          <button className="flex-1 rounded-full bg-white py-2 text-pink-600 font-semibold shadow">Your tickets</button>
          <button className="flex-1 rounded-full border-2 border-pink-500 py-2 text-pink-600 font-semibold">Purchasing history</button>
        </div>

        <section className="bg-white rounded-xl p-6 shadow-md h-64 flex items-center justify-center">
          <p className="text-center text-slate-500">No valid or recently expired tickets.</p>
        </section>
      </div>
    </div>
  );
}
