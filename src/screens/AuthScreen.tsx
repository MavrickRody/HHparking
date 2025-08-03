import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {FirebaseService} from '../services/FirebaseService';

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
}

export default function AuthScreen({onAuthSuccess}: AuthScreenProps) {
  const {t} = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const firebaseService = FirebaseService.getInstance();

  const handleEmailAuth = async () => {
    if (!email || !password || (isSignUp && !name)) {
      Alert.alert(t('common.error'), 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      let user;
      if (isSignUp) {
        user = await firebaseService.signUpWithEmail(email, password, name);
      } else {
        user = await firebaseService.signInWithEmail(email, password);
      }

      if (user) {
        onAuthSuccess(user);
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Implementation would go here for Google Sign-In
    Alert.alert('Info', 'Google Sign-In not implemented in this demo');
  };

  const handleFacebookSignIn = async () => {
    // Implementation would go here for Facebook Sign-In
    Alert.alert('Info', 'Facebook Sign-In not implemented in this demo');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Icon name="local-parking" size={80} color="#007AFF" />
          <Text style={styles.title}>{t('auth.welcome')}</Text>
        </View>

        <View style={styles.form}>
          {isSignUp && (
            <View style={styles.inputContainer}>
              <Icon name="person" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.name')}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Icon name="email" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleEmailAuth}
            disabled={loading}>
            <Text style={styles.primaryButtonText}>
              {loading ? t('common.loading') : isSignUp ? t('auth.signUp') : t('auth.signIn')}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
            <Icon name="google" size={20} color="#fff" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>{t('auth.signInWithGoogle')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, styles.facebookButton]} onPress={handleFacebookSignIn}>
            <Icon name="facebook" size={20} color="#fff" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>{t('auth.signInWithFacebook')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.switchButtonText}>
              {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}
            </Text>
          </TouchableOpacity>

          {!isSignUp && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    backgroundColor: '#db4437',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  facebookButton: {
    backgroundColor: '#4267B2',
  },
  socialIcon: {
    marginRight: 10,
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: '#666',
    fontSize: 14,
  },
});