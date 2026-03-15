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
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#10B981",
          colorBackground: "#0a0a0a",
          colorText: "#f1f5f9",
          colorTextSecondary: "#94a3b8",
          colorInputBackground: "rgba(255,255,255,0.05)",
          colorInputText: "#f1f5f9",
          colorDanger: "#ef4444",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-pt-sans), sans-serif",
        },
        elements: {
          card: {
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "rgba(0,0,0,0.9)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 0 60px rgba(16,185,129,0.08)",
          },
          headerTitle: { color: "#f1f5f9" },
          headerSubtitle: { color: "rgba(255,255,255,0.5)" },
          socialButtonsBlockButton: {
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "rgba(255,255,255,0.05)",
            color: "#f1f5f9",
          },
          formFieldInput: {
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "rgba(255,255,255,0.05)",
            color: "#f1f5f9",
          },
          formButtonPrimary: {
            backgroundColor: "#10B981",
            boxShadow: "0 10px 25px -5px rgba(16,185,129,0.3)",
          },
          footerActionLink: { color: "#34D399" },
          dividerLine: { backgroundColor: "rgba(255,255,255,0.1)" },
          dividerText: { color: "rgba(255,255,255,0.4)" },
          formFieldLabel: { color: "rgba(255,255,255,0.6)" },
          identityPreviewEditButton: { color: "#34D399" },
          userButtonPopoverCard: {
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "rgba(0,0,0,0.9)",
            backdropFilter: "blur(24px)",
          },
          userButtonPopoverActionButton: { color: "rgba(255,255,255,0.7)" },
          userButtonPopoverFooter: { display: "none" },
          footer: { display: "none" },
        },
      }}
    >
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