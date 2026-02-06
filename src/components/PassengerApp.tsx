'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useTransitStore, getAvailableLinesForStop } from '@/lib/store';

const BUS_LINES = [
  { number: 1, route: 'Keskusta - Linnanmaa', color: 'bg-pink-500' },
  { number: 2, route: 'Rautatieasema - Välivainio', color: 'bg-indigo-500' },
  { number: 3, route: 'Hiukkavaara Loop', color: 'bg-yellow-500' },
  { number: 4, route: 'Central Shuttle', color: 'bg-sky-500' },
  { number: 5, route: 'Teknologiakylä - Yliopisto', color: 'bg-emerald-500' },
];

// Oulu 2026 Logo Component - Faithful to the official design
function Oulu2026Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg viewBox="0 0 40 40" className="h-9 w-9" aria-label="Oulu 2026 symbol">
        <defs>
          <linearGradient id="sunGradientLogo" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>
          <linearGradient id="snowflakeGradientLogo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#1e3a5f" />
          </linearGradient>
        </defs>
        {/* Sun rays - top portion */}
        <g fill="url(#sunGradientLogo)">
          <rect x="18.5" y="2" width="3" height="8" rx="1.5" />
          <rect x="18.5" y="2" width="3" height="8" rx="1.5" transform="rotate(18 20 20)" />
          <rect x="18.5" y="2" width="3" height="8" rx="1.5" transform="rotate(36 20 20)" />
          <rect x="18.5" y="2" width="3" height="8" rx="1.5" transform="rotate(54 20 20)" />
          <rect x="18.5" y="2" width="3" height="8" rx="1.5" transform="rotate(72 20 20)" />
          <rect x="18.5" y="2" width="3" height="8" rx="1.5" transform="rotate(90 20 20)" />
        </g>
        {/* Snowflake - bottom portion with branches */}
        <g fill="url(#snowflakeGradientLogo)">
          <rect x="18.5" y="30" width="3" height="8" rx="1.5" />
          <rect x="18.5" y="30" width="3" height="8" rx="1.5" transform="rotate(-30 20 20)" />
          <rect x="18.5" y="30" width="3" height="8" rx="1.5" transform="rotate(-60 20 20)" />
          <rect x="18.5" y="30" width="3" height="8" rx="1.5" transform="rotate(-90 20 20)" />
          <rect x="18.5" y="30" width="3" height="8" rx="1.5" transform="rotate(-120 20 20)" />
          <rect x="18.5" y="30" width="3" height="8" rx="1.5" transform="rotate(-150 20 20)" />
          {/* Branch details */}
          <rect x="8" y="28" width="2" height="5" rx="1" transform="rotate(-45 20 20)" />
          <rect x="30" y="28" width="2" height="5" rx="1" transform="rotate(45 20 20)" />
          <rect x="5" y="20" width="2" height="4" rx="1" transform="rotate(-15 20 20)" />
          <rect x="33" y="20" width="2" height="4" rx="1" transform="rotate(15 20 20)" />
        </g>
      </svg>
      <div className="text-right">
        <p className="text-sm font-bold text-[hsl(220,65%,25%)] leading-tight">Oulu2026</p>
        <p className="text-[9px] text-slate-500 leading-tight">European Capital of Culture</p>
      </div>
    </div>
  );
}

// NFC/Tap Icon
function TapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hand */}
      <path
        d="M32 48c-8 0-12-4-12-12V24c0-4 3-7 7-7s7 3 7 7v6h4c4 0 7 3 7 7v6c0 8-5 12-13 12z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Finger pointing */}
      <path
        d="M32 14c2 0 3 1.5 3 3.5V28h-6V17.5c0-2 1-3.5 3-3.5z"
        fill="currentColor"
      />
      {/* NFC waves */}
      <path
        d="M45 20c3 3 5 7 5 12s-2 9-5 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M50 16c4 4 6 10 6 16s-2 12-6 16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
}

