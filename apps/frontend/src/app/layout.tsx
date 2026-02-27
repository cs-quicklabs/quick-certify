import './global.css';
import { Metadata } from 'next';
import { Providers } from './providers';
import { env } from '@/config';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: `${env.APP_NAME} - Digital Certificate Platform`,
  description: 'Create, manage, and verify digital certificates with Quick Certify',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} light`}
      style={{ colorScheme: 'light' }}
      suppressHydrationWarning
    >
      <body className="ui-sans-serif,system-ui,sans-serif" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
