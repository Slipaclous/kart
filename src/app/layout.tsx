import type { Metadata } from "next";
import { Oswald, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EDOUARD GODFROID « DOUDOU » — Champion de Belgique de Karting",
  description:
    "Site officiel d'Edouard Godfroid (Doudou Racing) : Champion de Belgique de Karting, palmarès IAME Benelux & Euro Series, calendrier des courses et partenariats.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${oswald.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#07090e] text-[#f1f5f9]">{children}</body>
    </html>
  );
}
