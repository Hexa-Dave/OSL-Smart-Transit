"use client";

import React from "react";
import { Button } from "@/components/ui/button";

type Tab = "home" | "buy" | "purchases" | "travel" | "info" | "solution";

export default function BottomNav({ value, onChange }: { value: Tab; onChange: (t: Tab) => void }) {
  const NavButton = ({ tab, label, icon }: { tab: Tab; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => onChange(tab)}
      className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-colors ${
        value === tab ? "text-pink-600" : "text-slate-500"
      }`}
      aria-label={label}
    >
      <div className="w-6 h-6">{icon}</div>
      <div className="text-xs mt-1">{label}</div>
    </button>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200">
      <div className="max-w-md mx-auto flex"> 
        <NavButton
          tab="home"
          label="Home"
          icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M3 11.5V20a1 1 0 001 1h5v-6h4v6h5a1 1 0 001-1v-8.5L12 3 3 11.5z"/></svg>}
        />
        <NavButton
          tab="buy"
          label="Buy"
          icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M7 4h10l1.2 6H6L7 4zm-2 8h14v6a1 1 0 01-1 1H6a1 1 0 01-1-1v-6z"/></svg>}
        />
        <NavButton
          tab="purchases"
          label="Purchases"
          icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M5 4h14v2H5V4zm0 4h14v10a1 1 0 01-1 1H6a1 1 0 01-1-1V8z"/></svg>}
        />
        <NavButton
          tab="travel"
          label="Travel guide"
          icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.3 6.6 11.3 6.9 11.6.2.2.5.4.8.4s.6-.1.8-.4C12.4 20.3 19 14.3 19 9c0-3.9-3.1-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>}
        />
        <NavButton
          tab="solution"
          label="Solution"
          icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M3 13h4v7H3v-7zm7-9h4v16h-4V4zm7 5h4v11h-4V9z"/></svg>}
        />
        <NavButton
          tab="info"
          label="Info"
          icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M11 17h2v-6h-2v6zm0-8h2V7h-2v2z"/><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" opacity="0.2"/></svg>}
        />
      </div>
    </nav>
  );
}
