import {ParkingAreaData, ParkingOccupancy} from '../types';

export interface ParkingRecommendation {
  area: ParkingAreaData;
  occupancy: ParkingOccupancy | null;
  score: number;
  distance: number; // in meters
  reason: string;
}

/**
 * Utility class for recommending parking spots based on various criteria
 */
export class ParkingRecommendations {
  /**
   * Calculate distance between two coordinates in meters
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Get center point of a parking polygon
   */
  private static getPolygonCenter(area: ParkingAreaData): {lat: number; lng: number} {
    const geometry = area.polygon.geometry;
    let coordinates: number[][][];
    
    if (geometry.type === 'Polygon') {
      coordinates = geometry.coordinates as number[][][];
    } else {
      coordinates = (geometry.coordinates as number[][][][])[0];
    }

    const ring = coordinates[0];
    let sumLat = 0;
    let sumLng = 0;
    
    for (const [lng, lat] of ring) {
      sumLat += lat;
      sumLng += lng;
    }

    return {
      lat: sumLat / ring.length,
      lng: sumLng / ring.length,
    };
  }

  /**
   * Calculate recommendation score for a parking area
   * Higher score = better recommendation
   */
  private static calculateScore(
    area: ParkingAreaData,
    occupancy: ParkingOccupancy | null,
    distance: number,
    userLocation: {latitude: number; longitude: number},
    preferFree: boolean
  ): number {
    let score = 100;

    // Distance factor (closer is better)
    // Reduce score by 1 point per 100 meters
    score -= distance / 100;

    // Occupancy factor (more available spots is better)
    if (occupancy) {
      const availabilityScore = (occupancy.availableSpots / occupancy.totalCapacity) * 50;
      score += availabilityScore;

      // Penalty for stale data
      const now = new Date();
      const hoursSinceUpdate = (now.getTime() - occupancy.lastUpdated.getTime()) / (1000 * 60 * 60);
      if (hoursSinceUpdate > 1) {
        score -= 10; // Reduce confidence in stale data
      }
    } else {
      // No occupancy data - moderate penalty
      score -= 20;
    }

    // Paid vs Free preference
    if (preferFree && !area.isPaid) {
      score += 30; // Significant bonus for free parking
    } else if (area.isPaid) {
      score -= 10; // Small penalty for paid parking
    }

    // Capacity factor (larger areas are more likely to have spots)
    score += Math.log(area.estimatedCapacity) * 5;

    return score;
  }

  /**
   * Get parking recommendations sorted by best match
   */
  static getRecommendations(
    parkingAreas: ParkingAreaData[],
    occupancyMap: Map<string, ParkingOccupancy>,
    userLocation: {latitude: number; longitude: number},
    preferFree: boolean = false,
    maxDistance: number = 2000 // 2km default
  ): ParkingRecommendation[] {
    const recommendations: ParkingRecommendation[] = [];

    for (const area of parkingAreas) {
      const center = this.getPolygonCenter(area);
      const distance = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        center.lat,
        center.lng
      );

      // Skip areas too far away
      if (distance > maxDistance) {
        continue;
      }

      const occupancy = occupancyMap.get(area.id) || null;
      const score = this.calculateScore(area, occupancy, distance, userLocation, preferFree);

      // Generate reason text
      let reason = '';
      if (occupancy && occupancy.availableSpots > 0) {
        reason = `${occupancy.availableSpots} spots available`;
      } else if (occupancy && occupancy.availableSpots === 0) {
        reason = 'Currently full';
      } else {
        reason = 'No recent data';
      }

      if (!area.isPaid) {
        reason += ' · Free parking';
      }

      recommendations.push({
        area,
        occupancy,
        score,
        distance,
        reason,
      });
    }

    // Sort by score (highest first)
    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * Get top N recommendations
   */
  static getTopRecommendations(
    parkingAreas: ParkingAreaData[],
    occupancyMap: Map<string, ParkingOccupancy>,
    userLocation: {latitude: number; longitude: number},
    limit: number = 5,
    preferFree: boolean = false
  ): ParkingRecommendation[] {
    const allRecommendations = this.getRecommendations(
      parkingAreas,
      occupancyMap,
      userLocation,
      preferFree
    );
    return allRecommendations.slice(0, limit);
  }

  /**
   * Find nearest available parking
   */
  static getNearestAvailable(
    parkingAreas: ParkingAreaData[],
    occupancyMap: Map<string, ParkingOccupancy>,
    userLocation: {latitude: number; longitude: number}
  ): ParkingRecommendation | null {
    const recommendations = this.getRecommendations(
      parkingAreas,
      occupancyMap,
      userLocation
    );

    // Filter to only areas with known available spots
    const available = recommendations.filter(
      r => r.occupancy && r.occupancy.availableSpots > 0
    );

    return available.length > 0 ? available[0] : null;
  }

  /**
   * Format distance for display
   */
  static formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  }
}
