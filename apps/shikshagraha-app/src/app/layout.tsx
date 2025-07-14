import Head from 'next/head';

export const metadata = {
  title: 'Welcome to Shikshagraha',
  description: 'Welcome to Shikshalokam',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    // move themeColor here
    themeColor: '#000000',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <meta name="theme-color" content="#000000" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        ></meta>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </Head>
      <body>{children}</body>
    </html>
  );
}
