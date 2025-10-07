
'use client';

import { useState, useEffect } from 'react';
import type { HolisticAnalysisOutput, RecentReadings, Reminder } from '@/ai/types';

export interface AiState {
  aiState: HolisticAnalysisOutput | null;
  isLoading: boolean;
  error: string | null;
  sensorData: RecentReadings | null;
  reminders: Reminder[] | null;
  userBaseline: RecentReadings | null;
}

// This is a simple in-memory store that is NOT a React hook.
// It allows any part of the app to update the state.
let globalState: AiState = {
  aiState: null,
  isLoading: true,
  error: null,
  sensorData: null,
  reminders: [],
  userBaseline: null,
};

// Listeners that will be called when the state changes.
const listeners: Set<() => void> = new Set();

// Function to update the global state and notify listeners.
const updateState = (newState: Partial<AiState>) => {
  globalState = { ...globalState, ...newState };
  listeners.forEach((listener) => listener());
};

// Exported functions for different components/routes to use.
export const setAiState = (state: Partial<AiState>) => {
  updateState(state);
};


export const setAiLoading = () => {
  updateState({ isLoading: true, error: null });
};

export const getAiState = (): AiState => {
    return globalState;
}

// This is the actual React hook that components will use.
export const useAiState = (): AiState => {
  const [state, setState] = useState(globalState);

  useEffect(() => {
    const listener = () => {
      setState(globalState);
    };

    listeners.add(listener);
    // Initial sync to get the latest state on mount
    listener();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return state;
};
