import { create } from 'zustand';
import stopsData from '../data/stops.json';
import routesData from '../data/routes.json';
import busesCfg from '../data/buses.json';

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
  // route is an ordered list of stop indices (indexes into OULU_STOPS)
  route: number[];
  // index within `route` pointing to the next stop the bus is heading to
  routePos: number;
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

const OULU_STOPS: BusStop[] = stopsData;

// Constants loaded from JSON config
const SECONDS_PER_STOP = busesCfg.secondsPerStop;

// Routes map: lineNumber -> ordered list of stop indices (indexes into OULU_STOPS)
export const ROUTES: Record<number, number[]> = Object.entries(routesData).reduce(
  (acc, [key, val]) => ({ ...acc, [Number(key)]: val }),
  {}
);

// Helper: get all line numbers that serve a given stop index
export function getAvailableLinesForStop(stopIndex: number): number[] {
  return Object.entries(ROUTES)
    .filter(([_, route]) => route.includes(stopIndex))
    .map(([line]) => Number(line))
    .sort((a, b) => a - b);
}

// Helper: create an initial fleet with `perLine` buses distributed along each line's route
function createInitialBuses(perLine = busesCfg.busesPerLine): Bus[] {
  const fleet: Bus[] = [];
  const lineNumbers = Object.keys(ROUTES).map(Number).sort((a, b) => a - b);
  for (const line of lineNumbers) {
    const route = ROUTES[line];
    if (!route || route.length === 0) continue;
    const routeLen = route.length;
    for (let i = 0; i < perLine; i++) {
      const routePos = Math.floor((i * routeLen) / perLine) % routeLen;
      const timeToNextStopSeconds = busesCfg.timeToNextStopSecondsMin + Math.floor(Math.random() * (busesCfg.timeToNextStopSecondsMax - busesCfg.timeToNextStopSecondsMin + 1));
      fleet.push({
        id: `bus-${line}-${i + 1}`,
        line,
        route,
        routePos,
        timeToNextStopSeconds,
        status: 'running',
      });
    }
  }
  return fleet;
}

export const useTransitStore = create<TransitStore>((set, get) => ({
  stops: OULU_STOPS,
  currentStopIndex: 0,
  signals: [],
  // generated fleet: 5 buses per line
  buses: createInitialBuses(5),
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

    // Attempt to assign the best bus on this line (considering route order)
    const candidateBuses = get().buses.filter((b) => b.line === line && b.status === 'running' && b.route && b.route.includes(stopIndex));
    let assignedBusId: string | undefined;
    let assignedEta: number | undefined;

    if (candidateBuses.length > 0) {
      let bestEta = Number.POSITIVE_INFINITY;
      for (const b of candidateBuses) {
        const routeLen = b.route.length;
        const posTarget = b.route.indexOf(stopIndex);
        if (posTarget === -1) continue;
        const stopsAhead = (posTarget - b.routePos + routeLen) % routeLen;
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
        const stops = state.stops;

        // Update buses: decrement time to next stop, advance along their route when reaching 0
        const arrivals: Array<{ busId: string; stopIndex: number }> = [];
        const updatedBuses = (state.buses || []).map((b) => {
          if (b.status !== 'running' || !b.route || b.route.length === 0) return b;
          let time = b.timeToNextStopSeconds - 1;
          let routePos = b.routePos;
          if (time <= 0) {
            // bus has arrived at the stop indicated by route[routePos]
            const arrivedStop = b.route[routePos];
            arrivals.push({ busId: b.id, stopIndex: arrivedStop });
            routePos = (routePos + 1) % b.route.length; // move to next stop in its route
            time = SECONDS_PER_STOP;
          }
          return { ...b, routePos, timeToNextStopSeconds: Math.max(0, time) };
        });

        // Update signals: decrement timers and remove expired
        let updatedSignals = state.signals
          .map((s) => ({ ...s, remainingSeconds: s.remainingSeconds - 1 }))
          .filter((s) => s.remainingSeconds > 0);

        // Remove signals that were just served by an arriving bus
        if (arrivals.length > 0) {
          const arrivedSet = new Set(arrivals.map((a) => `${a.busId}::${stops[a.stopIndex].name}`));
          updatedSignals = updatedSignals.filter((s) => {
            // remove if this signal was assigned to a bus that has just arrived at this stop
            if (s.assignedBusId && arrivedSet.has(`${s.assignedBusId}::${s.stopName}`)) {
              return false;
            }
            return true;
          });
        }

        // Recompute assignment and ETA for each remaining signal (choose shortest-time bus per line)
        updatedSignals = updatedSignals.map((s) => {
          const stopIndex = Math.max(0, stops.findIndex((st) => st.name === s.stopName));

          // find candidate buses (must be running and serve the stop on their route)
          const candidates = updatedBuses.filter((b) => b.line === s.line && b.status === 'running' && b.route && b.route.includes(stopIndex));

          if (candidates.length === 0) {
            // no candidates; keep previous assigned bus if any, just keep counting down
            return s;
          }

          // pick bus with smallest ETA using route positions
          let bestEta = Number.POSITIVE_INFINITY;
          let bestBusId: string | undefined;
          for (const b of candidates) {
            const routeLen = b.route.length;
            const posTarget = b.route.indexOf(stopIndex);
            if (posTarget === -1) continue;
            const stopsAhead = (posTarget - b.routePos + routeLen) % routeLen;
            const eta = b.timeToNextStopSeconds + stopsAhead * SECONDS_PER_STOP;
            if (eta < bestEta) {
              bestEta = eta;
              bestBusId = b.id;
            }
          }

          if (bestBusId) {
            return { ...s, assignedBusId: bestBusId, remainingSeconds: Math.max(0, Math.floor(bestEta)) };
          }

          return s;
        }).filter((s) => s.remainingSeconds > 0);

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
