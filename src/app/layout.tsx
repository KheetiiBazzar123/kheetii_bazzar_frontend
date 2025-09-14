import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KheetiiBazaar - Connecting Farmers and Buyers',
  description: 'A marketplace platform connecting farmers and buyers with blockchain verification',
  keywords: ['marketplace', 'farmers', 'buyers', 'agriculture', 'blockchain', 'algorand'],
  authors: [{ name: 'KheetiiBazaar Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'KheetiiBazaar - Connecting Farmers and Buyers',
    description: 'A marketplace platform connecting farmers and buyers with blockchain verification',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KheetiiBazaar - Connecting Farmers and Buyers',
    description: 'A marketplace platform connecting farmers and buyers with blockchain verification',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <SocketProvider>
                {children}
              </SocketProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}