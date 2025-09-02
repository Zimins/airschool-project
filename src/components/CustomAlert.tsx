import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Platform,
  Pressable,
} from 'react-native';
import { useAlert } from '../contexts/AlertContext';
import { theme } from '../styles/theme';

const CustomAlert: React.FC = () => {
  const { isVisible, alertOptions, hideAlert } = useAlert();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  if (!alertOptions) return null;

  const handleButtonPress = (onPress?: () => void) => {
    hideAlert();
    if (onPress) {
      setTimeout(onPress, 100); // Delay to allow animation
    }
  };

  const renderButton = (button: any, index: number) => {
    const isCancel = button.style === 'cancel';
    const isDestructive = button.style === 'destructive';
    
    const ButtonComponent = Platform.OS === 'web' ? Pressable : TouchableOpacity;
    
    return (
      <ButtonComponent
        key={index}
        style={[
          styles.button,
          isCancel && styles.cancelButton,
          isDestructive && styles.destructiveButton,
          index > 0 && styles.buttonMarginLeft,
        ]}
        onPress={() => handleButtonPress(button.onPress)}
      >
        <Text
          style={[
            styles.buttonText,
            isCancel && styles.cancelButtonText,
            isDestructive && styles.destructiveButtonText,
          ]}
        >
          {button.text}
        </Text>
      </ButtonComponent>
    );
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={() => {
        if (alertOptions.cancelable) {
          hideAlert();
        }
      }}
    >
      <Pressable 
        style={styles.overlay}
        onPress={() => {
          if (alertOptions.cancelable) {
            hideAlert();
          }
        }}
      >
        <Animated.View
          style={[
            styles.alertBox,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>{alertOptions.title}</Text>
            {alertOptions.message && (
              <Text style={styles.message}>{alertOptions.message}</Text>
            )}
            <View style={styles.buttonContainer}>
              {(alertOptions.buttons || [{ text: 'OK' }]).map(renderButton)}
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    minWidth: Platform.OS === 'web' ? 320 : 280,
    maxWidth: Platform.OS === 'web' ? 400 : '90%',
    ...Platform.select({
      ios: theme.shadow.lg,
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)',
      } as any,
    }),
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonMarginLeft: {
    marginLeft: theme.spacing.sm,
  },
  buttonText: {
    color: 'white',
    fontSize: theme.fontSize.base,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.text,
  },
  destructiveButton: {
    backgroundColor: '#dc2626',
  },
  destructiveButtonText: {
    color: 'white',
  },
});

export default CustomAlert;