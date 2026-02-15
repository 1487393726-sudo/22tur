import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  const baseLocale = locale && ['zh', 'en', 'ug'].includes(locale)
    ? locale
    : 'zh';

  // Load all message namespaces for the locale
  const messages = {
    common: (await import(`../messages/${baseLocale}/common.json`)).default,
    about: (await import(`../messages/${baseLocale}/about.json`)).default,
    services: (await import(`../messages/${baseLocale}/services.json`)).default,
    contact: (await import(`../messages/${baseLocale}/contact.json`)).default,
    home: (await import(`../messages/${baseLocale}/home.json`)).default,
    blog: (await import(`../messages/${baseLocale}/blog.json`)).default,
    cases: (await import(`../messages/${baseLocale}/cases.json`)).default,
    partners: (await import(`../messages/${baseLocale}/partners.json`)).default,
    team: (await import(`../messages/${baseLocale}/team.json`)).default,
  };

  return {
    locale: baseLocale,
    messages
  };
});
