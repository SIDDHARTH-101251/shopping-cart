import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Purrfect Picks | EEPY-approved cart",
  description: "Purrfect Picks — a cozy, EEPY-approved dashboard for browsing, roasting, and approving products.",
  icons: {
    icon: "/purrfect-picks.svg",
    shortcut: "/purrfect-picks.svg",
    apple: "/purrfect-picks.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} bg-slate-950 text-slate-100 antialiased lg:cursor-none`}>{children}</body>
    </html>
  );
}
