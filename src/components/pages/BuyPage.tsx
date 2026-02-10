"use client";

import React from "react";

export default function BuyPage() {
  return (
    <div className="min-h-screen pt-6 pb-20 bg-pink-50">
      <div className="max-w-md mx-auto px-4">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-pink-600">Buy a ticket</h1>
        </header>

        <section className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-center">Ticket type</h2>
          <p className="text-sm text-slate-500 mb-6 text-center">Please note that the ticket becomes valid immediately after payment!</p>

          <div className="space-y-4">
            <button className="w-full rounded-full border-2 border-pink-500 py-4 text-pink-600 font-semibold flex items-center gap-4 justify-center">
              <span>🎫</span>
              <span>Single ticket</span>
            </button>
            <button className="w-full rounded-full border-2 border-pink-500 py-4 text-pink-600 font-semibold flex items-center gap-4 justify-center">
              <span>🕒</span>
              <span>Day ticket</span>
            </button>
            <button className="w-full rounded-full border-2 border-pink-500 py-4 text-pink-600 font-semibold flex items-center gap-4 justify-center">
              <span>📅</span>
              <span>Season ticket</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
