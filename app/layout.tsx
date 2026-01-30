import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/brand/nomadic-dragons-logo.png", type: "image/png" }],
    apple: "/brand/nomadic-dragons-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="ru">
        <body className="bg-gray-50 text-gray-900">
          <Navbar />
          <main className="mx-auto max-w-7xl px-6 py-10">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
