import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { NavigationWrapper } from "@/components/navigation-wrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { FloatingEnquiryFab } from "@/components/floating-enquiry-fab";

export async function generateMetadata(): Promise<Metadata> {
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host") ?? "localhost:3000";
  const protocol = incomingHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = new URL(`${protocol}://${host}`);
  const title = "Bhraman Retreats | Heal Through the Five Elements";
  const description = "A cinematic five-element retreat in the Himalayas, rooted in nature, movement and stillness.";

  return {
    metadataBase: baseUrl,
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: new URL("/og-phase1.png", baseUrl).toString(), width: 1731, height: 909, alt: "A quiet Himalayan monastery at dawn for Bhraman Retreats" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [new URL("/og-phase1.png", baseUrl).toString()],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider />
        <NavigationWrapper />
        {children}
        <FloatingEnquiryFab />
      </body>
    </html>
  );
}
