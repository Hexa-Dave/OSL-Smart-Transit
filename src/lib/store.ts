import { create } from 'zustand';

export interface BusStop {
  id: string;
  name: string;
  nameEn: string;
  distance: string;
  eta: string;
}

export interface Signal {
  id: string;
  stopName: string;
  line: number;
  timestamp: Date;
  acknowledged: boolean;
  // remaining time in seconds until the bus arrives / signal expires
  remainingSeconds: number;
  // mode: "single" (exclusive) or "generic" (multiple concurrent)
  mode: 'single' | 'generic';
  // assigned physical bus id (when the system picks a bus)
  assignedBusId?: string;
}

export interface Bus {
  id: string;
  line: number;
  currentStopIndex: number;
  // seconds until the bus reaches the next stop
  timeToNextStopSeconds: number;
  status: 'running' | 'out-of-service';
  // optional GPS position for future use
  position?: { lat: number; lon: number; accuracy?: number };
}

interface TransitStore {
  // Stops data
  stops: BusStop[];
  currentStopIndex: number;

  // Signals
  signals: Signal[];

  // Buses
  buses: Bus[];

  // Passenger state
  selectedStop: string;
  passengerMode: 'single' | 'generic';
  
  // Driver state
  driverBusFilter: 'single' | 'all'; // single = line 1 only, all = all lines
  
  // UI state
  driverFilteredLine: number; // which line to show in "single" mode

  // Actions
  sendSignal: (stopName: string, line: number, mode: 'single' | 'generic') => void;
  cancelSignal: (signalId: string) => void;
  dismissSignal: (signalId: string) => void;
  setSelectedStop: (stopName: string) => void;
  advanceToNextStop: () => void;
  setPassengerMode: (mode: 'single' | 'generic') => void;
  setDriverBusFilter: (filter: 'single' | 'all') => void;
  setDriverFilteredLine: (line: number) => void;

  // Bus actions
  addBus: (bus: Bus) => void;
  updateBusPosition: (busId: string, pos: { lat: number; lon: number; accuracy?: number }) => void;
  setBusStatus: (busId: string, status: 'running' | 'out-of-service') => void;
}

const OULU_STOPS: BusStop[] = [
  { id: '1', name: 'Kaupungintalo', nameEn: 'City Hall', distance: '0.3 km', eta: '1 min' },
  { id: '2', name: 'Toripakka', nameEn: 'Market Square', distance: '0.8 km', eta: '2 min' },
  { id: '3', name: 'Rautatieasema', nameEn: 'Railway Station', distance: '1.5 km', eta: '4 min' },
  { id: '4', name: 'Teknologiakylä', nameEn: 'Technology Village', distance: '2.8 km', eta: '7 min' },
  { id: '5', name: 'Yliopisto', nameEn: 'University', distance: '4.2 km', eta: '10 min' },
  { id: '6', name: 'Kontinkangas', nameEn: 'Kontinkangas', distance: '5.6 km', eta: '13 min' },
  { id: '7', name: 'Linnanmaa', nameEn: 'Linnanmaa', distance: '7.1 km', eta: '16 min' },
];

const SECONDS_PER_STOP = 90; // seconds between stops (used by simulation)

