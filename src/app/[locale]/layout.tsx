import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/lib/i18n/routing";
import { AppShell } from "@/components/layout/app-shell";
import { ServiceWorkerRegister } from "@/components/shared/sw-register";
import { OfflineBanner } from "@/components/shared/offline-banner";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <html lang={locale} className="h-full">
      <body className="h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ServiceWorkerRegister />
          <OfflineBanner />
          <AppShell>{children}</AppShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
