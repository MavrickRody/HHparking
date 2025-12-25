import {ParkingOccupancy, ParkingEvent, ParkingAreaData} from '../types';

/**
 * Service for managing real-time parking occupancy data
 */
export class OccupancyService {
  private static instance: OccupancyService;
  private occupancyData: Map<string, ParkingOccupancy> = new Map();
  private parkingEvents: Map<string, ParkingEvent[]> = new Map();

  public static getInstance(): OccupancyService {
    if (!OccupancyService.instance) {
      OccupancyService.instance = new OccupancyService();
    }
    return OccupancyService.instance;
  }

  /**
   * Initialize occupancy data for a parking area
   */
  initializeOccupancy(parkingArea: ParkingAreaData): void {
    if (!this.occupancyData.has(parkingArea.id)) {
      this.occupancyData.set(parkingArea.id, {
        polygonId: parkingArea.id,
        totalCapacity: parkingArea.estimatedCapacity,
        occupiedSpots: 0,
        availableSpots: parkingArea.estimatedCapacity,
        lastUpdated: new Date(),
        occupancyRate: 0,
      });
    }
  }

  /**
   * Record a parking event (parked or departed)
   */
  recordParkingEvent(event: Omit<ParkingEvent, 'id'>): void {
    const eventWithId: ParkingEvent = {
      ...event,
      id: `${event.userId}_${event.timestamp.getTime()}`,
    };

    // Store event
    const events = this.parkingEvents.get(event.polygonId) || [];
    events.push(eventWithId);
    this.parkingEvents.set(event.polygonId, events);

    // Update occupancy
    this.updateOccupancy(event.polygonId);

    // Clean up old events (older than 24 hours)
    this.cleanupOldEvents(event.polygonId);
  }

  /**
   * Update occupancy calculation based on recent events
   */
  private updateOccupancy(polygonId: string): void {
    const occupancy = this.occupancyData.get(polygonId);
    if (!occupancy) return;

    const events = this.parkingEvents.get(polygonId) || [];
    
    // Count active parking sessions
    const userSessions = new Map<string, ParkingEvent>();
    
    // Sort events by timestamp
    const sortedEvents = [...events].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    for (const event of sortedEvents) {
      if (event.eventType === 'parked') {
        userSessions.set(event.userId, event);
      } else if (event.eventType === 'departed') {
        userSessions.delete(event.userId);
      }
    }

    const occupiedSpots = userSessions.size;
    const availableSpots = Math.max(0, occupancy.totalCapacity - occupiedSpots);
    const occupancyRate = occupancy.totalCapacity > 0 
      ? occupiedSpots / occupancy.totalCapacity 
      : 0;

    this.occupancyData.set(polygonId, {
      ...occupancy,
      occupiedSpots,
      availableSpots,
      occupancyRate,
      lastUpdated: new Date(),
    });
  }

  /**
   * Clean up events older than 24 hours
   */
  private cleanupOldEvents(polygonId: string): void {
    const events = this.parkingEvents.get(polygonId) || [];
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentEvents = events.filter(
      event => event.timestamp > twentyFourHoursAgo
    );

    this.parkingEvents.set(polygonId, recentEvents);
  }

  /**
   * Get occupancy data for a specific parking area
   */
  getOccupancy(polygonId: string): ParkingOccupancy | null {
    return this.occupancyData.get(polygonId) || null;
  }

  /**
   * Get all occupancy data
   */
  getAllOccupancy(): ParkingOccupancy[] {
    return Array.from(this.occupancyData.values());
  }

  /**
   * Get color code based on occupancy rate
   */
  getOccupancyColor(occupancyRate: number): string {
    if (occupancyRate < 0.5) {
      return '#4CAF50'; // Green - plenty of spots
    } else if (occupancyRate < 0.8) {
      return '#FFC107'; // Yellow - limited spots
    } else {
      return '#F44336'; // Red - very few spots
    }
  }

  /**
   * Get occupancy status text
   */
  getOccupancyStatus(occupancyRate: number): 'available' | 'limited' | 'full' | 'unknown' {
    if (occupancyRate < 0) {
      return 'unknown';
    } else if (occupancyRate < 0.5) {
      return 'available';
    } else if (occupancyRate < 0.8) {
      return 'limited';
    } else {
      return 'full';
    }
  }

  /**
   * Check if occupancy data is stale (older than 1 hour)
   */
  isOccupancyStale(polygonId: string): boolean {
    const occupancy = this.occupancyData.get(polygonId);
    if (!occupancy) return true;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return occupancy.lastUpdated < oneHourAgo;
  }

  /**
   * Clear all occupancy data (for testing)
   */
  clearAll(): void {
    this.occupancyData.clear();
    this.parkingEvents.clear();
  }
}
