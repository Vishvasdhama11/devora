import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppSessionProvider } from "@/components/session-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://devora.dev"),
  title: "Devora | Your Developer Command Center",
  description: "Open-source developer tools for JSON, API testing, regex, encoding, CSS, Git, and more.",
  openGraph: {
    title: "Devora",
    description: "The modern toolkit for developers.",
    url: "https://devora.dev",
    siteName: "Devora",
  },
  twitter: {
    card: "summary_large_image",
    title: "Devora",
    description: "The modern toolkit for developers.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-[#09090b] text-zinc-100 antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AppSessionProvider>
            <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.20),_transparent_35%),linear-gradient(180deg,_#09090b,_#111827_40%,_#09090b)]">
              <SiteHeader />
              <main>{children}</main>
              <SiteFooter />
            </div>
          </AppSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
