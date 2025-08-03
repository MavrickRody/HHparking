import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useRoute, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {FirebaseService} from '../services/FirebaseService';

export default function FeedbackScreen() {
  const {t} = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  
  const {parkingSpotId} = route.params as {parkingSpotId: string};
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const firebaseService = FirebaseService.getInstance();

  const handleStarPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      Alert.alert(t('common.error'), 'Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await firebaseService.submitFeedback({
        parkingSpotId,
        userId: 'current-user-id', // This would come from auth context
        rating,
        comment: comment.trim() || undefined,
      });

      Alert.alert(
        t('feedback.thankYou'),
        'Your feedback has been submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert(t('common.error'), 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="rate-review" size={60} color="#007AFF" />
        <Text style={styles.title}>{t('feedback.title')}</Text>
        <Text style={styles.subtitle}>{t('feedback.howWasExperience')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('parking.rating')}</Text>
        
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              style={styles.starButton}
              onPress={() => handleStarPress(star)}>
              <Icon
                name="star"
                size={40}
                color={star <= rating ? '#FFD700' : '#ddd'}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.ratingText}>
          {rating === 0 && 'Tap to rate'}
          {rating === 1 && 'Poor'}
          {rating === 2 && 'Fair'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Very Good'}
          {rating === 5 && 'Excellent'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('parking.comment')} (Optional)</Text>
        
        <TextInput
          style={styles.commentInput}
          placeholder="Share your experience with this parking spot..."
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
        />
        
        <Text style={styles.characterCount}>{comment.length}/500</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, (rating === 0 || submitting) && styles.disabledButton]}
          onPress={handleSubmitFeedback}
          disabled={rating === 0 || submitting}>
          <Text style={styles.submitButtonText}>
            {submitting ? t('common.loading') : t('feedback.submitFeedback')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>Tips for helpful feedback:</Text>
        <Text style={styles.tipItem}>• Rate based on ease of parking and spot accessibility</Text>
        <Text style={styles.tipItem}>• Mention if the spot information was accurate</Text>
        <Text style={styles.tipItem}>• Note any issues with the location or surroundings</Text>
        <Text style={styles.tipItem}>• Help other drivers by sharing your experience</Text>
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
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  starButton: {
    padding: 5,
    marginHorizontal: 5,
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    backgroundColor: '#f9f9f9',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  tips: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 20,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  tipItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
});