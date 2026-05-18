const BRAND_NAME = 'AkorCenneti';
const DEFAULT_TITLE = `${BRAND_NAME} | Türkçe şarkı akorları`;
const DEFAULT_DESCRIPTION = 'Türkçe şarkı akorlarını bulun, kolay transpoze edin ve çalma moduyla pratik yapın.';

const upsertMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

const upsertCanonical = (url) => {
  let element = document.head.querySelector('link[rel="canonical"]');

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  element.setAttribute('href', url);
};

const upsertStructuredData = (structuredData) => {
  const selector = 'script[type="application/ld+json"][data-seo-structured-data="true"]';
  let element = document.head.querySelector(selector);

  if (!structuredData) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement('script');
    element.setAttribute('type', 'application/ld+json');
    element.setAttribute('data-seo-structured-data', 'true');
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(structuredData);
};

export const setPageSeo = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonicalPath = '/',
  ogType = 'website',
  structuredData,
}) => {
  const canonicalUrl = `${window.location.origin}${canonicalPath}`;

  document.title = title;
  upsertMeta('meta[name="description"]', { name: 'description', content: description });
  upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: BRAND_NAME });
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
  upsertMeta('meta[property="og:type"]', { property: 'og:type', content: ogType });
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary' });
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
  upsertCanonical(canonicalUrl);
  upsertStructuredData(structuredData);
};

export { BRAND_NAME };
