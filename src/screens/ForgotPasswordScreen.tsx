import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../styles/theme';
import { AuthService } from '../services/AuthService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const authService = new AuthService();

  const handleSendReset = async () => {
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPasswordEmail(email.trim());
      setEmailSent(true);
    } catch (error: any) {
      console.error('Failed to send reset email:', error.message);
      setErrorMessage(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-outline" size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password
          </Text>
        </View>

        {!emailSent ? (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={theme.colors.textSecondary}
                editable={!loading}
              />
            </View>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#c62828" style={styles.errorIcon} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Pressable
              style={[styles.sendButton, loading && styles.sendButtonDisabled]}
              onPress={handleSendReset}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="white" />
                  <Text style={[styles.sendButtonText, { marginLeft: 8 }]}>Sending...</Text>
                </View>
              ) : (
                <Text style={styles.sendButtonText}>Send Reset Link</Text>
              )}
            </Pressable>

            <TouchableOpacity style={styles.backToLogin} onPress={handleBackToLogin}>
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
            </View>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successText}>
              We've sent a password reset link to {email}. Click the link to reset your password.
            </Text>
            <TouchableOpacity style={styles.backButton2} onPress={handleBackToLogin}>
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
    paddingBottom: theme.spacing.xl,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 30,
    left: theme.spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.sm,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    marginTop: theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    marginRight: theme.spacing.sm,
  },
  errorText: {
    color: '#c62828',
    fontSize: theme.fontSize.sm,
    flex: 1,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    justifyContent: 'center',
    minHeight: 48,
    ...(Platform.OS === 'web' &&
      ({
        cursor: 'pointer',
        userSelect: 'none',
      } as any)),
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: 'white',
    fontSize: theme.fontSize.base,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backToLogin: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  backToLoginText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.base,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.xxl,
  },
  successIconContainer: {
    marginBottom: theme.spacing.lg,
  },
  successTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  successText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  backButton2: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  backButtonText: {
    color: 'white',
    fontSize: theme.fontSize.base,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;
