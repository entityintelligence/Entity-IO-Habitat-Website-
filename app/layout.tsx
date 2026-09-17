import type { Metadata } from "next";
import { Suspense } from "react";
import { Fragment_Mono, IBM_Plex_Sans_KR, Oswald } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme";
import { PlaceProvider } from "@/components/place";

const fragment = Fragment_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fragment",
});

const plex = IBM_Plex_Sans_KR({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-plex",
});

const oswald = Oswald({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-oswald",
});

const cy = localFont({
  src: "../public/fonts/cy-semibold.woff2",
  variable: "--font-cy",
  weight: "600",
  display: "swap",
});

const formaDisplay = localFont({
  src: "../public/fonts/forma-display.woff",
  variable: "--font-display",
  display: "swap",
});

const formaMicro = localFont({
  src: "../public/fonts/forma-micro.woff2",
  variable: "--font-micro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Entity Intelligence",
  applicationName: "Entity Intelligence",
  description:
    "Entity Intelligence. The next generation of enterprise planning. Predict the entity. Approve the path. Let the system carry the rest.",
  metadataBase: new URL("https://entityintelligence.io"),
  icons: {
    icon: [
      { url: "/favicon-light-v5.ico", media: "(prefers-color-scheme: light)", type: "image/x-icon" },
      { url: "/favicon-dark-v5.ico", media: "(prefers-color-scheme: dark)", type: "image/x-icon" },
      { url: "/icon-light-v5.png", media: "(prefers-color-scheme: light)", type: "image/png", sizes: "32x32" },
      { url: "/icon-dark-v5.png", media: "(prefers-color-scheme: dark)", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Entity Intelligence",
    siteName: "Entity Intelligence",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-AU"
      data-theme="light"
      suppressHydrationWarning
      className={`${fragment.variable} ${plex.variable} ${oswald.variable} ${cy.variable} ${formaDisplay.variable} ${formaMicro.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon-light-v5.ico" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/favicon-dark-v5.ico" media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="/icon-light-v5.png" type="image/png" sizes="32x32" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/icon-dark-v5.png" type="image/png" sizes="32x32" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#111111" />
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.setAttribute("data-theme","light");try{localStorage.setItem("kit-theme","light");}catch(e){}`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <PlaceProvider>
          <Suspense>
            <SiteHeader />
          </Suspense>
          <main>{children}</main>
          <SiteFooter />
          </PlaceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
