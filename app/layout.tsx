import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import PublicChrome from "@/components/PublicChrome";

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
      suppressHydrationWarning
    >
      <body className="min-h-full bg-white font-sans antialiased flex flex-col" suppressHydrationWarning>
        <Script
          id="extension-attribute-cleanup"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                const attrs = [
                  'fdprocessedid',
                  'data-new-gr-c-s-check-loaded',
                  'data-gr-ext-installed',
                  'data-scribe-recorder-ready'
                ];
                const selector = attrs.map((attr) => '[' + attr + ']').join(',');
                const clean = (root) => {
                  if (!root || root.nodeType !== 1) return;
                  attrs.forEach((attr) => root.removeAttribute(attr));
                  if (root.querySelectorAll) {
                    root.querySelectorAll(selector).forEach((node) => {
                      attrs.forEach((attr) => node.removeAttribute(attr));
                    });
                  }
                };
                clean(document.documentElement);
                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => clean(mutation.target));
                });
                observer.observe(document.documentElement, {
                  attributes: true,
                  subtree: true,
                  attributeFilter: attrs
                });
              })();
            `,
          }}
        />
        {children}
        <PublicChrome />
      </body>
    </html>
  );
}
