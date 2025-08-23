import { createTheme } from '@mui/material/styles';

// Define the color palette
const colors = {
  // Brown shades
  darkBrown: '#3E2723', // A very dark brown
  mediumBrown: '#5D4037',
  lightBrown: '#8D6E63',
  brownishWhite: '#F5F5F5', // A brownish white for light mode background
  darkPaper: '#4E342E', // Darker paper for dark mode

  // Sun-yellow shades
  sunYellow: '#FFC107',
  sunYellowDark: '#FFA000',

  // Common colors
  white: '#FFFFFF',
  black: '#000000',
  grey: '#9E9E9E',
};

// Function to create a subtle grid background with thin lines
const createGridBackground = (lineColor: string, backgroundColor: string, size: number) => ({
  backgroundImage: `
    linear-gradient(to right, ${lineColor} 1px, transparent 1px),
    linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)
  `,
  backgroundSize: `${size}px ${size}px`,
  backgroundColor: backgroundColor,
});

// Create the light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.sunYellow,
    },
    secondary: {
      main: colors.mediumBrown,
    },
    background: {
      default: colors.brownishWhite,
      paper: colors.white,
    },
    text: {
      primary: colors.darkBrown,
      secondary: colors.mediumBrown,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          ...createGridBackground('rgba(141, 110, 99, 0.1)', colors.brownishWhite, 24),
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
      main: colors.sunYellow,
    },
    secondary: {
      main: colors.lightBrown,
    },
    background: {
      default: colors.darkBrown,
      paper: colors.darkPaper,
    },
    text: {
      primary: colors.brownishWhite,
      secondary: colors.grey,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          ...createGridBackground('rgba(93, 64, 55, 0.15)', colors.darkBrown, 24),
        },
      },
    },
  },
});
