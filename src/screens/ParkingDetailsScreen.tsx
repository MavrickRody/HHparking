import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useRoute, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {ParkingSpot} from '../types';
import {FirebaseService} from '../services/FirebaseService';

export default function ParkingDetailsScreen() {
  const {t} = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  
  const {parkingSpot} = route.params as {parkingSpot: ParkingSpot};
  const firebaseService = FirebaseService.getInstance();

  const formatDateTime = (date: Date): string => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleReportSpotStatus = async (isAvailable: boolean) => {
    try {
      await firebaseService.updateParkingSpot(parkingSpot.id, {
        isAvailable,
        verifiedAt: new Date(),
      });

      Alert.alert(
        t('common.confirm'),
        `Parking spot has been updated as ${isAvailable ? 'available' : 'taken'}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.error('Error updating parking spot:', error);
      Alert.alert(t('common.error'), 'Failed to update parking spot');
    }
  };

  const handleLeaveFeedback = () => {
    navigation.navigate('Feedback', {parkingSpotId: parkingSpot.id});
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.statusBadge, parkingSpot.isAvailable ? styles.availableBadge : styles.takenBadge]}>
          <Icon
            name={parkingSpot.isAvailable ? 'check-circle' : 'cancel'}
            size={16}
            color="#fff"
          />
          <Text style={styles.statusText}>
            {parkingSpot.isAvailable ? 'Available' : 'Taken'}
          </Text>
        </View>
        
        <View style={[styles.typeBadge, parkingSpot.isPaid ? styles.paidBadge : styles.freeBadge]}>
          <Icon
            name={parkingSpot.isPaid ? 'paid' : 'money-off'}
            size={16}
            color="#fff"
          />
          <Text style={styles.typeText}>
            {parkingSpot.isPaid ? t('map.paidParking') : t('map.freeParking')}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('parking.details')}</Text>
        
        <View style={styles.detailRow}>
          <Icon name="place" size={20} color="#666" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>{t('parking.address')}</Text>
            <Text style={styles.detailValue}>{parkingSpot.address}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Icon name="local-parking" size={20} color="#666" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>{t('parking.type')}</Text>
            <Text style={styles.detailValue}>
              {parkingSpot.isPaid ? t('map.paidParking') : t('map.freeParking')}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Icon name="access-time" size={20} color="#666" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>{t('parking.reportedAt')}</Text>
            <Text style={styles.detailValue}>{formatDateTime(parkingSpot.reportedAt)}</Text>
          </View>
        </View>

        {parkingSpot.estimatedDuration && (
          <View style={styles.detailRow}>
            <Icon name="timer" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>{t('parking.estimatedDuration')}</Text>
              <Text style={styles.detailValue}>
                {parkingSpot.estimatedDuration} {t('parking.minutes')}
              </Text>
            </View>
          </View>
        )}

        {parkingSpot.rating && (
          <View style={styles.detailRow}>
            <Icon name="star" size={20} color="#FFD700" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>{t('parking.rating')}</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    name="star"
                    size={16}
                    color={star <= (parkingSpot.rating || 0) ? '#FFD700' : '#ddd'}
                  />
                ))}
                <Text style={styles.ratingText}>({parkingSpot.rating}/5)</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Update Status</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.availableButton]}
          onPress={() => handleReportSpotStatus(true)}>
          <Icon name="check-circle" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>{t('parking.reportAsAvailable')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.takenButton]}
          onPress={() => handleReportSpotStatus(false)}>
          <Icon name="cancel" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>{t('parking.reportAsTaken')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.feedbackButton]}
          onPress={handleLeaveFeedback}>
          <Icon name="rate-review" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>{t('parking.leaveFeedback')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  availableBadge: {
    backgroundColor: '#4CAF50',
  },
  takenBadge: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  paidBadge: {
    backgroundColor: '#FF9800',
  },
  freeBadge: {
    backgroundColor: '#2196F3',
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  detailContent: {
    flex: 1,
    marginLeft: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  actionsSection: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  availableButton: {
    backgroundColor: '#4CAF50',
  },
  takenButton: {
    backgroundColor: '#F44336',
  },
  feedbackButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});