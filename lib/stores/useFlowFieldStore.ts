import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FlowFieldParams } from '@/components/generators/flow-field/FlowFieldSketch';

// Debounce utility for URL updates
const debounce = (fn: (name: string, value: string) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (name: string, value: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(name, value), delay);
  };
};

interface FlowFieldStore extends FlowFieldParams {
  updateParams: (params: Partial<FlowFieldParams>) => void;
  resetParams: () => void;
}

const defaultParams: FlowFieldParams = {
  particleCount: 800,  // Reduced for better performance
  noiseScale: 0.01,
  speed: 2,
  fadeRate: 0.98,  // Slightly higher to reduce overdraw
  mouseForce: 100,  // Increased for better visibility
  colorMode: 'velocity',
  renderMode: 'lines',
};

// Debounced URL update function
const updateURL = debounce((name: string, value: string) => {
  const params = btoa(value);
  const url = new URL(window.location.href);
  url.searchParams.set(name, params);
  window.history.replaceState({}, '', url);
}, 1000); // 1000ms delay to reduce URL updates

// Custom URL storage for sharing
const urlStorage = {
  getItem: (name: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    const params = searchParams.get(name);
    return params ? JSON.parse(atob(params)) : null;
  },
  setItem: (name: string, value: string) => {
    // Use debounced update for better performance
    updateURL(name, value);
  },
  removeItem: (name: string) => {
    const url = new URL(window.location.href);
    url.searchParams.delete(name);
    window.history.replaceState({}, '', url);
  },
};

export const useFlowFieldStore = create<FlowFieldStore>()(
  persist(
    (set) => ({
      ...defaultParams,
      
      updateParams: (params) => set((state) => ({
        ...state,
        ...params,
      })),
      
      resetParams: () => set(defaultParams),
    }),
    {
      name: 'flow-field',
      storage: createJSONStorage(() => 
        typeof window !== 'undefined' ? urlStorage : localStorage
      ),
      partialize: (state) => {
        // Only persist state values, exclude functions
        return Object.fromEntries(
          Object.entries(state).filter(([key]) => 
            key !== 'updateParams' && key !== 'resetParams'
          )
        ) as Partial<FlowFieldStore>;
      },
    }
  )
);