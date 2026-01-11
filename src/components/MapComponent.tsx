import React, { useCallback, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { LatLng, Map as LeafletMap } from 'leaflet';
import { useAppStore } from '../store/useAppStore';
import { DrawnFeature } from '../types';
import { validateNewPolygonalFeature } from '../utils/spatialUtils';
import DrawingHandler from './DrawingHandler';
import FeatureRenderer from './FeatureRenderer';

const MapEventHandler: React.FC = () => {
  const { drawingMode, addFeature, features, setError } = useAppStore();
  const drawingRef = useRef<{
    currentPoints: LatLng[];
    isDrawing: boolean;
    startPoint?: LatLng;
  }>({
    currentPoints: [],
    isDrawing: false
  });

  const generateFeatureName = (type: string, count: number): string => {
    return `${type.charAt(0).toUpperCase() + type.slice(1)} ${count + 1}`;
  };

  const createFeature = useCallback((
    type: DrawnFeature['type'],
    coordinates: LatLng[],
    center?: LatLng,
    radius?: number
  ): DrawnFeature => {
    const existingCount = features.filter(f => f.type === type).length;
    
    return {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      coordinates,
      center,
      radius,
      properties: {
        name: generateFeatureName(type, existingCount),
        createdAt: new Date().toISOString()
      }
    };
  }, [features]);

  const finishDrawing = useCallback((coordinates: LatLng[], center?: LatLng, radius?: number) => {
    if (!drawingMode || coordinates.length === 0) return;

    try {
      const newFeature = createFeature(drawingMode, coordinates, center, radius);
      
      // Validate polygonal features for overlaps
      validateNewPolygonalFeature(newFeature, features);
      
      const success = addFeature(newFeature);
      if (success) {
        drawingRef.current = { currentPoints: [], isDrawing: false };
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create feature');
    }
  }, [drawingMode, createFeature, features, addFeature, setError]);

  useMapEvents({
    click: (e) => {
      if (!drawingMode) return;

      const { latlng } = e;
      const drawing = drawingRef.current;

      switch (drawingMode) {
        case 'polygon':
          if (!drawing.isDrawing) {
            drawing.isDrawing = true;
            drawing.currentPoints = [latlng];
          } else {
            drawing.currentPoints.push(latlng);
          }
          break;

        case 'linestring':
          if (!drawing.isDrawing) {
            drawing.isDrawing = true;
            drawing.currentPoints = [latlng];
          } else {
            drawing.currentPoints.push(latlng);
          }
          break;

        case 'rectangle':
          if (!drawing.isDrawing) {
            drawing.isDrawing = true;
            drawing.startPoint = latlng;
          } else if (drawing.startPoint) {
            // Create rectangle from two opposite corners
            const start = drawing.startPoint;
            const end = latlng;
            const rectanglePoints = [
              start,
              new LatLng(start.lat, end.lng),
              end,
              new LatLng(end.lat, start.lng)
            ];
            finishDrawing(rectanglePoints);
          }
          break;

        case 'circle':
          if (!drawing.isDrawing) {
            drawing.isDrawing = true;
            drawing.startPoint = latlng;
          } else if (drawing.startPoint) {
            // Calculate radius from center to click point
            const center = drawing.startPoint;
            const radius = center.distanceTo(latlng);
            finishDrawing([], center, radius);
          }
          break;
      }
    },

    dblclick: (e) => {
      e.originalEvent.preventDefault();
      
      if (!drawingMode || !drawingRef.current.isDrawing) return;

      const drawing = drawingRef.current;

      if ((drawingMode === 'polygon' || drawingMode === 'linestring') && 
          drawing.currentPoints.length >= 2) {
        finishDrawing(drawing.currentPoints);
      }
    }
  });

  return null;
};

const MapComponent: React.FC = () => {
  const mapRef = useRef<LeafletMap>(null);

  return (
    <div className="map-container">
      <MapContainer
        ref={mapRef}
        center={[40.7128, -74.0060]} // New York City
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        doubleClickZoom={false} // Disable to allow our custom double-click handling
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventHandler />
        <DrawingHandler />
        <FeatureRenderer />
      </MapContainer>
    </div>
  );
};

export default MapComponent;