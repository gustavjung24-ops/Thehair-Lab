import {createClient} from 'https://esm.sh/@sanity/client@6.28.3'
import imageUrlBuilder from 'https://esm.sh/@sanity/image-url@1.0.2'

import {hasValidSanityConfig, SANITY_PUBLIC_CONFIG} from './sanityConfig.js'

const sanityClient = hasValidSanityConfig()
  ? createClient({
      projectId: SANITY_PUBLIC_CONFIG.projectId,
      dataset: SANITY_PUBLIC_CONFIG.dataset,
      apiVersion: SANITY_PUBLIC_CONFIG.apiVersion,
      useCdn: SANITY_PUBLIC_CONFIG.useCdn,
      perspective: 'published',
    })
  : null

const imageBuilder = sanityClient ? imageUrlBuilder(sanityClient) : null

export function getSanityClient() {
  return sanityClient
}

export function buildImageUrl(source, options = {}) {
  if (!imageBuilder || !source) {
    return ''
  }

  let image = imageBuilder.image(source).auto('format').fit('max')

  if (options.width) {
    image = image.width(options.width)
  }

  if (options.height) {
    image = image.height(options.height)
  }

  return image.url()
}
