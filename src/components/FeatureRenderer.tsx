import React from 'react';
import { Polygon, Polyline, Circle, Popup } from 'react-leaflet';
import { useAppStore } from '../store/useAppStore';

const FeatureRenderer: React.FC = () => {
  const { features } = useAppStore();

  const getFeatureColor = (type: string): string => {
    switch (type) {
      case 'polygon': return '#007bff';
      case 'rectangle': return '#ffc107';
      case 'circle': return '#dc3545';
      case 'linestring': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <>
      {features.map((feature) => {
        const color = getFeatureColor(feature.type);
        const popupContent = (
          <div>
            <strong>{feature.properties.name}</strong><br />
            Type: {feature.type}<br />
            Created: {new Date(feature.properties.createdAt).toLocaleString()}
            {feature.type === 'circle' && feature.radius && (
              <>
                <br />
                Radius: {Math.round(feature.radius)}m
              </>
            )}
          </div>
        );

        switch (feature.type) {
          case 'polygon':
            // Ensure polygon is closed for rendering
            const polygonCoords = [...feature.coordinates];
            if (polygonCoords.length > 2 && 
                !polygonCoords[0].equals(polygonCoords[polygonCoords.length - 1])) {
              polygonCoords.push(polygonCoords[0]);
            }
            
            return (
              <Polygon
                key={feature.id}
                positions={polygonCoords}
                pathOptions={{
                  color,
                  weight: 2,
                  opacity: 0.8,
                  fillOpacity: 0.3
                }}
              >
                <Popup>{popupContent}</Popup>
              </Polygon>
            );

          case 'rectangle':
            // Rectangle should have exactly 4 points, close it for rendering
            const rectCoords = [...feature.coordinates];
            if (rectCoords.length === 4) {
              rectCoords.push(rectCoords[0]);
            }
            
            return (
              <Polygon
                key={feature.id}
                positions={rectCoords}
                pathOptions={{
                  color,
                  weight: 2,
                  opacity: 0.8,
                  fillOpacity: 0.3
                }}
              >
                <Popup>{popupContent}</Popup>
              </Polygon>
            );

          case 'circle':
            if (!feature.center || feature.radius === undefined) {
              return null;
            }
            
            return (
              <Circle
                key={feature.id}
                center={feature.center}
                radius={feature.radius}
                pathOptions={{
                  color,
                  weight: 2,
                  opacity: 0.8,
                  fillOpacity: 0.3
                }}
              >
                <Popup>{popupContent}</Popup>
              </Circle>
            );

          case 'linestring':
            return (
              <Polyline
                key={feature.id}
                positions={feature.coordinates}
                pathOptions={{
                  color,
                  weight: 3,
                  opacity: 0.8
                }}
              >
                <Popup>{popupContent}</Popup>
              </Polyline>
            );

          default:
            return null;
        }
      })}
    </>
  );
};

export default FeatureRenderer;