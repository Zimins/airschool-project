import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  cancelable?: boolean;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
  alertOptions: AlertOptions | null;
  isVisible: boolean;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [alertOptions, setAlertOptions] = useState<AlertOptions | null>(null);

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertOptions(options);
    setIsVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setAlertOptions(null), 300); // Clear after animation
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, alertOptions, isVisible }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

// Global alert function that mimics Alert.alert API
export const CustomAlert = {
  alert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: { cancelable?: boolean }
  ) => {
    // This will be implemented to work with the context
    if (typeof window !== 'undefined' && (window as any).__alertContext) {
      (window as any).__alertContext.showAlert({
        title,
        message,
        buttons: buttons || [{ text: 'OK' }],
        cancelable: options?.cancelable,
      });
    }
  },
};