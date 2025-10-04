'use client'

import Head from 'next/head'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
  twitterCard?: 'summary' | 'summary_large_image'
  canonical?: string
  noindex?: boolean
  nofollow?: boolean
}

export function SEOHead({
  title = 'Pinebi Report - Gelişmiş Raporlama ve Analiz Sistemi',
  description = 'Modern ERP raporlama sistemi ile işletmenizin verilerini analiz edin, raporlar oluşturun ve kararlarınızı veriye dayalı alın.',
  keywords = 'raporlama, analiz, ERP, iş zekası, dashboard, veri analizi, rapor, Pinebi',
  ogTitle,
  ogDescription,
  ogImage = '/og-image.jpg',
  ogUrl,
  twitterCard = 'summary_large_image',
  canonical,
  noindex = false,
  nofollow = false
}: SEOHeadProps) {
  const fullTitle = title.includes('Pinebi Report') ? title : `${title} | Pinebi Report`
  const fullOgTitle = ogTitle || fullTitle
  const fullOgDescription = ogDescription || description
  const fullOgUrl = ogUrl || (typeof window !== 'undefined' ? window.location.href : '')

  const robotsContent = []
  if (noindex) robotsContent.push('noindex')
  if (nofollow) robotsContent.push('nofollow')
  if (robotsContent.length === 0) robotsContent.push('index', 'follow')

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robotsContent.join(', ')} />
      <meta name="author" content="Pinebi Report" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullOgTitle} />
      <meta property="og:description" content={fullOgDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={fullOgUrl} />
      <meta property="og:site_name" content="Pinebi Report" />
      <meta property="og:locale" content="tr_TR" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullOgTitle} />
      <meta name="twitter:description" content={fullOgDescription} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional SEO */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Pinebi Report" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Pinebi Report",
            "description": description,
            "url": fullOgUrl,
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "TRY"
            },
            "author": {
              "@type": "Organization",
              "name": "Pinebi"
            }
          })
        }}
      />
    </Head>
  )
}