// Success Checkmark Icon
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" fill="currentColor" opacity="0.15" />
      <circle cx="32" cy="32" r="22" fill="currentColor" opacity="0.25" />
      <path
        d="M20 32l8 8 16-16"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface PassengerAppProps {
  className?: string;
}

export default function PassengerApp({ className }: PassengerAppProps) {
  const [showLineSelector, setShowLineSelector] = useState(false);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const { stops, selectedStop, setSelectedStop, sendSignal, cancelSignal, passengerMode, setPassengerMode } = useTransitStore();
  const signals = useTransitStore((s) => s.signals);

  // In generic mode, track all user's signals; in single mode, track one
  const userSignals = signals.filter((s) => s.mode === passengerMode);

  const handleTapSignal = () => {
    setShowLineSelector(true);
  };

  const handleLineSelect = (lineNumber: number) => {
    setSelectedLine(lineNumber);
    sendSignal(selectedStop, lineNumber, passengerMode);
    // In generic mode, keep showing the selector so user can add more; in single, close it
    if (passengerMode === 'single') {
      setShowLineSelector(false);
    }
    // Don't reset selectedLine in generic mode
  };

  const handleCancelSignal = (signalId: string) => {
    cancelSignal(signalId);
  };

  const formatRemaining = (secs: number) => {
    const s = Math.max(0, Math.floor(secs));
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${mm}:${ss.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 ${className}`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-md mx-auto px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[hsl(220,65%,25%)]">OSL</h1>
              <p className="text-xs text-slate-500">Oulu Region Transport</p>
            </div>
            <Oulu2026Logo />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Mode:</span>
            <button
              onClick={() => setPassengerMode('single')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                passengerMode === 'single'
                  ? 'bg-pink-500 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setPassengerMode('generic')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                passengerMode === 'generic'
                  ? 'bg-pink-500 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Generic
            </button>
            {passengerMode === 'generic' && userSignals.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-500 text-white">
                {userSignals.length} active
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Current Stop Selector */}
        <Card className="bg-white border-slate-200 shadow-md">
          <CardContent className="p-4">
            <label className="text-sm font-medium text-slate-600 block mb-2">
              Select Your Stop
            </label>
            <select
              value={selectedStop}
              onChange={(e) => setSelectedStop(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-lg font-medium text-[hsl(220,65%,25%)] focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
            >
              {stops.map((stop) => (
                <option key={stop.id} value={stop.name}>
                  {stop.name} ({stop.nameEn})
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Main Signal Button / Active Signals */}
        <div className="flex flex-col items-center py-8 w-full">
          {passengerMode === 'single' ? (
            // Single mode: show large Tap / Signal Sent UI for one signal
            (() => {
              const signal = userSignals[0];
              return !signal ? (
                <>
                  <button
                    onClick={handleTapSignal}
                    className="w-56 h-56 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-white flex flex-col items-center justify-center shadow-2xl hover:from-pink-600 hover:to-pink-700 transition-all duration-300 animate-signal-pulse focus:outline-none focus:ring-4 focus:ring-pink-300"
                    aria-label="Tap to signal bus"
                  >
                    <TapIcon className="w-20 h-20 mb-2" />
                    <span className="text-xl font-bold">Tap to Signal</span>
                    <span className="text-sm opacity-80">Bus</span>
                  </button>
                  <p className="mt-6 text-center text-slate-500 text-sm max-w-xs">
                    Tap the button to notify approaching buses that you are waiting at this stop
                  </p>
                </>
              ) : (
                <div className="animate-fade-in flex flex-col items-center w-full">
                  <div className="w-56 h-56 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-white flex flex-col items-center justify-center shadow-2xl animate-success-pulse">
                    <CheckIcon className="w-24 h-24 mb-2" />
                    <span className="text-xl font-bold">Signal Sent</span>
                  </div>
                  <Card className="mt-6 bg-emerald-50 border-emerald-200 w-full">
                    <CardContent className="p-4 text-center">
                      <Badge className="bg-emerald-500 text-white mb-2">
                        Line {signal.line}
                      </Badge>
                      <p className="text-emerald-800 font-medium">Bus Line {signal.line} notified.</p>
                      <p className="text-sm text-emerald-700 mt-1">Stop: {signal.stopName}</p>
                      {signal.assignedBusId ? (
                        <p className="text-sm text-emerald-700 mt-1">Assigned: <span className="font-mono">{signal.assignedBusId}</span></p>
                      ) : null}
                      <p className="text-emerald-700 font-mono text-lg mt-2">Arrival in {formatRemaining(signal.remainingSeconds)}</p>
                    </CardContent>
                  </Card>
                  <div className="mt-4 flex gap-2 justify-center">
                    <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={() => handleCancelSignal(signal.id)}>
                      Cancel Signal
                    </Button>
                  </div>
                </div>
              );
            })()
          ) : (
            // Generic mode: show list of active signals and allow adding more
            <div className="animate-fade-in w-full space-y-4">
              {/* Active Signals List */}
              <div className="space-y-3">
                {userSignals.map((signal) => (
                  <Card key={signal.id} className="bg-emerald-50 border-emerald-200 border-2">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-emerald-500 text-white">Line {signal.line}</Badge>
                            <Badge variant="outline" className="border-emerald-300 text-emerald-700">{signal.stopName}</Badge>
                          </div>
                          <p className="text-emerald-700 font-mono text-sm">Arrival in {formatRemaining(signal.remainingSeconds)}</p>
                          {signal.assignedBusId && (
                            <p className="text-xs text-emerald-700 mt-1">Assigned: <span className="font-mono">{signal.assignedBusId}</span></p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleCancelSignal(signal.id)} className="text-red-500 hover:text-red-700 hover:bg-red-100 text-xs h-8">✕</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Send Another Signal Button */}
              <button onClick={handleTapSignal} className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold hover:from-pink-600 hover:to-pink-700 transition-all shadow-md">
                + Add Another Stop
              </button>
            </div>
          )}
        </div>

        {/* Quick Info */}
        <Card className="bg-[hsl(220,65%,25%)] text-white border-0">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">How it works</h3>
            <ul className="text-sm space-y-2 opacity-90">
              <li className="flex items-start gap-2">
                <span className="bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                <span>Select your current bus stop</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                <span>Tap the signal button</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                <span>Choose your bus line</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
                <span>Stay visible - your bus driver is notified!</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>

      {/* Line Selection Dialog */}
      <Dialog open={showLineSelector} onOpenChange={setShowLineSelector}>
        <DialogContent className="max-w-sm mx-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-center text-[hsl(220,65%,25%)]">
              Select Bus Line {passengerMode === 'generic' && `for ${selectedStop}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {BUS_LINES.filter((line) => {
              const stopIndex = stops.findIndex((s) => s.name === selectedStop);
              const availableLineNumbers = getAvailableLinesForStop(stopIndex);
              return availableLineNumbers.includes(line.number);
            }).map((line) => (
              <button
                key={line.number}
                onClick={() => {
                  handleLineSelect(line.number);
                  if (passengerMode === 'single') {
                    setShowLineSelector(false);
                  }
                }}
                className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-pink-500 hover:bg-pink-50 transition-all flex items-center gap-4 group"
              >
                <span className={`w-12 h-12 rounded-xl ${line.color} text-white flex items-center justify-center text-xl font-bold`}>
                  {line.number}
                </span>
                <div className="text-left">
                  <p className="font-semibold text-[hsl(220,65%,25%)] group-hover:text-pink-600">
                    Line {line.number}
                  </p>
                  <p className="text-sm text-slate-500">
                    {line.route}
                  </p>
                </div>
              </button>
            ))}
          </div>
          {passengerMode === 'generic' && userSignals.length > 0 && (
            <div className="border-t pt-3">
              <Button
                variant="outline"
                className="w-full text-slate-600"
                onClick={() => setShowLineSelector(false)}
              >
                Done Adding Signals
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
