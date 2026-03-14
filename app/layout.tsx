import "./globals.css";
import type { Metadata } from "next";
import { PT_Sans, PT_Serif } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import Navbar from "./components/Navbar";
import StarField from "./components/StarField";

const ptSans = PT_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  variable: "--font-pt-sans",
});

const ptSerif = PT_Serif({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  variable: "--font-pt-serif",
});

export const metadata: Metadata = {
  title: "Inspire FTC — Community Platform",
  description: "Materials, calendar and community for FIRST Tech Challenge teams.",
  icons: {
    icon: [{ url: "/brand/nomadic-dragons-logo.png", type: "image/png" }],
    apple: "/brand/nomadic-dragons-logo.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <ClerkProvider>
      <html lang={locale} className={`${ptSans.variable} ${ptSerif.variable}`}>
        <body className="bg-black font-sans text-slate-100 antialiased">
          <NextIntlClientProvider messages={messages}>
            <StarField />
            <Navbar />
            <main className="relative z-10 mx-auto max-w-7xl px-6 py-10">
              {children}
            </main>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}