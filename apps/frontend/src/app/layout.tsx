import './global.css';
import { Providers } from './providers';
import { env } from '@/config';

export const metadata = {
  title: `${env.APP_NAME} - Digital Certificate Platform`,
  description: 'Create, manage, and verify digital certificates with Quick Certify',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
