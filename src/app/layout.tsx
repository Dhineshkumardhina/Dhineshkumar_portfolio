import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { readPortfolioData } from "@/lib/portfolio-server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const portfolio = await readPortfolioData();
  return {
    title: `${portfolio.firstName}. — ${portfolio.roleTitle}`,
    description: portfolio.aboutSummary,
    openGraph: {
      title: `${portfolio.firstName}. — ${portfolio.roleTitle}`,
      description: portfolio.aboutSummary,
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} dark`}
    >
      <body
        suppressHydrationWarning
        className="bg-[#fafafa] text-[#0a0a0a] font-[family-name:var(--font-inter)] antialiased"
      >
        {children}
      </body>
    </html>
  );
}
