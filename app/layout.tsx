import type { Metadata } from "next";
import { Geist, Caveat, Permanent_Marker, Playfair_Display } from "next/font/google";
import { Providers } from "./providers";
import { LanguageSwitcher } from "@/components/language-switcher";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const marker = Permanent_Marker({
  variable: "--font-marker",
  subsets: ["latin"],
  weight: "400",
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Who, Where, What? — Create ridiculous stories with your friends",
  description:
    "Jeu de soirée en ligne : réponds à Qui, Où, Quoi et laisse le hasard créer des histoires absurdes avec tes amis.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${caveat.variable} ${marker.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <LanguageSwitcher />
          {children}
        </Providers>
      </body>
    </html>
  );
}
