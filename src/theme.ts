import { createTheme } from '@mui/material/styles';

// Define the comprehensive color palette following ui.md specifications
const colors = {
  // Light mode colors - brownish white foregrounds, ash-white backgrounds
  light: {
    background: '#F0F2F5', // Ash-white background
    paper: '#FFFFFF', // Pure white for cards
    surface: '#FAFBFC', // Slightly off-white surface
    primary: '#FFC107', // Sun-yellow primary
    primaryDark: '#FF8F00',
    secondary: '#8D6E63', // Medium brown
    accent: '#FF9800', // Orange accent
    text: {
      primary: '#2D2016', // Very dark brown for text
      secondary: '#5D4037', // Medium brown for secondary text
      muted: '#8D6E63', // Light brown for muted text
    },
    border: '#E1E5E9',
    shadow: 'rgba(45, 32, 22, 0.15)',
  },
  
  // Dark mode colors - dark ash backgrounds, very dark brown foregrounds  
  dark: {
    background: '#1A1A1A', // Dark ash background
    paper: '#2D2D2D', // Dark brown paper
    surface: '#333333', // Elevated surface
    primary: '#FFC107', // Sun-yellow primary (same)
    primaryDark: '#FF8F00',
    secondary: '#BCAAA4', // Light brown for dark mode
    accent: '#FF9800', // Orange accent
    text: {
      primary: '#EFEBE9', // Brownish white for primary text
      secondary: '#BCAAA4', // Light brown for secondary text
      muted: '#8D6E63', // Medium brown for muted text
    },
    border: '#404040',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

// 3D effect shadow generators
const create3DShadow = (color: string, intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
  const intensityMap = {
    light: {
      offset: '2px 2px',
      blur: '4px',
      inset: '0 1px 2px',
    },
    medium: {
      offset: '4px 4px',
      blur: '8px', 
      inset: '0 2px 4px',
    },
    heavy: {
      offset: '8px 8px',
      blur: '16px',
      inset: '0 4px 8px',
    },
  };
  
  const config = intensityMap[intensity];
  return `
    ${config.offset} ${config.blur} ${color},
    inset 0 1px 1px rgba(255, 255, 255, 0.1),
    inset ${config.inset} rgba(0, 0, 0, 0.1)
  `;
};

// Create the light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.light.primary,
      dark: colors.light.primaryDark,
      contrastText: colors.light.text.primary,
    },
    secondary: {
      main: colors.light.secondary,
      contrastText: colors.light.text.primary,
    },
    background: {
      default: colors.light.background,
      paper: colors.light.paper,
    },
    text: {
      primary: colors.light.text.primary,
      secondary: colors.light.text.secondary,
    },
    divider: colors.light.border,
    action: {
      hover: 'rgba(255, 193, 7, 0.08)',
      selected: 'rgba(255, 193, 7, 0.12)',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none' as const,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          boxShadow: create3DShadow(colors.light.shadow),
          transition: 'all 0.2s ease-in-out',
          border: `2px solid ${colors.light.border}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: create3DShadow(colors.light.shadow, 'heavy'),
          },
          '&:active': {
            transform: 'translateY(0px)',
            boxShadow: create3DShadow(colors.light.shadow, 'light'),
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${colors.light.primary} 0%, ${colors.light.primaryDark} 100%)`,
          color: colors.light.text.primary,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          border: `2px solid ${colors.light.border}`,
          boxShadow: create3DShadow(colors.light.shadow),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: create3DShadow(colors.light.shadow, 'heavy'),
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: create3DShadow(colors.light.shadow, 'light'),
          border: `1px solid ${colors.light.border}`,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: create3DShadow(colors.light.shadow, 'light'),
          border: `1px solid ${colors.light.border}`,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: create3DShadow(colors.light.shadow, 'medium'),
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            boxShadow: `inset ${create3DShadow(colors.light.shadow, 'light')}`,
            '& fieldset': {
              border: `2px solid ${colors.light.border}`,
            },
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.light.background,
          color: colors.light.text.primary,
          fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
        },
        '*': {
          boxSizing: 'border-box',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: colors.light.background,
        },
        '*::-webkit-scrollbar-thumb': {
          background: colors.light.border,
          borderRadius: '4px',
        },
      },
    },
  },
});

// Create the dark theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.dark.primary,
      dark: colors.dark.primaryDark,
      contrastText: colors.dark.text.primary,
    },
    secondary: {
      main: colors.dark.secondary,
      contrastText: colors.dark.text.primary,
    },
    background: {
      default: colors.dark.background,
      paper: colors.dark.paper,
    },
    text: {
      primary: colors.dark.text.primary,
      secondary: colors.dark.text.secondary,
    },
    divider: colors.dark.border,
    action: {
      hover: 'rgba(255, 193, 7, 0.08)',
      selected: 'rgba(255, 193, 7, 0.12)',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none' as const,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          boxShadow: create3DShadow(colors.dark.shadow),
          transition: 'all 0.2s ease-in-out',
          border: `2px solid ${colors.dark.border}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: create3DShadow(colors.dark.shadow, 'heavy'),
          },
          '&:active': {
            transform: 'translateY(0px)',
            boxShadow: create3DShadow(colors.dark.shadow, 'light'),
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${colors.dark.primary} 0%, ${colors.dark.primaryDark} 100%)`,
          color: colors.dark.text.primary,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          border: `2px solid ${colors.dark.border}`,
          boxShadow: create3DShadow(colors.dark.shadow),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: create3DShadow(colors.dark.shadow, 'heavy'),
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: create3DShadow(colors.dark.shadow, 'light'),
          border: `1px solid ${colors.dark.border}`,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: create3DShadow(colors.dark.shadow, 'light'),
          border: `1px solid ${colors.dark.border}`,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: create3DShadow(colors.dark.shadow, 'medium'),
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            boxShadow: `inset ${create3DShadow(colors.dark.shadow, 'light')}`,
            '& fieldset': {
              border: `2px solid ${colors.dark.border}`,
            },
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.dark.background,
          color: colors.dark.text.primary,
          fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
        },
        '*': {
          boxSizing: 'border-box',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: colors.dark.background,
        },
        '*::-webkit-scrollbar-thumb': {
          background: colors.dark.border,
          borderRadius: '4px',
        },
      },
    },
  },
});
