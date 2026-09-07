import type { Metadata } from "next";
import { Suspense } from "react";
import { Fragment_Mono, IBM_Plex_Sans_KR } from "next/font/google";
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
  weight: "400",
  subsets: ["latin"],
  variable: "--font-plex",
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
  title: "KIT — Entity io",
  description:
    "KIT by Entity io. The next generation of enterprise planning. Predict the entity. Approve the path. Let the system carry the rest.",
  metadataBase: new URL("https://entityintelligence.io"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-AU"
      data-theme="dark"
      suppressHydrationWarning
      className={`${fragment.variable} ${plex.variable} ${cy.variable} ${formaDisplay.variable} ${formaMicro.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("kit-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}`,
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
