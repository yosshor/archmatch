import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ArchMatch | Software Architecture Groups',
  description: 'Student Project Group Matching Platform for Software Architecture Class',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
