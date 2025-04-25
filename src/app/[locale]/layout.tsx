import type { Metadata } from 'next';
import { routing } from '@/core/config/i18nNavigation';
import { PostHogProvider } from '@/shared/components/analytics/PostHogProvider';
import { ToastProvider } from '@/shared/components/ui/toast/ToastContainer';
import { SidebarProvider } from '@/shared/contexts/SidebarContext';
import { ThemeProvider } from '@/shared/contexts/ThemeContext';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Lexend_Deca } from 'next/font/google';
import { notFound } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import '@/styles/global.css';

// Initialize Lexend Deca font
const lexendDeca = Lexend_Deca({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
  weight: ['400', '500', '600', '700'], // Common weights you might need
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
    <html lang={locale} className={lexendDeca.variable}>
      <body suppressHydrationWarning className={`${lexendDeca.className} dark:bg-gray-900`}>
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
        >
          <PostHogProvider>
            <NextTopLoader height={5} color="#465fff" />
            <ThemeProvider>
              <ToastProvider>
                <SidebarProvider>
                  {props.children}
                </SidebarProvider>
              </ToastProvider>
            </ThemeProvider>
          </PostHogProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
