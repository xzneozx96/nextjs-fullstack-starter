import type { Metadata } from 'next';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { routing } from '@/libs/i18nNavigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import '@/styles/global.css';

// Initialize Inter font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  // Using internationalization in Client Components
  const messages = await getMessages();

  // The `suppressHydrationWarning` attribute in <body> is used to prevent hydration errors caused by Sentry Overlay,
  // which dynamically adds a `style` attribute to the body tag.

  return (
    <html lang={locale} className={inter.variable}>
      <body suppressHydrationWarning className={`${inter.className} dark:bg-gray-900`}>
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
        >
          <PostHogProvider>
            <NextTopLoader height={5} color="#465fff" />
            <ThemeProvider>
              <SidebarProvider>
                {props.children}
              </SidebarProvider>
            </ThemeProvider>
          </PostHogProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
