import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "HealthFlow - Clinic Booking System",
  description: "Book appointments with healthcare professionals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased"
      data-theme="dark"
    >
      <body className="min-h-full flex flex-col bg-background text-on-surface">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}