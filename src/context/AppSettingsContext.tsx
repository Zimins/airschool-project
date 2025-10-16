/**
 * App Settings Context
 * Provides global access to app settings like app name, tagline
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettingsService, AppSettings } from '../services/AppSettingsService';

interface AppSettingsContextType {
  settings: AppSettings;
  refreshSettings: () => Promise<void>;
  isLoading: boolean;
}

const AppSettingsContext = createContext<AppSettingsContextType>({
  settings: {
    app_name: 'PreflightSchool',
    app_tagline: 'Start your flight dream',
  },
  refreshSettings: async () => {},
  isLoading: true,
});

export const useAppSettings = () => useContext(AppSettingsContext);

interface AppSettingsProviderProps {
  children: ReactNode;
}

export const AppSettingsProvider: React.FC<AppSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({
    app_name: 'PreflightSchool',
    app_tagline: 'Start your flight dream',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [appSettingsService] = useState(() => new AppSettingsService());

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const fetchedSettings = await appSettingsService.getSettings();
      setSettings(fetchedSettings);
    } catch (error) {
      console.error('Error loading app settings:', error);
      // Keep default settings on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const refreshSettings = async () => {
    await loadSettings();
  };

  return (
    <AppSettingsContext.Provider value={{ settings, refreshSettings, isLoading }}>
      {children}
    </AppSettingsContext.Provider>
  );
};
