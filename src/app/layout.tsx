import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Baykery - Panadería Artesanal en Lima, Perú',
  description: 'Panadería artesanal con productos frescos y deliciosos. Ordena para entrega los fines de semana en Lima.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    url: '/',
    siteName: 'Baykery',
    title: 'Baykery - Panadería Artesanal',
    description: 'Panadería artesanal con productos frescos y deliciosos.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Baykery - Panadería Artesanal',
    description: 'Panadería artesanal con productos frescos y deliciosos.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-PE" suppressHydrationWarning>
      <body className={cn(inter.variable, playfair.variable, 'antialiased')}>
        {children}
      </body>
    </html>
  );
}
