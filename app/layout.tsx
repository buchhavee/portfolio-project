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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="bg-bg-page font-sans text-text-primary antialiased">
        <Header />
        {children}
        <ContactPill />
      </body>
    </html>
  );
}
