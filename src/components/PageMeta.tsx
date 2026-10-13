import React from 'react';
import Head from 'expo-router/head';
import { PUBLIC_SITE_URL } from '../constants/site';

export function PageMeta({
  title,
  description,
  path,
  noIndex = false,
  structuredData,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown>;
}) {
  const canonical = `${PUBLIC_SITE_URL}${path === '/' ? '' : path}`;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noIndex || process.env.EXPO_PUBLIC_REVIEW_BUILD === 'true' ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
    {structuredData && <script type="application/ld+json">{JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script>}
    </Head>
  );
}
