import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { FeedbackModal } from "@/components/layout/feedback-modal";
import { MiniToast } from "@/components/layout/mini-toast";
import { ChangelogModal } from "@/components/layout/changelog-modal";
import { BottomNav } from "@/components/layout/bottom-nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IELTS Scribe | Academic Typing & Lexical Reflex Engine",
  description:
    "Master academic typing reflexes, AWL vocabulary, and high-band collocations through real-world journalism and articles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('gotyping_theme');
                if (theme === 'light' || (!theme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground min-h-[100dvh] pb-16 md:pb-0 selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors`}
      >
        {children}
        <FeedbackModal />
        <MiniToast />
        <ChangelogModal />
        <BottomNav />
      </body>
    </html>
  );
}

