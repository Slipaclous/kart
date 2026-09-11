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
  title: "LIAM MOREAU #42 — Karting Athlete & Future Motorsport Star",
  description:
    "Official website of Liam Moreau: Race telemetry, 2026 calendar, championship results, on-board videos and sponsorship dossier.",
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
