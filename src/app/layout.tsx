import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Purrfect Picks | Cat-approved cart",
  description: "Purrfect Picks — a cozy, cat-approved dashboard for browsing, roasting, and approving products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} bg-slate-950 text-slate-100 antialiased`}>{children}</body>
    </html>
  );
}
