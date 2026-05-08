import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MCA RIT | MCA LBS Crash Course — Video Lessons, Mock Tests & Study Materials",
    template: "%s | MCA RIT",
  },
  description:
    "Crack the MCA LBS entrance exam with MCA RIT — Kerala's dedicated crash course platform. Get structured video lessons, timed mock tests, downloadable PDFs, and expert study materials for MCA LBS 2026 preparation.",
  keywords: [
    "MCA LBS",
    "LBS",
    "MCA",
    "RIT MCA",
    "MCA RIT",
    "LBS crash course",
    "MCA crash course",
    "MCA LBS entrance",
    "MCA LBS 2026",
    "MCA entrance exam Kerala",
    "LBS Centre MCA",
    "MCA LBS mock test",
    "MCA LBS preparation",
    "MCA LBS study materials",
    "MCA LBS video lessons",
    "Kerala MCA entrance",
    "MCA admission Kerala",
    "LBS MCA coaching",
    "MCA LBS online course",
  ],
  authors: [{ name: "MCA RIT" }],
  creator: "MCA RIT",
  metadataBase: new URL("https://mca-rit.pages.dev"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "MCA RIT",
    title: "MCA RIT — Crack MCA LBS Entrance with Confidence",
    description:
      "Structured video crash courses, timed mock tests & downloadable study materials to help you ace the Kerala MCA LBS entrance exam.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MCA RIT — MCA LBS Crash Course",
    description:
      "Video lessons, mock tests & study materials for MCA LBS entrance preparation.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
