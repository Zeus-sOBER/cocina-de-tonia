/**
 * Format a number as currency (MXN by default)
 */
export function formatCurrency(
  amount: number,
  locale: string = "es-MX",
  currency: string = "MXN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date for display
 */
export function formatDate(
  date: Date | string,
  locale: string = "es-MX",
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    ...options,
  }).format(d);
}

/**
 * Format a time for display
 */
export function formatTime(
  time: string,
  locale: string = "es-MX"
): string {
  const [hours, minutes] = time.split(":");
  const d = new Date();
  d.setHours(parseInt(hours), parseInt(minutes));
  return new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
  }).format(d);
}

/**
 * Format a relative date (today, yesterday, or the actual date)
 */
export function formatRelativeDate(
  date: Date | string,
  locale: string = "es"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return locale === "es" ? "Hoy" : "Today";
  if (diffDays === 1) return locale === "es" ? "Ayer" : "Yesterday";
  return formatDate(d, locale === "es" ? "es-MX" : "en-US");
}
