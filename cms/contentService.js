import {getSanityClient} from './client.js'
import {fallbackContent} from './fallbackContent.js'
import {HOMEPAGE_QUERY} from './queries.js'

function mergeObject(source, fallback) {
  if (!source || typeof source !== 'object') {
    return {...fallback}
  }

  return {
    ...fallback,
    ...source,
  }
}

function mergeList(source, fallback) {
  if (!Array.isArray(source) || source.length === 0) {
    return [...fallback]
  }

  return source
}

export async function fetchHomepageData() {
  const client = getSanityClient()

  if (!client) {
    return {
      ...fallbackContent,
      _meta: {
        source: 'fallback',
        reason: 'missing-public-config',
      },
    }
  }

  try {
    const data = await client.fetch(HOMEPAGE_QUERY)

    return {
      siteSettings: mergeObject(data?.siteSettings, fallbackContent.siteSettings),
      homepageHero: mergeObject(data?.homepageHero, fallbackContent.homepageHero),
      trustPoints: mergeList(data?.trustPoints, fallbackContent.trustPoints),
      brands: mergeList(data?.brands, fallbackContent.brands),
      productCategories: mergeList(data?.productCategories, fallbackContent.productCategories),
      testimonials: mergeList(data?.testimonials, fallbackContent.testimonials),
      contactBlock: mergeObject(data?.contactBlock, fallbackContent.contactBlock),
      _meta: {
        source: 'sanity',
      },
    }
  } catch (_error) {
    return {
      ...fallbackContent,
      _meta: {
        source: 'fallback',
        reason: 'fetch-failed',
      },
    }
  }
}
