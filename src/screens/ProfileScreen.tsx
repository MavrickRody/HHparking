import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {User} from '../types';
import {FirebaseService} from '../services/FirebaseService';

interface ProfileScreenProps {
  onSignOut: () => void;
}

export default function ProfileScreen({onSignOut}: ProfileScreenProps) {
  const {t, i18n} = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const firebaseService = FirebaseService.getInstance();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // In a real app, you'd get the user ID from auth context
      const userData = await firebaseService.getUserData('current-user-id');
      setUser(userData);
      setEditedUser(userData);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!editedUser) return;

    setLoading(true);
    try {
      await firebaseService.updateUserProfile(editedUser.id, editedUser);
      setUser(editedUser);
      setIsEditing(false);
      Alert.alert(t('common.confirm'), 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(t('common.error'), 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    Alert.alert(
      t('profile.signOut'),
      'Are you sure you want to sign out?',
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('profile.signOut'),
          style: 'destructive',
          onPress: async () => {
            try {
              await firebaseService.signOut();
              onSignOut();
            } catch (error) {
              console.error('Sign out error:', error);
            }
          },
        },
      ],
    );
  };

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'de' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  const renderProfileField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    editable: boolean = true,
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing && editable ? (
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="words"
        />
      ) : (
        <Text style={styles.fieldValue}>{value || 'Not provided'}</Text>
      )}
    </View>
  );

  if (!user) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Icon name="person" size={60} color="#fff" />
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {!isEditing ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}>
              <Icon name="edit" size={20} color="#007AFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelEdit}>
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
                disabled={loading}>
                <Text style={styles.saveButtonText}>
                  {loading ? t('common.loading') : t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {renderProfileField(
          t('auth.name'),
          editedUser?.name || '',
          (text) => setEditedUser(prev => prev ? {...prev, name: text} : null),
        )}

        {renderProfileField(
          t('auth.email'),
          editedUser?.email || '',
          () => {}, // Email not editable
          false,
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.vehicleDetails')}</Text>

        {renderProfileField(
          t('profile.make'),
          editedUser?.vehicleDetails?.make || '',
          (text) => setEditedUser(prev => prev ? {
            ...prev,
            vehicleDetails: {...prev.vehicleDetails, make: text}
          } : null),
        )}

        {renderProfileField(
          t('profile.model'),
          editedUser?.vehicleDetails?.model || '',
          (text) => setEditedUser(prev => prev ? {
            ...prev,
            vehicleDetails: {...prev.vehicleDetails, model: text}
          } : null),
        )}

        {renderProfileField(
          t('profile.licensePlate'),
          editedUser?.vehicleDetails?.licensePlate || '',
          (text) => setEditedUser(prev => prev ? {
            ...prev,
            vehicleDetails: {...prev.vehicleDetails, licensePlate: text}
          } : null),
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t('profile.language')}</Text>
            <Text style={styles.settingValue}>
              {i18n.language === 'en' ? t('profile.english') : t('profile.german')}
            </Text>
          </View>
          <Switch
            value={i18n.language === 'de'}
            onValueChange={toggleLanguage}
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={i18n.language === 'de' ? '#007AFF' : '#f4f3f4'}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Icon name="exit-to-app" size={20} color="#F44336" />
        <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    padding: 5,
  },
  editActions: {
    flexDirection: 'row',
  },
  cancelButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
  },
  saveButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
  },
  fieldInput: {
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 20,
    marginBottom: 40,
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  signOutText: {
    fontSize: 16,
    color: '#F44336',
    marginLeft: 10,
    fontWeight: 'bold',
  },
});