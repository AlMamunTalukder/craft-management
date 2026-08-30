import "./global.css";
import Providers from "@/lib/Providers";
import ThemeRegistry from "@/components/ThemeRegistry";
import { Toaster } from "react-hot-toast";
import { Noto_Sans_Bengali, Hind_Siliguri } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  display: "swap",
  variable: "--font-bangla",
});
const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  display: "swap",
  variable: "--font-bangla-secondary",
});

export const metadata = {
  title: "craft-international-institute",
  description: "Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={`${notoSansBengali.variable} ${hindSiliguri.variable}`}>
      <body className={`antialiased ${notoSansBengali.className}`} style={{ fontFamily: `${notoSansBengali.style.fontFamily}, ${hindSiliguri.style.fontFamily}, sans-serif` }}>
        <ThemeRegistry>
          <Toaster position="top-right" reverseOrder={false} />
          <Providers>{children}</Providers>
        </ThemeRegistry>
      </body>
    </html>
  );
}