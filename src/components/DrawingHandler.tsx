import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { LatLng, Polyline, Circle, Polygon } from 'leaflet';
import { useAppStore } from '../store/useAppStore';

const DrawingHandler: React.FC = () => {
  const map = useMap();
  const { drawingMode } = useAppStore();
  const previewLayerRef = useRef<Polyline | Circle | Polygon | null>(null);
  const currentPointsRef = useRef<LatLng[]>([]);
  const startPointRef = useRef<LatLng | null>(null);
  const isDrawingRef = useRef(false);

  // Clean up preview layer
  const clearPreview = () => {
    if (previewLayerRef.current) {
      map.removeLayer(previewLayerRef.current);
      previewLayerRef.current = null;
    }
  };

  // Handle mouse move for preview
  useEffect(() => {
    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      if (!drawingMode || !isDrawingRef.current) return;

      const { latlng } = e;
      clearPreview();

      switch (drawingMode) {
        case 'polygon':
          if (currentPointsRef.current.length > 0) {
            const previewPoints = [...currentPointsRef.current, latlng];
            previewLayerRef.current = new Polyline(previewPoints, {
              color: '#007bff',
              weight: 2,
              opacity: 0.7,
              dashArray: '5, 5'
            }).addTo(map);
          }
          break;

        case 'linestring':
          if (currentPointsRef.current.length > 0) {
            const previewPoints = [...currentPointsRef.current, latlng];
            previewLayerRef.current = new Polyline(previewPoints, {
              color: '#28a745',
              weight: 3,
              opacity: 0.7,
              dashArray: '5, 5'
            }).addTo(map);
          }
          break;

        case 'rectangle':
          if (startPointRef.current) {
            const start = startPointRef.current;
            const rectangleBounds = [
              [start.lat, start.lng],
              [start.lat, latlng.lng],
              [latlng.lat, latlng.lng],
              [latlng.lat, start.lng],
              [start.lat, start.lng]
            ] as [number, number][];
            
            previewLayerRef.current = new Polygon(rectangleBounds, {
              color: '#ffc107',
              weight: 2,
              opacity: 0.7,
              fillOpacity: 0.2,
              dashArray: '5, 5'
            }).addTo(map);
          }
          break;

        case 'circle':
          if (startPointRef.current) {
            const radius = startPointRef.current.distanceTo(latlng);
            previewLayerRef.current = new Circle(startPointRef.current, {
              radius,
              color: '#dc3545',
              weight: 2,
              opacity: 0.7,
              fillOpacity: 0.2,
              dashArray: '5, 5'
            }).addTo(map);
          }
          break;
      }
    };

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (!drawingMode) return;

      const { latlng } = e;

      switch (drawingMode) {
        case 'polygon':
        case 'linestring':
          if (!isDrawingRef.current) {
            isDrawingRef.current = true;
            currentPointsRef.current = [latlng];
          } else {
            currentPointsRef.current.push(latlng);
          }
          break;

        case 'rectangle':
        case 'circle':
          if (!isDrawingRef.current) {
            isDrawingRef.current = true;
            startPointRef.current = latlng;
          } else {
            // Finish drawing
            isDrawingRef.current = false;
            startPointRef.current = null;
            clearPreview();
          }
          break;
      }
    };

    const handleDoubleClick = () => {
      if ((drawingMode === 'polygon' || drawingMode === 'linestring') && 
          isDrawingRef.current) {
        isDrawingRef.current = false;
        currentPointsRef.current = [];
        clearPreview();
      }
    };

    map.on('mousemove', handleMouseMove);
    map.on('click', handleClick);
    map.on('dblclick', handleDoubleClick);

    return () => {
      map.off('mousemove', handleMouseMove);
      map.off('click', handleClick);
      map.off('dblclick', handleDoubleClick);
      clearPreview();
    };
  }, [map, drawingMode]);

  // Reset drawing state when mode changes
  useEffect(() => {
    isDrawingRef.current = false;
    currentPointsRef.current = [];
    startPointRef.current = null;
    clearPreview();
  }, [drawingMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPreview();
    };
  }, []);

  return null;
};

export default DrawingHandler;