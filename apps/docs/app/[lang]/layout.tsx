import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { Geist, JetBrains_Mono } from 'next/font/google';
import { i18nProvider } from 'fumadocs-ui/i18n';
import { i18n, translations } from '../../lib/i18n';
import '../global.css';

const geist = Geist({ variable: '--font-sans', subsets: ['latin'] });
const mono = JetBrains_Mono({ variable: '--font-mono', subsets: ['latin'] });

export const metadata = { title: 'Fumadocs Test Reports' };

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!i18n.languages.includes(lang as 'zh' | 'en')) notFound();
  return (
    <html
      lang={lang === 'zh' ? 'zh-CN' : lang}
      className={`${geist.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <RootProvider
          i18n={i18nProvider(translations, lang)}
          search={{ enabled: false }}
          theme={{ defaultTheme: 'light' }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
