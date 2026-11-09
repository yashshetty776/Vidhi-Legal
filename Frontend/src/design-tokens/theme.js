import { createTheme } from "@mui/material/styles";
import { colors } from "./colors";

export const theme = createTheme({
  palette: {
    primary: { main: colors.brand.primary, dark: colors.brand.dark, contrastText: colors.text.inverse },
    secondary: { main: colors.brand.secondary, contrastText: colors.text.inverse },
    background: { default: colors.surface.page, paper: colors.surface.card },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
    success: { main: colors.status.success },
    error: { main: colors.status.error },
    warning: { main: colors.status.warning },
    info: { main: colors.status.info },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    h1: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
    h2: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
    h3: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
    h4: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, boxShadow: "none" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { border: "1px solid rgba(41, 37, 33, 0.08)", boxShadow: "0 8px 24px rgba(41, 37, 33, 0.08)" },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
    },
  },
});
