import type { Metadata, Viewport } from "next";
import "./globals.css";

const talentProjectVerification = process.env.NEXT_PUBLIC_TALENT_PROJECT_VERIFICATION;

export const metadata: Metadata = {
  title: "Celo Catch",
  description: "A daily onchain fishing game designed for MiniPay on Celo.",
  applicationName: "Celo Catch",
  manifest: "/manifest.webmanifest",
  other: talentProjectVerification
    ? { "talentapp:project_verification": talentProjectVerification }
    : undefined,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f6c453",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
