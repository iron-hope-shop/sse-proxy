import { createTheme } from "@mui/material/styles";
import { walmartDarkTokens as w } from "./designTokens.js";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: w.trueBlueOnDark,
      dark: w.trueBlue,
      light: "#8CC8FF",
      contrastText: w.midnight,
    },
    secondary: {
      main: w.sparkYellow,
      contrastText: w.textOnSpark,
    },
    error: {
      main: w.alertAccent,
      contrastText: w.midnight,
    },
    info: { main: w.secondaryBlue },
    background: {
      default: w.midnight,
      paper: w.surfaceElevated,
    },
    divider: w.divider,
    text: {
      primary: w.textPrimary,
      secondary: w.textSecondary,
    },
  },
  shape: { borderRadius: 3 },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: "1.35rem", fontWeight: 600, color: w.textPrimary },
    h2: { fontSize: "1rem", fontWeight: 600, color: w.textPrimary },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: w.midnight,
          backgroundImage: "none",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: w.surface,
          borderBottom: `2px solid ${w.trueBlue}`,
          color: w.textPrimary,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: w.surfaceElevated,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 3 },
        outlined: {
          borderColor: w.trueBlueOnDark,
          "&:hover": {
            borderColor: w.trueBlue,
            backgroundColor: "rgba(94, 176, 255, 0.08)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 3 },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        rounded: { borderRadius: 3 },
        rectangular: { borderRadius: 3 },
      },
    },
  },
});
