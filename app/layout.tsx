import type { Metadata } from "next";
import "./globals.css";
import AlexAssistant from "@/components/AlexAssistant";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Qsentia - Investor Intelligence Platform",
  description: "Advanced research and analytics platform for investor insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-white font-sans antialiased flex flex-col">
        {children}
        <SiteFooter />
        <AlexAssistant />
      </body>
    </html>
  );
}
