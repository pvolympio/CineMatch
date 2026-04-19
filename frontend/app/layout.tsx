import type { Metadata } from 'next';
import './globals.css';

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
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
