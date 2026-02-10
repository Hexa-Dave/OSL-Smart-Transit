"use client";

import React from "react";

function Row({ left, right, hasCaret = false }: { left: string; right?: React.ReactNode; hasCaret?: boolean }) {
  return (
    <div className="w-full bg-white rounded-full px-4 py-4 flex items-center justify-between shadow-sm">
      <div className="text-pink-600 font-semibold">{left}</div>
      <div className="flex items-center gap-3">
        {right}
        {hasCaret && <div className="text-pink-600">▸</div>}
      </div>
    </div>
  );
}

export default function InfoPage() {
  return (
    <div className="min-h-screen pt-6 pb-20 bg-pink-600">
      <div className="max-w-md mx-auto px-4 space-y-4">
        <header className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-white">OSL</h1>
        </header>

        <div className="space-y-3 mt-6">
          <Row left="My settings" hasCaret />
          <Row left="Terms of use and privacy policy" hasCaret />
          <Row left="Customer services" right={<span className="text-pink-600">↗</span>} />
          <Row left="Select language" right={<div className="text-slate-700">English - EN</div>} />
          <Row left="About the application" />
        </div>
      </div>
    </div>
  );
}
