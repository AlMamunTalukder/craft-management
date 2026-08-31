"use client";

import { CssVarsProvider, extendTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactNode } from "react";
import { Noto_Sans_Bengali, Hind_Siliguri, Roboto } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  display: "swap",
});
const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  display: "swap",
});
const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});
const banglaFontFamily = `${notoSansBengali.style.fontFamily}, ${hindSiliguri.style.fontFamily}, ${roboto.style.fontFamily}, "Inter", "Helvetica", "Arial", sans-serif`;

const theme = extendTheme({
  colorSchemeSelector: "class",
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#4F0187", contrastText: "#ffffff" },
        secondary: { main: "#7c3aed", contrastText: "#ffffff" },
        background: { default: "#f8fafc", paper: "#ffffff" },
        text: { primary: "#0f172a", secondary: "#64748b" },
        divider: "#e2e8f0",
        grey: { 50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#8b5cf6", contrastText: "#ffffff" },
        secondary: { main: "#a78bfa", contrastText: "#0f172a" },
        background: { default: "#0f0a1a", paper: "#1e1b2e" },
        text: { primary: "#f1f5f9", secondary: "#94a3b8" },
        divider: "#2d2640",
        grey: { 50: "#1e1b2e", 100: "#2d2640", 200: "#3b3560" },
      },
    },
  },
  typography: {
    fontFamily: banglaFontFamily,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: banglaFontFamily,
          transition: "background-color 0.2s ease, color 0.2s ease",
        },
      },
    },
  },
});

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  return (
    <CssVarsProvider theme={theme} defaultMode="system" modeStorageKey="app-theme" disableTransitionOnChange={false}>
      <CssBaseline enableColorScheme />
      {children}
    </CssVarsProvider>
  );
}
