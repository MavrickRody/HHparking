import React from 'react';
import {Polygon} from 'react-native-maps';
import {ParkingAreaData, ParkingOccupancy} from '../../types';

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
      return 'rgba(128, 128, 128, 0.3)'; // Gray for no data
    }

    const rate = occupancy.occupancyRate;
    
    if (rate < 0.5) {
      return 'rgba(76, 175, 80, 0.4)'; // Green - plenty of spots
    } else if (rate < 0.8) {
      return 'rgba(255, 193, 7, 0.4)'; // Yellow - limited spots
    } else {
      return 'rgba(244, 67, 54, 0.4)'; // Red - very few spots
    }
  };

  const getStrokeColor = (): string => {
    if (parkingArea.isPaid) {
      return '#FF5722'; // Orange for paid parking
    } else {
      return '#2196F3'; // Blue for free parking
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
