import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface WebButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  title: string;
  style?: any;
  textStyle?: any;
}

const WebButton: React.FC<WebButtonProps> = ({ 
  onPress, 
  disabled, 
  loading, 
  title, 
  style,
  textStyle 
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled && !loading) {
      onPress();
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        ...styles.button,
        ...style,
        opacity: disabled || loading ? 0.6 : 1,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </div>
  );
};

const styles = StyleSheet.create({
  button: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
    userSelect: 'none',
  },
  text: {
    color: 'white',
  },
});

export default WebButton;