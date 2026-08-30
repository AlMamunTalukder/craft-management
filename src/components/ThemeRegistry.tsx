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
  colorSchemeSelector: "data",
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#facc15" },
        background: { default: "#f9fafb", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#facc15" },
        background: { default: "#121212", paper: "#1e1e1e" },
      },
    },
  },
  typography: {
    fontFamily: banglaFontFamily,
  },
});

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  return (
    <CssVarsProvider theme={theme} defaultMode="system" modeStorageKey="app-theme">
      <CssBaseline enableColorScheme />
      {children}
    </CssVarsProvider>
  );
}