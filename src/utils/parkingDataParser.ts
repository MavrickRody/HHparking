import {ParkingPolygonFeature, ParkingAreaData} from '../types';
import {
  GEO_CONSTANTS,
  PARKING_DIMENSIONS,
  CAPACITY_SETTINGS,
} from './constants';

/**
 * Utility class for parsing and processing Hamburg parking GeoJSON data
 */
export class ParkingDataParser {
  /**
   * Parse a parking polygon feature and extract relevant data
   */
  static parseParkingFeature(feature: ParkingPolygonFeature): ParkingAreaData {
    const isPaid = this.isPaidParking(feature.properties.primaere_bewirtschaftung);
    const estimatedCapacity = this.calculateCapacity(feature);
    
    return {
      id: feature.id,
      polygon: feature,
      isPaid,
      estimatedCapacity,
      streetName: feature.properties.strassenname,
    };
  }

  /**
   * Determine if parking is paid based on bewirtschaftung type
   */
  static isPaidParking(bewirtschaftung: string): boolean {
    const paidTypes = [
      'Parkschein',
      'Parkuhr',
      'Parkscheinautomat',
      'Parkautomat',
    ];
    
    return paidTypes.some(type => 
      bewirtschaftung.toLowerCase().includes(type.toLowerCase())
    );
  }

  /**
   * Calculate estimated parking capacity based on polygon area and orientation
   */
  static calculateCapacity(feature: ParkingPolygonFeature): number {
    const area = this.calculatePolygonArea(feature.geometry);
    const orientation = feature.properties.ausrichtung_zur_strasse;
    
    let spotArea: number;
    
    switch (orientation.toLowerCase()) {
      case 'längs':
      case 'parallel':
        spotArea = PARKING_DIMENSIONS.PARALLEL_LENGTH * PARKING_DIMENSIONS.PARALLEL_WIDTH;
        break;
      case 'quer':
      case 'perpendicular':
        spotArea = PARKING_DIMENSIONS.PERPENDICULAR_LENGTH * PARKING_DIMENSIONS.PERPENDICULAR_WIDTH;
        break;
      case 'schräg':
      case 'diagonal':
        spotArea = PARKING_DIMENSIONS.DIAGONAL_LENGTH * PARKING_DIMENSIONS.DIAGONAL_WIDTH;
        break;
      default:
        spotArea = PARKING_DIMENSIONS.PARALLEL_LENGTH * PARKING_DIMENSIONS.PARALLEL_WIDTH;
    }
    
    // Calculate capacity with efficiency factor (not all area can be used)
    const capacity = Math.floor((area * CAPACITY_SETTINGS.EFFICIENCY) / spotArea);
    
    return Math.max(CAPACITY_SETTINGS.MIN_CAPACITY, capacity);
  }

  /**
   * Calculate area of a polygon in square meters
   * Uses the Shoelace formula for geodetic coordinates
   */
  static calculatePolygonArea(geometry: ParkingPolygonFeature['geometry']): number {
    let coordinates: number[][][];
    
    if (geometry.type === 'Polygon') {
      coordinates = geometry.coordinates as number[][][];
    } else {
      // For MultiPolygon, use the first polygon
      coordinates = (geometry.coordinates as number[][][][])[0];
    }
    
    const ring = coordinates[0]; // Outer ring
    
    // Convert to meters using constants for Hamburg latitude
    let area = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      const [lon1, lat1] = ring[i];
      const [lon2, lat2] = ring[i + 1];
      
      const x1 = lon1 * GEO_CONSTANTS.METERS_PER_DEGREE_LON;
      const y1 = lat1 * GEO_CONSTANTS.METERS_PER_DEGREE_LAT;
      const x2 = lon2 * GEO_CONSTANTS.METERS_PER_DEGREE_LON;
      const y2 = lat2 * GEO_CONSTANTS.METERS_PER_DEGREE_LAT;
      
      area += x1 * y2 - x2 * y1;
    }
    
    return Math.abs(area / 2);
  }

  /**
   * Check if a point is inside a polygon
   */
  static isPointInPolygon(
    point: {latitude: number; longitude: number},
    feature: ParkingPolygonFeature
  ): boolean {
    let coordinates: number[][][];
    
    if (feature.geometry.type === 'Polygon') {
      coordinates = feature.geometry.coordinates as number[][][];
    } else {
      // For MultiPolygon, check all polygons
      const multiPolygon = feature.geometry.coordinates as number[][][][];
      return multiPolygon.some(polygon => 
        this.pointInRing(point, polygon[0])
      );
    }
    
    return this.pointInRing(point, coordinates[0]);
  }

  /**
   * Ray casting algorithm to check if point is in polygon ring
   */
  private static pointInRing(
    point: {latitude: number; longitude: number},
    ring: number[][]
  ): boolean {
    let inside = false;
    const x = point.longitude;
    const y = point.latitude;
    
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0];
      const yi = ring[i][1];
      const xj = ring[j][0];
      const yj = ring[j][1];
      
      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      
      if (intersect) {
        inside = !inside;
      }
    }
    
    return inside;
  }
}
