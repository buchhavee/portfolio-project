import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { ContactPill } from "@/components/molecules/contact-pill";
import { Header } from "@/components/organisms/header";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "mads buchhave.",
  description:
    "Frontend student building thoughtful, fast and playful web experiences.",
};

// Runs before the first paint, so a remembered theme does not flash in.
const themeScript = `try {
  const theme = localStorage.getItem("theme");
  if (theme) document.documentElement.dataset.theme = theme;
} catch {}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The script sets data-theme before React takes over.
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-bg-page font-sans text-text-primary antialiased">
        <Header />
        {children}
        <ContactPill />
      </body>
    </html>
  );
}
