// @ts-ignore - Turf.js types issue with package.json exports
import * as turf from '@turf/turf';
import { LatLng } from 'leaflet';
import { DrawnFeature } from '../types';

// Define GeoJSON types for better type safety
type GeoJSONFeature = GeoJSON.Feature<GeoJSON.Polygon>;

/**
 * Convert LatLng coordinates to GeoJSON coordinate format [lng, lat]
 */
export const latLngToGeoJSON = (latLng: LatLng): [number, number] => {
  return [latLng.lng, latLng.lat];
};

/**
 * Convert array of LatLng to GeoJSON coordinates
 */
export const latLngsToGeoJSON = (latLngs: LatLng[]): [number, number][] => {
  return latLngs.map(latLngToGeoJSON);
};

/**
 * Create a Turf polygon from LatLng coordinates
 */
export const createTurfPolygon = (coordinates: LatLng[]): GeoJSONFeature => {
  const coords = latLngsToGeoJSON(coordinates);
  // Ensure polygon is closed
  if (coords.length > 0 && 
      (coords[0][0] !== coords[coords.length - 1][0] || 
       coords[0][1] !== coords[coords.length - 1][1])) {
    coords.push(coords[0]);
  }
  return turf.polygon([coords]);
};

/**
 * Create a Turf circle from center and radius
 */
export const createTurfCircle = (center: LatLng, radiusInMeters: number): GeoJSONFeature => {
  const centerPoint = turf.point(latLngToGeoJSON(center));
  // @ts-ignore - circle function signature issue with options
  return turf.circle(centerPoint, radiusInMeters / 1000, { units: 'kilometers' });
};

/**
 * Create a Turf rectangle from corner coordinates
 */
export const createTurfRectangle = (coordinates: LatLng[]): GeoJSONFeature => {
  if (coordinates.length !== 4) {
    throw new Error('Rectangle must have exactly 4 coordinates');
  }
  return createTurfPolygon([...coordinates, coordinates[0]]);
};

/**
 * Check if two polygonal features overlap
 */
export const checkPolygonOverlap = (feature1: GeoJSONFeature, feature2: GeoJSONFeature): boolean => {
  try {
    const intersection = turf.intersect(feature1, feature2);
    return intersection !== null;
  } catch (error) {
    console.warn('Error checking polygon overlap:', error);
    return false;
  }
};

/**
 * Check if one polygon fully contains another
 */
export const checkPolygonContainment = (outer: GeoJSONFeature, inner: GeoJSONFeature): boolean => {
  try {
    // @ts-ignore - booleanContains exists but types are not properly exported
    return turf.booleanContains(outer, inner);
  } catch (error) {
    console.warn('Error checking polygon containment:', error);
    return false;
  }
};

/**
 * Remove overlapping areas from a new polygon against existing polygons
 * Returns the trimmed polygon or null if completely contained
 */
export const trimPolygonOverlaps = (
  newPolygon: GeoJSONFeature, 
  existingPolygons: GeoJSONFeature[]
): GeoJSONFeature | null => {
  try {
    let trimmedPolygon = newPolygon;

    for (const existingPolygon of existingPolygons) {
      // Check if new polygon is fully contained within existing one
      if (checkPolygonContainment(existingPolygon, trimmedPolygon)) {
        return null; // Completely contained, block creation
      }

      // Check if existing polygon is fully contained within new one
      if (checkPolygonContainment(trimmedPolygon, existingPolygon)) {
        throw new Error('New polygon would fully enclose an existing polygon');
      }

      // Remove overlapping areas
      if (checkPolygonOverlap(trimmedPolygon, existingPolygon)) {
        const difference = turf.difference(trimmedPolygon, existingPolygon);
        if (!difference) {
          return null; // No area left after trimming
        }
        trimmedPolygon = difference as GeoJSONFeature;
      }
    }

    return trimmedPolygon;
  } catch (error) {
    throw error;
  }
};

/**
 * Convert DrawnFeature to Turf polygon (for polygonal features only)
 */
export const featureToTurfPolygon = (feature: DrawnFeature): GeoJSONFeature | null => {
  switch (feature.type) {
    case 'polygon':
      return createTurfPolygon(feature.coordinates);
    case 'rectangle':
      return createTurfRectangle(feature.coordinates);
    case 'circle':
      if (feature.center && feature.radius) {
        return createTurfCircle(feature.center, feature.radius);
      }
      return null;
    case 'linestring':
      return null; // Line strings are not polygonal
    default:
      return null;
  }
};

/**
 * Validate a new polygonal feature against existing ones
 * Returns true if valid, throws error with message if invalid
 */
export const validateNewPolygonalFeature = (
  newFeature: DrawnFeature, 
  existingFeatures: DrawnFeature[]
): boolean => {
  // Only validate polygonal features
  if (newFeature.type === 'linestring') {
    return true;
  }

  const newPolygon = featureToTurfPolygon(newFeature);
  if (!newPolygon) {
    throw new Error('Invalid polygon feature');
  }

  // Get existing polygonal features
  const existingPolygons = existingFeatures
    .filter(f => f.type !== 'linestring')
    .map(featureToTurfPolygon)
    .filter(Boolean) as GeoJSONFeature[];

  // Check for full containment (blocking condition)
  for (const existingPolygon of existingPolygons) {
    if (checkPolygonContainment(newPolygon, existingPolygon)) {
      throw new Error('Cannot create polygon that fully encloses an existing polygon');
    }
  }

  return true;
};