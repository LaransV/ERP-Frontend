import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/layout/Providers';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: { template: '%s · NexERP', default: 'NexERP — Unified Business Platform' },
  description: 'Finance · HR · Inventory · CRM — One integrated system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                fontFamily: 'Outfit, sans-serif',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
