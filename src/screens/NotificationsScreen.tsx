import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {ParkingNotification} from '../types';
import {FirebaseService} from '../services/FirebaseService';

export default function NotificationsScreen() {
  const {t} = useTranslation();
  const [notifications, setNotifications] = useState<ParkingNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const firebaseService = FirebaseService.getInstance();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // In a real app, you'd get the user ID from auth context
      const userNotifications = await firebaseService.getUserNotifications('current-user-id');
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderNotificationItem = ({item}: {item: ParkingNotification}) => (
    <TouchableOpacity style={styles.notificationItem}>
      <View style={styles.notificationIcon}>
        <Icon
          name={item.type === 'parking_available' ? 'local-parking' : 'block'}
          size={24}
          color={item.type === 'parking_available' ? '#4CAF50' : '#F44336'}
        />
      </View>
      
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>
          {item.type === 'parking_available'
            ? t('notifications.newParkingSpot')
            : t('notifications.spotTaken')}
        </Text>
        
        <Text style={styles.notificationDescription}>
          {item.isPaid ? t('map.paidParking') : t('map.freeParking')} {t('notifications.nearYou')}
        </Text>
        
        <Text style={styles.notificationAddress} numberOfLines={1}>
          {item.address}
        </Text>
        
        <Text style={styles.notificationTime}>{formatTime(item.sentAt)}</Text>
      </View>
      
      <Icon name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="notifications-none" size={80} color="#ccc" />
      <Text style={styles.emptyStateText}>{t('notifications.noNotifications')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
      </View>
      
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationAddress: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#007AFF',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 20,
    textAlign: 'center',
  },
});