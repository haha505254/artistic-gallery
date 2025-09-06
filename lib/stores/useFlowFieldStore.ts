import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FlowFieldParams } from '@/components/generators/flow-field/FlowFieldSketch';

interface FlowFieldStore extends FlowFieldParams {
  updateParams: (params: Partial<FlowFieldParams>) => void;
  resetParams: () => void;
}

const defaultParams: FlowFieldParams = {
  particleCount: 5000,
  noiseScale: 0.01,
  speed: 2,
  fadeRate: 0.95,
  mouseForce: 30,
  colorMode: 'velocity',
  renderMode: 'lines',
};

// Custom URL storage for sharing
const urlStorage = {
  getItem: (name: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    const params = searchParams.get(name);
    return params ? JSON.parse(atob(params)) : null;
  },
  setItem: (name: string, value: string) => {
    const params = btoa(value);
    const url = new URL(window.location.href);
    url.searchParams.set(name, params);
    window.history.replaceState({}, '', url);
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
        const { updateParams, resetParams, ...params } = state;
        return params;
      },
    }
  )
);