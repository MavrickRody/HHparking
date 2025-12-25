import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ParkingButtonProps {
  isParked: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

/**
 * Button component for manual parking actions
 */
export const ParkingButton: React.FC<ParkingButtonProps> = ({
  isParked,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isParked ? styles.parkedButton : styles.defaultButton,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icon
        name={isParked ? 'directions-car' : 'local-parking'}
        size={24}
        color="#fff"
      />
      <Text style={styles.buttonText}>
        {isParked ? 'Leaving Now' : 'Parked Here'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  defaultButton: {
    backgroundColor: '#4CAF50',
  },
  parkedButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
