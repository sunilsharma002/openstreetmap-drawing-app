import { create } from 'zustand';
import { AppState, ShapeLimits } from '../types';

// Dynamic configuration for shape limits - easily adjustable
const DEFAULT_SHAPE_LIMITS: ShapeLimits = {
  polygon: 10,
  rectangle: 8,
  circle: 5,
  linestring: 15
};

export const useAppStore = create<AppState>((set, get) => ({
  drawingMode: null,
  features: [],
  shapeLimits: DEFAULT_SHAPE_LIMITS,
  errorMessage: null,

  setDrawingMode: (mode) => {
    set({ drawingMode: mode, errorMessage: null });
  },

  addFeature: (feature) => {
    const state = get();
    const currentCount = state.getFeatureCount(feature.type);
    const limit = state.shapeLimits[feature.type as keyof ShapeLimits];

    // Check shape limits
    if (currentCount >= limit) {
      set({ 
        errorMessage: `Maximum ${limit} ${feature.type}s allowed. Remove existing ones to add more.` 
      });
      return false;
    }

    set({ 
      features: [...state.features, feature],
      errorMessage: null 
    });
    return true;
  },

  removeFeature: (id) => {
    set((state) => ({
      features: state.features.filter(f => f.id !== id),
      errorMessage: null
    }));
  },

  clearError: () => {
    set({ errorMessage: null });
  },

  setError: (message) => {
    set({ errorMessage: message });
  },

  getFeatureCount: (type) => {
    const state = get();
    return state.features.filter(f => f.type === type).length;
  }
}));