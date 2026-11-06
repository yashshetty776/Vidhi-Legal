import { createTheme } from "@mui/material/styles";
import { colors } from "./colors";

export const theme = createTheme({
  palette: {
    primary: { main: colors.brand.primary, dark: colors.brand.dark },
    secondary: { main: colors.brand.secondary },
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
});
