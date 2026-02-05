'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTransitStore, type Signal } from '@/lib/store';

// Clock Component
function DigitalClock() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('fi-FI', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span className="font-mono text-2xl">{time}</span>;
}

// Bus Icon
function BusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
    </svg>
  );
}

// Alert Icon
function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );
}

// Stop Marker
function StopMarker({ isNext, isPassed }: { isNext: boolean; isPassed: boolean }) {
  if (isPassed) {
    return (
      <div className="w-4 h-4 rounded-full bg-slate-600 border-2 border-slate-500" />
    );
  }
  if (isNext) {
    return (
      <div className="w-5 h-5 rounded-full bg-pink-500 border-2 border-pink-400 animate-pulse" />
    );
  }
  return (
    <div className="w-4 h-4 rounded-full bg-slate-700 border-2 border-slate-500" />
  );
}

interface DriverDashboardProps {
  className?: string;
}

export default function DriverDashboard({ className }: DriverDashboardProps) {
  const { stops, currentStopIndex, signals, dismissSignal, driverBusFilter, setDriverBusFilter, driverFilteredLine, setDriverFilteredLine, buses } = useTransitStore();
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Play alert sound for new signals
  useEffect(() => {
    const unacknowledgedSignals = signals.filter(s => !s.acknowledged);
    if (unacknowledgedSignals.length > 0 && audioEnabled) {
      // In a real app, this would play an audio alert
      // For now, we'll just have visual feedback
    }
  }, [signals, audioEnabled]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fi-FI', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Filter signals based on driver bus mode
  const filteredSignals = driverBusFilter === 'single'
    ? signals.filter((s) => s.line === driverFilteredLine)
    : signals;

  // Count passengers waiting at each stop
  const getPassengerCountAtStop = (stopName: string) => {
    return filteredSignals.filter((s) => s.stopName === stopName).length;
  };

  const unacknowledgedSignals = signals.filter(s => !s.acknowledged);
  const acknowledgedSignals = signals.filter(s => s.acknowledged);

  return (
    <div className={`dark min-h-screen bg-[hsl(222,47%,8%)] text-slate-100 ${className}`}>
      {/* Header */}
      <header className="bg-[hsl(222,47%,12%)] border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
              <BusIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">OSL Driver Dashboard</h1>
              <p className="text-xs text-slate-400">Smart Transit Signal System</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <Badge variant="outline" className="border-emerald-500 text-emerald-400 px-3 py-1">
                {driverBusFilter === 'single' ? `Line ${driverFilteredLine} - Active` : 'All Lines - Active'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs font-medium text-slate-400">Bus Filter:</span>
              <button
                onClick={() => setDriverBusFilter('single')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  driverBusFilter === 'single'
                    ? 'bg-pink-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Single
              </button>
              <button
                onClick={() => setDriverBusFilter('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  driverBusFilter === 'all'
                    ? 'bg-pink-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                All
              </button>
              {driverBusFilter === 'single' && (
                <select
                  value={driverFilteredLine}
                  onChange={(e) => setDriverFilteredLine(Number(e.target.value))}
                  className="px-2 py-1 text-xs bg-slate-700 text-slate-100 border border-slate-600 rounded-lg"
                >
                  <option value={1}>Line 1</option>
                  <option value={5}>Line 5</option>
                  <option value={10}>Line 10</option>
                </select>
              )}
            </div>
            <div className="text-right ml-auto">
              <DigitalClock />
              <p className="text-xs text-slate-400">Oulu, Finland</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <div className="flex h-[calc(100vh-72px)]">
        {/* Left Panel - Stops List */}
        <div className="w-1/2 border-r border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700 bg-[hsl(222,47%,10%)]">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Upcoming Stops
            </h2>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-1">
              {stops.map((stop, index) => {
                const isNext = index === currentStopIndex;
                const isPassed = index < currentStopIndex;
                const passengerCount = getPassengerCountAtStop(stop.name);
                const hasWaitingPassenger = passengerCount > 0;

                return (
                  <div
                    key={stop.id}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                      isNext
                        ? 'bg-pink-500/20 border border-pink-500/50'
                        : isPassed
                          ? 'opacity-50'
                          : 'hover:bg-slate-800/50'
                    } ${hasWaitingPassenger ? 'ring-2 ring-amber-500/50' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <StopMarker isNext={isNext} isPassed={isPassed} />
                      {index < stops.length - 1 && (
                        <div className={`w-0.5 h-8 ${isPassed ? 'bg-slate-600' : 'bg-slate-700'}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${isNext ? 'text-pink-400' : 'text-white'}`}>
                          {stop.name}
                        </h3>
                        {hasWaitingPassenger && (
                          <Badge className="bg-amber-500 text-black text-xs animate-pulse">
                            {passengerCount} {passengerCount === 1 ? 'PASSENGER' : 'PASSENGERS'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{stop.nameEn}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono text-sm ${isNext ? 'text-pink-400' : 'text-slate-300'}`}>
                        {stop.eta}
                      </p>
                      <p className="text-xs text-slate-500">{stop.distance}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Live Alerts */}
        <div className="w-1/2 flex flex-col">
          <div className="p-4 border-b border-slate-700 bg-[hsl(222,47%,10%)] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
              Live Alerts
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`text-xs ${audioEnabled ? 'border-emerald-500 text-emerald-400' : 'border-slate-500 text-slate-400'}`}
            >
              {audioEnabled ? 'Sound ON' : 'Sound OFF'}
            </Button>
          </div>

          {/* Fleet */}
          <div className="p-4 border-b border-slate-700 bg-[hsl(222,47%,10%)]">
            <h3 className="text-sm font-semibold text-white mb-2">Fleet</h3>
            <div className="space-y-2">
              {buses.map((bus) => {
                const nextStop = stops[bus.currentStopIndex];
                return (
                  <div key={bus.id} className="flex items-center justify-between bg-slate-800 p-2 rounded-md">
                    <div>
                      <div className="text-sm font-semibold">Bus {bus.id} <span className="text-xs text-slate-400">Line {bus.line}</span></div>
                      <div className="text-xs text-slate-400">{nextStop?.name ?? '—'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">{bus.timeToNextStopSeconds}s</div>
                      <div className="text-xs text-slate-400">{bus.status}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            {filteredSignals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                  <BusIcon className="w-10 h-10 text-slate-600" />
                </div>
                <p className="text-center">No passenger signals</p>
                <p className="text-sm text-slate-600 mt-1">Alerts will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Alerts grouped by stop */}
                {Array.from(new Set(filteredSignals.map((s) => s.stopName))).map((stopName) => {
                  const alertsAtStop = filteredSignals.filter((s) => s.stopName === stopName);
                  return (
                    <Card key={stopName} className="bg-amber-500/10 border-2 border-amber-500 animate-alert-flash">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-amber-400 mb-1">
                              {alertsAtStop.length} {alertsAtStop.length === 1 ? 'PASSENGER' : 'PASSENGERS'} WAITING
                            </h3>
                            <p className="text-white font-semibold">
                              {stopName}
                            </p>
                            <div className="text-xs text-amber-200 mt-2 space-y-1">
                              {alertsAtStop.map((signal) => (
                                <div key={signal.id} className="flex justify-between items-center gap-2">
                                  <span>Line {signal.line}</span>
                                  <span className="font-mono text-amber-300">
                                    ETA: {Math.floor(signal.remainingSeconds / 60)}:{(signal.remainingSeconds % 60).toString().padStart(2, '0')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => alertsAtStop.forEach((s) => dismissSignal(s.id))}
                            className="text-slate-400 hover:text-slate-200 text-xs h-8"
                          >
                            Clear
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
