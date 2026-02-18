import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { SkyBackground } from "../../public/SkyBackground";
import { getMeServer } from "@/lib/api/getMeServer";
import { AuthProvider } from "./providers/auth-provider";
import { ConditionalTopRank } from "@/lib/components/ConditionalTopRank";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aquasorata.site"),
  title: "Battle of 24",
  description: "Battle of 24 is a quick math challenge that tests your logic and creativity. Use all numbers, make 24, and beat the clock. Simple rules. Endless challenges.",
  openGraph: {
    title: "Battle of 24",
    description: "Battle of 24 is a quick math challenge that tests your logic and creativity. Use all numbers, make 24, and beat the clock. Simple rules. Endless challenges.",
    url: "https://aquasorata.site/",
    siteName: "Battle of 24",
    images: [
      {
        url: "/preview.jpg",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Battle of 24",
    description: "Battle of 24 is a quick math challenge that tests your logic and creativity. Use all numbers, make 24, and beat the clock. Simple rules. Endless challenges.",
    images: ["/preview.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const me = await getMeServer();

  return (
    <AuthProvider me={me}>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} relative min-h-screen`}
        >
          <SkyBackground/>
          <main className="flex flex-col relative z-0 min-h-screen">
            {children}
            <ConditionalTopRank/>
          </main>
          <Toaster position="top-center" />
        </body>
      </html>
    </AuthProvider>
  );
}
