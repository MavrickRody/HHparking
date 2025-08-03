import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import {User, ParkingSpot, ParkingNotification, UserFeedback} from '../types';

export class FirebaseService {
  private static instance: FirebaseService;

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  // Authentication methods
  async signInWithEmail(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      return await this.getUserData(userCredential.user.uid);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signUpWithEmail(email: string, password: string, name: string): Promise<User | null> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user: User = {
        id: userCredential.user.uid,
        email,
        name,
        createdAt: new Date(),
      };

      await firestore().collection('users').doc(user.id).set(user);
      return user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async getUserData(userId: string): Promise<User | null> {
    try {
      const doc = await firestore().collection('users').doc(userId).get();
      if (doc.exists) {
        const data = doc.data();
        return {
          ...data,
          createdAt: data?.createdAt?.toDate() || new Date(),
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Get user data error:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      await firestore().collection('users').doc(userId).update(updates);
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  }

  // Parking spot methods
  async createParkingSpot(spot: Omit<ParkingSpot, 'id'>): Promise<string> {
    try {
      const docRef = await firestore().collection('parkingSpots').add({
        ...spot,
        reportedAt: firestore.FieldValue.serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Create parking spot error:', error);
      throw error;
    }
  }

  async updateParkingSpot(spotId: string, updates: Partial<ParkingSpot>): Promise<void> {
    try {
      await firestore().collection('parkingSpots').doc(spotId).update(updates);
    } catch (error) {
      console.error('Update parking spot error:', error);
      throw error;
    }
  }

  async getNearbyParkingSpots(
    latitude: number,
    longitude: number,
    radiusKm: number = 2,
  ): Promise<ParkingSpot[]> {
    try {
      // Simple implementation - in production, you'd use geohash for better performance
      const snapshot = await firestore()
        .collection('parkingSpots')
        .where('isAvailable', '==', true)
        .limit(50)
        .get();

      const spots: ParkingSpot[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const spot: ParkingSpot = {
          id: doc.id,
          ...data,
          reportedAt: data.reportedAt?.toDate() || new Date(),
          verifiedAt: data.verifiedAt?.toDate(),
        } as ParkingSpot;

        // Calculate distance and filter by radius
        const distance = this.calculateDistance(
          latitude,
          longitude,
          spot.latitude,
          spot.longitude,
        );

        if (distance <= radiusKm) {
          spots.push(spot);
        }
      });

      return spots.sort((a, b) => {
        const distanceA = this.calculateDistance(latitude, longitude, a.latitude, a.longitude);
        const distanceB = this.calculateDistance(latitude, longitude, b.latitude, b.longitude);
        return distanceA - distanceB;
      });
    } catch (error) {
      console.error('Get nearby parking spots error:', error);
      return [];
    }
  }

  // Notification methods
  async sendParkingNotification(
    notification: Omit<ParkingNotification, 'id' | 'sentAt'>,
  ): Promise<void> {
    try {
      await firestore().collection('notifications').add({
        ...notification,
        sentAt: firestore.FieldValue.serverTimestamp(),
      });

      // Send push notification to nearby users
      await this.sendPushNotification(notification);
    } catch (error) {
      console.error('Send parking notification error:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: string, limit: number = 20): Promise<ParkingNotification[]> {
    try {
      const snapshot = await firestore()
        .collection('notifications')
        .where('userId', '==', userId)
        .orderBy('sentAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sentAt: doc.data().sentAt?.toDate() || new Date(),
      })) as ParkingNotification[];
    } catch (error) {
      console.error('Get user notifications error:', error);
      return [];
    }
  }

  // Feedback methods
  async submitFeedback(feedback: Omit<UserFeedback, 'id' | 'createdAt'>): Promise<void> {
    try {
      await firestore().collection('feedback').add({
        ...feedback,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // Update parking spot rating
      await this.updateParkingSpotRating(feedback.parkingSpotId);
    } catch (error) {
      console.error('Submit feedback error:', error);
      throw error;
    }
  }

  private async updateParkingSpotRating(parkingSpotId: string): Promise<void> {
    try {
      const feedbackSnapshot = await firestore()
        .collection('feedback')
        .where('parkingSpotId', '==', parkingSpotId)
        .get();

      if (!feedbackSnapshot.empty) {
        const ratings = feedbackSnapshot.docs.map(doc => doc.data().rating);
        const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

        await firestore().collection('parkingSpots').doc(parkingSpotId).update({
          rating: parseFloat(averageRating.toFixed(1)),
        });
      }
    } catch (error) {
      console.error('Update parking spot rating error:', error);
    }
  }

  // Push notification methods
  async requestNotificationPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    } catch (error) {
      console.error('Request notification permission error:', error);
      return false;
    }
  }

  async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      return token;
    } catch (error) {
      console.error('Get FCM token error:', error);
      return null;
    }
  }

  private async sendPushNotification(notification: Omit<ParkingNotification, 'id' | 'sentAt'>): Promise<void> {
    // In a real implementation, this would use Firebase Cloud Functions
    // to send notifications to nearby users based on their location
    console.log('Push notification would be sent:', notification);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}