export const useTransitStore = create<TransitStore>((set, get) => ({
  stops: OULU_STOPS,
  currentStopIndex: 0,
  signals: [],
  // sample buses for simulation
  buses: [
    { id: 'bus-1-1', line: 1, currentStopIndex: 0, timeToNextStopSeconds: 30, status: 'running' },
    { id: 'bus-2-1', line: 1, currentStopIndex: 3, timeToNextStopSeconds: 120, status: 'running' },
    { id: 'bus-1-5', line: 5, currentStopIndex: 1, timeToNextStopSeconds: 20, status: 'running' },
  ],
  selectedStop: OULU_STOPS[0].name,
  passengerMode: 'single',
  driverBusFilter: 'all',
  driverFilteredLine: 1,

  sendSignal: (stopName: string, line: number, mode: 'single' | 'generic' = 'single') => {
    // In single mode, cancel any existing signal
    if (mode === 'single') {
      const existingSignal = get().signals.find((s) => s.mode === 'single');
      if (existingSignal) {
        set((state) => ({
          signals: state.signals.filter((s) => s.id !== existingSignal.id),
        }));
      }
    }

    const stops = get().stops;
    const stopIndex = Math.max(0, stops.findIndex((s) => s.name === stopName));
    const baseArrival = 30; // minimum time in seconds

    // Attempt to assign the best bus on this line
    const candidateBuses = get().buses.filter((b) => b.line === line && b.status === 'running');
    let assignedBusId: string | undefined;
    let assignedEta: number | undefined;

    if (candidateBuses.length > 0) {
      let bestEta = Number.POSITIVE_INFINITY;
      for (const b of candidateBuses) {
        const stopsAhead = Math.max(0, stopIndex - b.currentStopIndex);
        // skip buses that have already passed the stop for now
        if (stopIndex < b.currentStopIndex) continue;
        const eta = b.timeToNextStopSeconds + stopsAhead * SECONDS_PER_STOP;
        if (eta < bestEta) {
          bestEta = eta;
          assignedBusId = b.id;
          assignedEta = eta;
        }
      }
    }

    // Fallback ETA (global estimation) if no bus assigned
    const currentIndex = get().currentStopIndex;
    const stopsAheadGlobal = Math.max(0, stopIndex - currentIndex);
    const etaFallback = Math.max(baseArrival, stopsAheadGlobal * SECONDS_PER_STOP + baseArrival);
    const remaining = assignedEta ?? etaFallback;

    const newSignal: Signal = {
      id: `signal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      stopName,
      line,
      timestamp: new Date(),
      acknowledged: false,
      remainingSeconds: remaining,
      mode,
      assignedBusId,
    };

    set((state) => ({
      signals: [newSignal, ...state.signals],
    }));

    // start ticking if not already
    startTicker();
  },

  cancelSignal: (signalId: string) => {
    set((state) => ({
      signals: state.signals.filter((s) => s.id !== signalId),
    }));
  },

  dismissSignal: (signalId: string) => {
    set((state) => ({
      signals: state.signals.filter((s) => s.id !== signalId),
    }));
  },

  setSelectedStop: (stopName: string) => {
    set({ selectedStop: stopName });
  },

  advanceToNextStop: () => {
    set((state) => ({
      currentStopIndex: Math.min(state.currentStopIndex + 1, state.stops.length - 1),
    }));
  },

  setPassengerMode: (mode: 'single' | 'generic') => {
    set({ passengerMode: mode });
  },

  setDriverBusFilter: (filter: 'single' | 'all') => {
    set({ driverBusFilter: filter });
  },

  setDriverFilteredLine: (line: number) => {
    set({ driverFilteredLine: line });
  },

  // Bus actions
  addBus: (bus) => set((state) => ({ buses: [bus, ...state.buses] })),
  updateBusPosition: (busId, pos) => set((state) => ({ buses: state.buses.map(b => b.id === busId ? { ...b, position: pos } : b) })),
  setBusStatus: (busId, status) => set((state) => ({ buses: state.buses.map(b => b.id === busId ? { ...b, status } : b) })),

}));

// Ticker implementation outside the zustand factory so it persists across calls
let tickerId: ReturnType<typeof setInterval> | null = null;
function startTicker() {
  if (tickerId) return;
  tickerId = setInterval(() => {
    try {
      useTransitStore.setState((state) => {
        // Update signals
        const updatedSignals = state.signals
          .map((s) => ({ ...s, remainingSeconds: s.remainingSeconds - 1 }))
          .filter((s) => s.remainingSeconds > 0);

        // Update buses: decrement time to next stop, advance when reaching 0
        const updatedBuses = (state.buses || []).map((b) => {
          if (b.status !== 'running') return b;
          let time = b.timeToNextStopSeconds - 1;
          let index = b.currentStopIndex;
          if (time <= 0) {
            index = (index + 1) % state.stops.length; // loop route
            time = SECONDS_PER_STOP;
          }
          return { ...b, currentStopIndex: index, timeToNextStopSeconds: Math.max(0, time) };
        });

        // Determine whether to keep ticker running
        const anySignals = updatedSignals.length > 0;
        const anyBusesRunning = updatedBuses.some((b) => b.status === 'running');

        if (!anySignals && !anyBusesRunning && tickerId) {
          clearInterval(tickerId);
          tickerId = null;
        }

        return { signals: updatedSignals, buses: updatedBuses } as Partial<TransitStore> as TransitStore;
      });
    } catch (e) {
      // swallow errors from setState
    }
  }, 1000);
}
