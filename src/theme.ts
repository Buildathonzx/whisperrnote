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

// Function to create a checkered background
const createCheckeredBackground = (color1: string, color2: string, size: number) => ({
  backgroundImage: `linear-gradient(45deg, ${color1} 25%, transparent 25%), linear-gradient(-45deg, ${color1} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${color1} 75%), linear-gradient(-45deg, transparent 75%, ${color1} 75%)`,
  backgroundSize: `${size}px ${size}px`,
  backgroundColor: color2,
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
          ...createCheckeredBackground(colors.lightBrown, colors.brownishWhite, 20),
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
          ...createCheckeredBackground(colors.mediumBrown, colors.darkBrown, 20),
        },
      },
    },
  },
});
