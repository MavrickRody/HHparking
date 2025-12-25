import {ParkingPolygonFeature, ParkingAreaData} from '../types';

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
    
    // Parking space dimensions (meters)
    const PARALLEL_LENGTH = 6; // längs
    const PARALLEL_WIDTH = 2;
    const PERPENDICULAR_LENGTH = 5; // quer
    const PERPENDICULAR_WIDTH = 2.5;
    const DIAGONAL_LENGTH = 5; // schräg
    const DIAGONAL_WIDTH = 2.5;
    
    let spotArea: number;
    
    switch (orientation.toLowerCase()) {
      case 'längs':
      case 'parallel':
        spotArea = PARALLEL_LENGTH * PARALLEL_WIDTH;
        break;
      case 'quer':
      case 'perpendicular':
        spotArea = PERPENDICULAR_LENGTH * PERPENDICULAR_WIDTH;
        break;
      case 'schräg':
      case 'diagonal':
        spotArea = DIAGONAL_LENGTH * DIAGONAL_WIDTH;
        break;
      default:
        spotArea = PARALLEL_LENGTH * PARALLEL_WIDTH;
    }
    
    // Calculate capacity with efficiency factor (not all area can be used)
    const efficiency = 0.7; // 70% of area is usable
    const capacity = Math.floor((area * efficiency) / spotArea);
    
    return Math.max(1, capacity); // At least 1 spot
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
    
    // Convert to meters using approximate conversion for Hamburg latitude
    const HAMBURG_LAT = 53.5511;
    const metersPerDegreeLat = 111320; // meters per degree latitude
    const metersPerDegreeLon = 111320 * Math.cos(HAMBURG_LAT * Math.PI / 180);
    
    let area = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      const [lon1, lat1] = ring[i];
      const [lon2, lat2] = ring[i + 1];
      
      const x1 = lon1 * metersPerDegreeLon;
      const y1 = lat1 * metersPerDegreeLat;
      const x2 = lon2 * metersPerDegreeLon;
      const y2 = lat2 * metersPerDegreeLat;
      
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
