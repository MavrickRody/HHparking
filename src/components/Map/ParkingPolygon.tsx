import React from 'react';
import {Polygon} from 'react-native-maps';
import {ParkingAreaData, ParkingOccupancy} from '../../types';
import {
  OCCUPANCY_COLORS,
  PARKING_TYPE_COLORS,
  OCCUPANCY_THRESHOLDS,
} from '../../utils/constants';

interface ParkingPolygonProps {
  parkingArea: ParkingAreaData;
  occupancy?: ParkingOccupancy | null;
  onPress?: () => void;
}

/**
 * Component to render a parking polygon on the map with color-coding based on occupancy
 */
export const ParkingPolygon: React.FC<ParkingPolygonProps> = ({
  parkingArea,
  occupancy,
  onPress,
}) => {
  const getPolygonCoordinates = () => {
    const geometry = parkingArea.polygon.geometry;
    
    if (geometry.type === 'Polygon') {
      const coords = geometry.coordinates as number[][][];
      return coords[0].map(([lng, lat]) => ({
        latitude: lat,
        longitude: lng,
      }));
    } else {
      // For MultiPolygon, use the first polygon
      const coords = geometry.coordinates as number[][][][];
      return coords[0][0].map(([lng, lat]) => ({
        latitude: lat,
        longitude: lng,
      }));
    }
  };

  const getFillColor = (): string => {
    if (!occupancy) {
      return OCCUPANCY_COLORS.NO_DATA_FILL;
    }

    const rate = occupancy.occupancyRate;
    
    if (rate < OCCUPANCY_THRESHOLDS.AVAILABLE) {
      return OCCUPANCY_COLORS.AVAILABLE_FILL;
    } else if (rate < OCCUPANCY_THRESHOLDS.LIMITED) {
      return OCCUPANCY_COLORS.LIMITED_FILL;
    } else {
      return OCCUPANCY_COLORS.FULL_FILL;
    }
  };

  const getStrokeColor = (): string => {
    if (parkingArea.isPaid) {
      return PARKING_TYPE_COLORS.PAID;
    } else {
      return PARKING_TYPE_COLORS.FREE;
    }
  };

  const coordinates = getPolygonCoordinates();
  const fillColor = getFillColor();
  const strokeColor = getStrokeColor();

  return (
    <Polygon
      coordinates={coordinates}
      fillColor={fillColor}
      strokeColor={strokeColor}
      strokeWidth={2}
      tappable={true}
      onPress={onPress}
    />
  );
};
