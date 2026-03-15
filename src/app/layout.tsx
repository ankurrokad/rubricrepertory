import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2D6A6A',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'RubricRepertory — Homeopathic Rubric & Remedy Reference',
  description:
    'A fast, comprehensive digital repertory for homeopathic practitioners and students — search rubrics, explore remedy grades, and navigate the complete rubric index.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RubricRepertory',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/assets/images/app_logo.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/images/app_logo.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#2D6A6A',
    'msapplication-TileImage': '/assets/images/app_logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}

        <script type="module" async src="https://quality-cdn.dhiwise.com/rocket-web.js?_cfg=https%3A%2F%2Frubricrepe2762back.dhiwise.co&_be=https%3A%2F%2Flocal-project.dhiwise.com&_v=0.1.18" />
        <script type="module" defer src="https://quality-cdn.dhiwise.com/rocket-shot.js?v=0.0.2" />
        <script type="module" defer src="https://quality-cdn.dhiwise.com/preview-collaborator.js?v=0.0.1" /></body>
    </html>
  );
}
