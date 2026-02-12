"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const ICONS = [
  { key: 'pin', label: 'Pin', emoji: '📍' },
  { key: 'home', label: 'Home', emoji: '🏠' },
  { key: 'work', label: 'Work', emoji: '💼' },
  { key: 'play', label: 'Play', emoji: '🎾' },
  { key: 'building', label: 'Building', emoji: '🏢' },
  { key: 'shop', label: 'Shop', emoji: '🛍️' },
];

export default function TravelGuidePage() {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [placeName, setPlaceName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const openSave = (presetName: string) => {
    setPlaceName(presetName);
    setSelectedIcon(presetName === 'Home' ? 'home' : presetName === 'Work' ? 'work' : null);
    setShowSaveModal(true);
  };

  const closeSave = () => {
    setShowSaveModal(false);
    setPlaceName('');
    setSelectedIcon(null);
    setSearchQuery('');
  };

  const handleSave = () => {
    // For now, just log — later persist via API
    console.log('Save place', { name: placeName, icon: selectedIcon, searchQuery });
    closeSave();
  };

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
            <button onClick={() => openSave('Home')} className="flex-1 rounded-xl border border-slate-200 py-3">Add home</button>
            <button onClick={() => openSave('Work')} className="flex-1 rounded-xl border border-slate-200 py-3">Add work</button>
            <button onClick={() => openSave('')} className="w-12 rounded-xl border border-slate-200 py-3">+</button>
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

      {/* Save Place Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeSave} />
          <div className="relative bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <button onClick={closeSave} className="absolute right-4 top-4 text-sky-500 text-2xl">✕</button>
            <h2 className="text-xl font-bold text-center mb-4">Save place</h2>

            <div className="space-y-3">
              <div>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by address or place name"
                  className="w-full rounded-lg border px-4 py-3 bg-transparent"
                />
              </div>
              <div>
                <input
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  placeholder="Give the name a place (optional)"
                  className="w-full rounded-lg border px-4 py-3 bg-transparent"
                />
              </div>

              <div>
                <div className="font-semibold mb-2">Select the place's icon</div>
                <div className="grid grid-cols-6 gap-2">
                  {ICONS.map((ic) => (
                    <button
                      key={ic.key}
                      onClick={() => setSelectedIcon(ic.key)}
                      className={`p-3 rounded-lg border ${selectedIcon === ic.key ? 'bg-slate-800 text-white' : 'bg-white text-slate-700'}`}
                    >
                      <div className="text-lg">{ic.emoji}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <Button variant="default" className="w-full" onClick={handleSave} disabled={!selectedIcon}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
