export const theme = {
  colors: {
    primary: '#6366f1',      // Modern Indigo
    secondary: '#f59e0b',    // Warm Orange
    accent: '#10b981',       // Emerald Green
    background: '#fafafa',   // Off-white
    surface: '#ffffff',      // White
    text: '#0f172a',         // Near Black
    textSecondary: '#64748b', // Slate Gray
    border: '#e2e8f0',       // Light border
    error: '#ef4444',        // Red
    success: '#10b981',      // Green
    warning: '#f59e0b',      // Orange
    // Modern additions
    primaryLight: '#818cf8',
    primaryDark: '#4f46e5',
    secondaryLight: '#fef3c7',
    surfaceElevated: '#f8fafc',
    overlay: 'rgba(0, 0, 0, 0.5)',
    gradient: {
      primary: ['#6366f1', '#818cf8'],
      secondary: ['#f59e0b', '#fbbf24'],
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 10,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.16,
      shadowRadius: 20,
      elevation: 15,
    },
  },
};