import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'atozfamily planner',
  description: 'The Whitford homeschool operations center',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#FAF6EF',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
