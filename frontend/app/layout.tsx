import type { Metadata } from 'next';
import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'CineMatch — Descubra Seu Cinema',
  description: 'Descubra filmes escondidos e entenda seu perfil cinematográfico.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#080810" />
      </head>
      <body className="antialiased">
        <Providers>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
