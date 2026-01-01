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
}

interface TransitStore {
  // Stops data
  stops: BusStop[];
  currentStopIndex: number;

  // Signals
  signals: Signal[];

  // Passenger state
  selectedStop: string;

  // Actions
  sendSignal: (stopName: string, line: number) => void;
  acknowledgeSignal: (signalId: string) => void;
  dismissSignal: (signalId: string) => void;
  setSelectedStop: (stopName: string) => void;
  advanceToNextStop: () => void;
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

export const useTransitStore = create<TransitStore>((set, get) => ({
  stops: OULU_STOPS,
  currentStopIndex: 0,
  signals: [],
  selectedStop: OULU_STOPS[0].name,

  sendSignal: (stopName: string, line: number) => {
    const newSignal: Signal = {
      id: `signal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      stopName,
      line,
      timestamp: new Date(),
      acknowledged: false,
    };
    set((state) => ({
      signals: [newSignal, ...state.signals],
    }));
  },

  acknowledgeSignal: (signalId: string) => {
    set((state) => ({
      signals: state.signals.map((s) =>
        s.id === signalId ? { ...s, acknowledged: true } : s
      ),
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
}));
