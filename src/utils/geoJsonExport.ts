import { DrawnFeature } from '../types';
import { latLngToGeoJSON, latLngsToGeoJSON } from './spatialUtils';

/**
 * Convert a DrawnFeature to GeoJSON Feature
 */
export const featureToGeoJSON = (feature: DrawnFeature): GeoJSON.Feature => {
  const { id, type, coordinates, center, radius, properties } = feature;

  let geometry: GeoJSON.Geometry;

  switch (type) {
    case 'polygon':
      const polygonCoords = latLngsToGeoJSON(coordinates);
      // Ensure polygon is closed
      if (polygonCoords.length > 0 && 
          (polygonCoords[0][0] !== polygonCoords[polygonCoords.length - 1][0] ||
           polygonCoords[0][1] !== polygonCoords[polygonCoords.length - 1][1])) {
        polygonCoords.push(polygonCoords[0]);
      }
      geometry = {
        type: 'Polygon',
        coordinates: [polygonCoords]
      };
      break;

    case 'rectangle':
      const rectCoords = latLngsToGeoJSON(coordinates);
      // Ensure rectangle is closed
      if (rectCoords.length === 4) {
        rectCoords.push(rectCoords[0]);
      }
      geometry = {
        type: 'Polygon',
        coordinates: [rectCoords]
      };
      break;

    case 'circle':
      if (!center || radius === undefined) {
        throw new Error('Circle feature missing center or radius');
      }
      // For circles, we'll store as a Point with radius in properties
      geometry = {
        type: 'Point',
        coordinates: latLngToGeoJSON(center)
      };
      break;

    case 'linestring':
      geometry = {
        type: 'LineString',
        coordinates: latLngsToGeoJSON(coordinates)
      };
      break;

    default:
      throw new Error(`Unknown feature type: ${type}`);
  }

  return {
    type: 'Feature',
    id,
    geometry,
    properties: {
      ...properties,
      featureType: type,
      ...(type === 'circle' && radius !== undefined ? { radius } : {})
    }
  };
};

/**
 * Export all features as a GeoJSON FeatureCollection
 */
export const exportFeaturesAsGeoJSON = (features: DrawnFeature[]): GeoJSON.FeatureCollection => {
  const geoJsonFeatures = features.map(featureToGeoJSON);

  return {
    type: 'FeatureCollection',
    features: geoJsonFeatures
  };
};

/**
 * Download GeoJSON as a file
 */
export const downloadGeoJSON = (features: DrawnFeature[], filename: string = 'map-features.geojson'): void => {
  const geoJson = exportFeaturesAsGeoJSON(features);
  const dataStr = JSON.stringify(geoJson, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};