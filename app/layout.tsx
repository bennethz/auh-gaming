import type { Metadata } from "next";
import { Chakra_Petch, Teko } from "next/font/google";
import "./globals.css";

/**
 * The app is static for now: every route must be fully prerendered.
 * The build fails if a page starts rendering per request.
 */
export const ensureStatic = "navigation";

const teko = Teko({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-teko",
  display: "swap",
});

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-chakra",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AUH Gaming",
    template: "%s | AUH Gaming",
  },
  description: "AUH Gaming: esports team and gaming community in the MENA region. Home of the Civil War league.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${teko.variable} ${chakraPetch.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-auh-yellow bg-stripes font-body text-auh-ink antialiased">
        {children}
      </body>
    </html>
  );
}
