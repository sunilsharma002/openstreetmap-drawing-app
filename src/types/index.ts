import { LatLng } from 'leaflet';

export type DrawingMode = 'polygon' | 'rectangle' | 'circle' | 'linestring' | null;

export interface DrawnFeature {
  id: string;
  type: 'polygon' | 'rectangle' | 'circle' | 'linestring';
  coordinates: LatLng[];
  center?: LatLng; // For circles
  radius?: number; // For circles in meters
  properties: {
    name: string;
    createdAt: string;
  };
}

export interface ShapeLimits {
  polygon: number;
  rectangle: number;
  circle: number;
  linestring: number;
}

export interface AppState {
  drawingMode: DrawingMode;
  features: DrawnFeature[];
  shapeLimits: ShapeLimits;
  errorMessage: string | null;
  setDrawingMode: (mode: DrawingMode) => void;
  addFeature: (feature: DrawnFeature) => boolean;
  removeFeature: (id: string) => void;
  clearError: () => void;
  setError: (message: string) => void;
  getFeatureCount: (type: string) => number;
}