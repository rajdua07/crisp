import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crisp — AI gave you the draft. Crisp makes it yours.",
  description:
    "Paste any AI output. Get it instantly recast into every format you need — in your voice — in 5 seconds.",
  keywords: ["AI", "content", "recast", "voice", "productivity"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="antialiased min-h-screen bg-dark-950">
          <div className="noise-overlay pointer-events-none fixed inset-0 z-50 opacity-[0.015]" />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
