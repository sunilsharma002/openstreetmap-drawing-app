import React, { useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import { LatLng, Map as LeafletMap, Polyline, Circle, Polygon, Layer } from 'leaflet';
import { useAppStore } from '../store/useAppStore';
import { DrawnFeature } from '../types';
import { validateNewPolygonalFeature } from '../utils/spatialUtils';
import FeatureRenderer from './FeatureRenderer';
import PlaceSearchBar from './PlaceSearchBar';

// ZoomControls component that works inside MapContainer
const ZoomControls: React.FC = () => {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const handleResetView = () => {
    map.setView([20.5937, 78.9629], 5); // Reset to India view
  };

  return (
    <div className="zoom-controls">
      <button 
        className="zoom-button zoom-in" 
        onClick={handleZoomIn}
        title="Zoom In"
      >
        +
      </button>
      <button 
        className="zoom-button zoom-out" 
        onClick={handleZoomOut}
        title="Zoom Out"
      >
        −
      </button>
      <button 
        className="zoom-button reset-view" 
        onClick={handleResetView}
        title="Reset to India View"
      >
        🇮🇳
      </button>
    </div>
  );
};

const MapEventHandler: React.FC = () => {
  const map = useMap();
  const { drawingMode, addFeature, features, setError } = useAppStore();
  const previewLayerRef = useRef<Layer | null>(null);
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

  const createFeature = React.useCallback((
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

  // Clean up preview layer
  const clearPreview = React.useCallback(() => {
    if (previewLayerRef.current && map.hasLayer(previewLayerRef.current)) {
      map.removeLayer(previewLayerRef.current);
      previewLayerRef.current = null;
    }
  }, [map]);

  // Reset drawing state
  const resetDrawing = React.useCallback(() => {
    drawingRef.current = { currentPoints: [], isDrawing: false };
    clearPreview();
  }, [clearPreview]);

  const finishDrawing = React.useCallback((coordinates: LatLng[], center?: LatLng, radius?: number) => {
    if (!drawingMode) return;

    try {
      const newFeature = createFeature(drawingMode, coordinates, center, radius);
      
      // Validate polygonal features for overlaps
      if (drawingMode === 'polygon' || drawingMode === 'rectangle') {
        validateNewPolygonalFeature(newFeature, features);
      }
      
      const success = addFeature(newFeature);
      if (success) {
        resetDrawing();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create feature');
      resetDrawing();
    }
  }, [drawingMode, createFeature, features, addFeature, setError, resetDrawing]);

  // Handle mouse move for preview
  React.useEffect(() => {
    const handleMouseMove = (e: any) => {
      if (!drawingMode || !drawingRef.current.isDrawing) return;

      const { latlng } = e;
      clearPreview();

      try {
        switch (drawingMode) {
          case 'polygon':
            if (drawingRef.current.currentPoints.length > 0) {
              const previewPoints = [...drawingRef.current.currentPoints, latlng];
              if (previewPoints.length >= 2) {
                previewLayerRef.current = new Polyline(previewPoints, {
                  color: '#3b82f6',
                  weight: 2,
                  opacity: 0.7,
                  dashArray: '5, 5'
                }).addTo(map);
              }
            }
            break;

          case 'linestring':
            if (drawingRef.current.currentPoints.length > 0) {
              const previewPoints = [...drawingRef.current.currentPoints, latlng];
              previewLayerRef.current = new Polyline(previewPoints, {
                color: '#10b981',
                weight: 3,
                opacity: 0.7,
                dashArray: '5, 5'
              }).addTo(map);
            }
            break;

          case 'rectangle':
            if (drawingRef.current.startPoint) {
              const start = drawingRef.current.startPoint;
              const rectangleBounds = [
                [start.lat, start.lng],
                [start.lat, latlng.lng],
                [latlng.lat, latlng.lng],
                [latlng.lat, start.lng],
                [start.lat, start.lng]
              ] as [number, number][];
              
              previewLayerRef.current = new Polygon(rectangleBounds, {
                color: '#f59e0b',
                weight: 2,
                opacity: 0.7,
                fillOpacity: 0.2,
                dashArray: '5, 5'
              }).addTo(map);
            }
            break;

          case 'circle':
            if (drawingRef.current.startPoint) {
              const radius = drawingRef.current.startPoint.distanceTo(latlng);
              previewLayerRef.current = new Circle(drawingRef.current.startPoint, {
                radius,
                color: '#ef4444',
                weight: 2,
                opacity: 0.7,
                fillOpacity: 0.2,
                dashArray: '5, 5'
              }).addTo(map);
            }
            break;
        }
      } catch (error) {
        console.warn('Error in mouse move handler:', error);
      }
    };

    map.on('mousemove', handleMouseMove);
    return () => {
      map.off('mousemove', handleMouseMove);
    };
  }, [map, drawingMode, clearPreview]);

  // Reset drawing state when mode changes
  React.useEffect(() => {
    resetDrawing();
  }, [drawingMode, resetDrawing]);

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

  const handlePlaceSelect = (lat: number, lon: number, boundingbox?: [number, number, number, number]) => {
    const map = mapRef.current;
    if (!map) return;

    // Center map on selected location
    map.setView([lat, lon], 15);
    
    // If boundingbox is available, fit the map to it
    if (boundingbox) {
      const [south, north, west, east] = boundingbox;
      map.fitBounds([[south, west], [north, east]], { padding: [20, 20] });
    }
  };

  return (
    <div className="map-container">
      <PlaceSearchBar onPlaceSelect={handlePlaceSelect} />
      <MapContainer
        ref={mapRef}
        center={[20.5937, 78.9629]} // India center coordinates
        zoom={5} // Zoom level to show most of India
        style={{ height: '100%', width: '100%' }}
        doubleClickZoom={false} // Disable to allow our custom double-click handling
        zoomControl={false} // Disable default zoom control since we have custom ones
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControls />
        <MapEventHandler />
        <FeatureRenderer />
      </MapContainer>
    </div>
  );
};

export default MapComponent;