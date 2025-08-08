import Head from 'next/head';

export const metadata = {
  title: 'Welcome to Shikshagraha',
  description: 'Welcome to Shikshalokam',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
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
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            /* Prevent iOS Safari zoom on input focus */
            input, select, textarea {
              font-size: 12px !important;
              transform: translateZ(0);
              -webkit-transform: translateZ(0);
            }
            
            /* Prevent viewport resizing on iOS */
            body {
              -webkit-text-size-adjust: 100%;
              -webkit-tap-highlight-color: transparent;
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              user-select: none;
            }
            
            /* Allow text selection in form fields */
            input, textarea, select {
              -webkit-user-select: text;
              user-select: text;
            }
            
            /* Prevent iOS Safari from zooming on focus */
            @media screen and (-webkit-min-device-pixel-ratio: 0) {
              select,
              textarea,
              input {
                font-size: 12px !important;
              }
            }
            
            /* Additional iOS Safari fixes */
            * {
              -webkit-tap-highlight-color: transparent;
            }
            
            /* Prevent zoom on input focus for iOS */
            input[type="text"],
            input[type="email"],
            input[type="password"],
            input[type="number"],
            input[type="tel"],
            input[type="url"],
            textarea,
            select {
              font-size: 12px !important;
              -webkit-appearance: none;
              border-radius: 0;
            }
          `,
          }}
        />
      </Head>
      <body>{children}</body>
    </html>
  );
}
