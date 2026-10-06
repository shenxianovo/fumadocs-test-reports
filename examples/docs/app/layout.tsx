import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';
import './global.css';

export const metadata = { title: 'Fumadocs Test Reports' };

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <RootProvider search={{ enabled: false }} theme={{ defaultTheme: 'light' }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
