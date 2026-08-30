import { createTheme } from "@mui/material/styles";

// Use CSS variables defined in layout.tsx via next/font (single source, no duplicate @font-face)
// layout.tsx sets --font-bangla and --font-bangla-secondary on <html>
const banglaFontFamily = `var(--font-bangla), var(--font-bangla-secondary), "Roboto", "Inter", sans-serif`;

export const theme = createTheme({
  palette: {
    primary: {
      main: "#4F0187",
    },
    secondary: {
      main: "#4F0187",
      light: "#4F0187",
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { fontFamily: banglaFontFamily },
        "*": { fontFamily: banglaFontFamily },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: { fontFamily: banglaFontFamily },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { fontFamily: banglaFontFamily },
        head: { fontFamily: banglaFontFamily, fontWeight: 600 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontFamily: banglaFontFamily },
        label: { fontFamily: banglaFontFamily },
      },
    },
    MuiButton: {
      defaultProps: {
        variant: "contained",
      },
      styleOverrides: {
        root: {
          padding: "8px 24px",
          boxShadow: "none",
          fontFamily: banglaFontFamily,
        },
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: "lg",
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: { fontFamily: banglaFontFamily },
      },
    },
  },
  typography: {
    fontFamily: banglaFontFamily,
    allVariants: {
      fontFamily: banglaFontFamily,
    },
    body1: {
      color: "#0B1134CC",
      fontFamily: banglaFontFamily,
    },
    body2: {
      fontFamily: banglaFontFamily,
    },
    h1: { fontFamily: banglaFontFamily },
    h2: { fontFamily: banglaFontFamily },
    h3: { fontFamily: banglaFontFamily },
    h4: { fontFamily: banglaFontFamily },
    h5: { fontFamily: banglaFontFamily },
    h6: { fontFamily: banglaFontFamily },
    button: { fontFamily: banglaFontFamily },
  },
});

theme.shadows[1] = "0px 5px 22px lightgray";
