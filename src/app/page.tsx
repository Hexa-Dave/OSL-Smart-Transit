'use client';

import { useState } from 'react';
import PassengerApp from '@/components/PassengerApp';
import DriverDashboard from '@/components/DriverDashboard';

type ViewMode = 'split' | 'passenger' | 'driver';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  return (
    <main className="min-h-screen">
      {/* View Mode Selector - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[hsl(222,47%,8%)] border-b border-slate-700 shadow-lg">
        <div className="flex items-center justify-center gap-2 p-2">
          <span className="text-slate-400 text-sm mr-2 hidden sm:inline">View:</span>
          <div className="inline-flex rounded-lg bg-slate-800 p-1">
            <button
              onClick={() => setViewMode('split')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === 'split'
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">Split View</span>
              <span className="sm:hidden">Split</span>
            </button>
            <button
              onClick={() => setViewMode('passenger')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === 'passenger'
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">Passenger App</span>
              <span className="sm:hidden">Passenger</span>
            </button>
            <button
              onClick={() => setViewMode('driver')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === 'driver'
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">Driver Dashboard</span>
              <span className="sm:hidden">Driver</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-14">
        {viewMode === 'split' && (
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-56px)]">
            {/* Passenger Side */}
            <div className="lg:w-1/2 border-b lg:border-b-0 lg:border-r border-slate-300">
              <div className="bg-pink-500 text-white text-center py-2 font-semibold text-sm">
                PASSENGER VIEW (Light Mode)
              </div>
              <PassengerApp />
            </div>

            {/* Driver Side */}
            <div className="lg:w-1/2">
              <div className="bg-[hsl(220,65%,25%)] text-white text-center py-2 font-semibold text-sm">
                DRIVER VIEW (Dark Mode)
              </div>
              <DriverDashboard />
            </div>
          </div>
        )}

        {viewMode === 'passenger' && (
          <PassengerApp className="min-h-[calc(100vh-56px)]" />
        )}

        {viewMode === 'driver' && (
          <DriverDashboard className="min-h-[calc(100vh-56px)]" />
        )}
      </div>
    </main>
  );
}
