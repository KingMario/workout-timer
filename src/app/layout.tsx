import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  'https://example.com';

export const metadata: Metadata = {
  title: '灵动健身 - Mario Studio',
  description: 'FlexWorkout 健身计时器 — 简单、可定制的间歇训练计时器',
  keywords: ['健身', '计时器', 'HIIT', '间歇训练', 'Workout Timer'],
  authors: [{ name: 'Mario' }],
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: '灵动健身 - FlexWorkout 计时器',
    description: '简单、可定制的健身计时器，支持间歇训练和自定义计划。',
    url: siteUrl,
    siteName: '灵动健身',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '灵动健身 - 健身计时器',
      },
    ],
    locale: 'zh-CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '灵动健身 - FlexWorkout 计时器',
    description: '简单、可定制的健身计时器',
    images: [`${siteUrl}/og-image.png`],
    creator: '@Mario',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteUrl,
    name: '灵动健身',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="zh">
      <head>
        <link rel="canonical" href={siteUrl} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
