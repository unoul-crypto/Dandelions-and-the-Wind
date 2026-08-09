import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const manrope = Manrope({ variable: "--font-body", subsets: ["cyrillic", "latin"] });
const unbounded = Unbounded({ variable: "--font-display", subsets: ["cyrillic", "latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title: "Одуванчик и ветер — игра на клеточном поле",
    description: "Стратегическая игра для двух игроков за одним экраном.",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "Одуванчик и ветер",
      description: "Засейте всё поле раньше, чем ветер проверит восемь сторон света.",
      type: "website",
      images: [{ url: imageUrl, width: 1731, height: 909, alt: "Одуванчик и ветер — игра на клеточном поле" }],
    },
    twitter: { card: "summary_large_image", title: "Одуванчик и ветер", description: "Стратегическая игра на клеточном поле.", images: [imageUrl] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body className={`${manrope.variable} ${unbounded.variable}`}>{children}</body></html>;
}
