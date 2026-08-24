import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { NavigationWrapper } from "@/components/navigation-wrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { FloatingEnquiryFab } from "@/components/floating-enquiry-fab";
import { SiteFooter } from "@/components/site-footer";
import { OrganizationSchema } from "@/lib/schema-org";

export async function generateMetadata(): Promise<Metadata> {
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host") ?? "localhost:3000";
  const protocol = incomingHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = new URL(`${protocol}://${host}`);
  const title = "Bhraman Retreats | Five Elements Himalayan Sanctuary · Ladakh";
  const description =
    "An intimate 5-day doctor-led elemental healing sanctuary in Ladakh curated by Dr. Pratiksha Shekhawat. Ground in Prithvi, flow with Jala, transform with Agni, breathe with Vāyu, and rest in Ākāśa. Strictly 12 travellers.";

  return {
    metadataBase: baseUrl,
    title: {
      default: title,
      template: "%s | Bhraman Retreats",
    },
    description,
    keywords: [
      "Ladakh yoga retreat",
      "Himalayan wellness retreat 2026",
      "Dr Pratiksha Shekhawat",
      "Elemental therapy",
      "Panch Mahabhuta healing",
      "Lamayuru monastery retreat",
      "Luxury meditation retreat India",
      "Doctor led wellness retreat",
      "High altitude healing Ladakh",
      "Sattvic retreat Himalayas",
    ],
    authors: [{ name: "Dr. Pratiksha Shekhawat", url: `${baseUrl.toString()}#philosophy` }],
    creator: "Dr. Pratiksha Shekhawat",
    publisher: "Bhraman Retreats",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title,
      description,
      url: baseUrl.toString(),
      siteName: "Bhraman Retreats",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: new URL("/hero-yoga-lamayuru.jpg", baseUrl).toString(),
          width: 1920,
          height: 1080,
          alt: "Dr. Pratiksha Shekhawat guiding yoga in Lamayuru, Ladakh — Bhraman Retreats",
        },
        {
          url: new URL("/og-phase1.png", baseUrl).toString(),
          width: 1731,
          height: 909,
          alt: "A quiet Himalayan monastery at dawn for Bhraman Retreats",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [new URL("/hero-yoga-lamayuru.jpg", baseUrl).toString()],
      creator: "@bhramanretreats",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host") ?? "localhost:3000";
  const protocol = incomingHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;

  return (
    <html lang="en">
      <head>
        <OrganizationSchema baseUrl={baseUrl} />
      </head>
      <body>
        <ThemeProvider />
        <NavigationWrapper />
        {children}
        <SiteFooter />
        <FloatingEnquiryFab />
      </body>
    </html>
  );
}
