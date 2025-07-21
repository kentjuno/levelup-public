import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/components/theme-provider';

const ogImageUrl = 'https://placehold.co/1200x630.png';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1a1611',
};

export const metadata: Metadata = {
  title: 'LevelUp Life',
  description: 'Gamify your goals and level up your life.',
  openGraph: {
    title: 'LevelUp Life: Your Epic Adventure Awaits!',
    description: 'Stop dreaming, start doing. Turn your real-life goals into fun quests, battle weekly bosses with the community, and level up yourself!',
    url: 'https://leveluplife.app', // Replace with your actual domain
    siteName: 'LevelUp Life',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'An epic fantasy landscape representing a journey of self-improvement in LevelUp Life.',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LevelUp Life: Your Epic Adventure Awaits!',
    description: 'Stop dreaming, start doing. Turn your real-life goals into fun quests, battle weekly bosses with the community, and level up yourself!',
    images: [ogImageUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-3259856689887921" />
        <link rel="apple-touch-icon" href="/img/logos/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/img/logos/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/img/logos/favicon-16x16.png" />
        <link rel="shortcut icon" href="/img/logos/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lato:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
