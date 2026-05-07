import {buildImageUrl} from './cms/client.js'
import {fetchHomepageData} from './cms/contentService.js'

document.documentElement.classList.add('js-enabled')

const APP_STATE = {
  brandName: 'The Hair Lab',
  contact: {
    phone: '0907.489.278',
    email: 'thehairlab.info@gmail.com',
    zaloLink: 'https://zalo.me/0907489278',
    whatsappLink: '',
    address: 'Tân Hưng Thuận - Quận 12 - Hồ Chí Minh',
    businessHours: 'Hỗ trợ qua hotline và Zalo',
    facebookLink: 'https://www.facebook.com/alphatravn',
    instagramLink: '',
  },
  lead: {
    // Configure these endpoints in window.THEHAIRLAB_CONFIG.lead for production.
    telegramEndpoint: '',
    sheetEndpoint: '',
    requestMode: 'cors',
    webhookEnabled: false,
    webhookEndpoint: '',
    webhookMethod: 'POST',
  },
}

const DEFAULT_CAPABILITIES = [
  {
    title: 'Tư vấn danh mục theo mô hình',
    description: 'Đề xuất nhóm sản phẩm theo vốn nhập, tệp khách và mục tiêu doanh thu.',
  },
  {
    title: 'Hỗ trợ triển khai tại điểm bán',
    description: 'Tài liệu và hướng dẫn ngắn giúp đội ngũ bán hàng tư vấn nhanh hơn.',
  },
  {
    title: 'Đồng hành sau bán',
    description: 'Theo dõi hiệu quả nhóm hàng để tối ưu vòng nhập tiếp theo.',
  },
  {
    title: 'Phản hồi theo khu vực',
    description: 'Ưu tiên hỗ trợ nhanh để giảm gián đoạn vận hành cho đối tác.',
  },
]

const PRODUCT_SHOWCASE_ITEMS = [
  {
    title: 'Argan Oil 50ml',
    summary: 'Dầu dưỡng dễ upsell tại quầy cho nhóm tóc khô xơ sau tạo kiểu.',
    image: 'Argan_oil_50ml.jpg',
    segment: 'recovery',
  },
  {
    title: 'Keratine Mask 1500ml & 500ml',
    summary: 'Triển khai tốt mô hình dịch vụ tại salon kết hợp sản phẩm mang về.',
    image: 'Keratine_Mask_1500ml_&500ml.jpg',
    segment: 'recovery',
  },
  {
    title: 'Thuốc nhuộm 100ml',
    summary: 'Dễ kiểm soát định mức cho từng ca, phù hợp salon chuyên màu.',
    image: 'Nhuom_100ml.jpg',
    segment: 'color',
  },
  {
    title: 'Oxy trợ nhuộm',
    summary: 'Giúp quy trình nhuộm đồng bộ và giảm sai lệch kỹ thuật.',
    image: 'Oxy_TroNhuom.jpg',
    segment: 'color',
  },
  {
    title: 'Gội can 3800ml',
    summary: 'Tối ưu cost cho salon có tần suất dịch vụ cao mỗi ngày.',
    image: 'Goi_Can_3800ml.jpg',
    segment: 'care',
  },
  {
    title: 'Xả can 3800ml',
    summary: 'Kết hợp gội can để chuẩn hóa trải nghiệm dịch vụ tại ghế.',
    image: 'Xa_Can_3800ml.jpg',
    segment: 'care',
  },
  {
    title: 'Bộ gội xả 500ml',
    summary: 'SKU bán lẻ tốt cho nhóm khách duy trì chăm sóc tóc tại nhà.',
    image: 'Goi_Xa_500ml.jpg',
    segment: 'care',
  },
  {
    title: 'Dập uốn duỗi',
    summary: 'Nhóm kỹ thuật dành cho salon cần mở rộng dịch vụ chuyên sâu.',
    image: 'Dap_Uon_Duoi.jpg',
    segment: 'technical',
  },
  {
    title: 'Ép side tóc nam',
    summary: 'Bổ sung lựa chọn dịch vụ cho barbershop và salon nam.',
    image: 'Ep_Side_Toc_Nam.jpg',
    segment: 'technical',
  },
]

function isTodoValue(value) {
  return typeof value === 'string' && value.includes('TODO_REPLACE')
}

function hasUsableValue(value) {
  return typeof value === 'string' && value.trim() !== '' && !isTodoValue(value)
}

function ensureArray(value) {
  return Array.isArray(value) ? value : []
}

function applyRuntimeConfig() {
  const runtimeConfig = window.THEHAIRLAB_CONFIG

  if (!runtimeConfig || typeof runtimeConfig !== 'object') {
    return
  }

  const contact = runtimeConfig.contact || {}
  const lead = runtimeConfig.lead || {}

  if (hasUsableValue(contact.phone)) {
    APP_STATE.contact.phone = contact.phone.trim()
  }

  if (hasUsableValue(contact.email)) {
    APP_STATE.contact.email = contact.email.trim()
  }

  if (hasUsableValue(contact.zaloLink)) {
    APP_STATE.contact.zaloLink = contact.zaloLink.trim()
  }

  if (hasUsableValue(lead.telegramEndpoint)) {
    APP_STATE.lead.telegramEndpoint = lead.telegramEndpoint.trim()
  }

  if (hasUsableValue(lead.sheetEndpoint)) {
    APP_STATE.lead.sheetEndpoint = lead.sheetEndpoint.trim()
  }

  if (lead.requestMode === 'no-cors' || lead.requestMode === 'cors') {
    APP_STATE.lead.requestMode = lead.requestMode
  }

  if (typeof lead.webhookEnabled === 'boolean') {
    APP_STATE.lead.webhookEnabled = lead.webhookEnabled
  }

  if (hasUsableValue(lead.webhookEndpoint)) {
    APP_STATE.lead.webhookEndpoint = lead.webhookEndpoint.trim()
  }

  if (hasUsableValue(lead.webhookMethod)) {
    APP_STATE.lead.webhookMethod = lead.webhookMethod.trim().toUpperCase()
  }
}

function createNode(tagName, className, textValue) {
  const node = document.createElement(tagName)

  if (className) {
    node.className = className
  }

  if (typeof textValue === 'string') {
    node.textContent = textValue
  }

  return node
}

function appendQuery(baseUrl, key, value) {
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}${key}=${encodeURIComponent(value)}`
}

function normalizeLegacyAnchor(url) {
  if (!hasUsableValue(url)) {
    return 'lien-he.html#bao-gia-form'
  }

  const normalized = url.trim()

  if (normalized === '#lead') {
    return 'lien-he.html#bao-gia-form'
  }

  if (normalized === '#contact') {
    return 'lien-he.html#thong-tin-lien-he'
  }

  if (normalized === '#top') {
    return 'index.html#top'
  }

  return normalized
}

function makeAbsoluteOrAnchorUrl(url, fallback = 'lien-he.html#bao-gia-form') {
  if (!hasUsableValue(url)) {
    return fallback
  }

  return normalizeLegacyAnchor(url)
}

function buildLeadIntentUrl(interest) {
  if (!hasUsableValue(interest)) {
    return 'lien-he.html#bao-gia-form'
  }

  return `lien-he.html?interest=${encodeURIComponent(interest)}#bao-gia-form`
}

function normalizeRating(value) {
  const numeric = Number(value)

  if (!Number.isFinite(numeric)) {
    return 5
  }

  return Math.min(5, Math.max(1, Math.round(numeric)))
}

function buildRatingText(value) {
  const rating = normalizeRating(value)
  return `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)`
}

function applySiteSettings(siteSettings) {
  if (!siteSettings || typeof siteSettings !== 'object') {
    return
  }

  if (hasUsableValue(siteSettings.hotline)) {
    APP_STATE.contact.phone = siteSettings.hotline.trim()
  }

  if (hasUsableValue(siteSettings.email)) {
    APP_STATE.contact.email = siteSettings.email.trim()
  }

  if (hasUsableValue(siteSettings.zaloLink)) {
    APP_STATE.contact.zaloLink = siteSettings.zaloLink.trim()
  }

  if (hasUsableValue(siteSettings.address)) {
    APP_STATE.contact.address = siteSettings.address.trim()
  }

  if (hasUsableValue(siteSettings.businessHours)) {
    APP_STATE.contact.businessHours = siteSettings.businessHours.trim()
  }

  if (hasUsableValue(siteSettings.siteTitle)) {
    const parsedBrandName = siteSettings.siteTitle.split('|')[0].trim()

    if (parsedBrandName) {
      APP_STATE.brandName = parsedBrandName
    }
  }
}

function renderSiteMeta(siteSettings) {
  const pageTitle = document.body?.dataset?.pageTitle || ''
  const fallbackTitle = `${APP_STATE.brandName} | Sản phẩm tóc chuyên nghiệp cho salon`

  if (hasUsableValue(pageTitle) && pageTitle !== 'Trang chủ') {
    document.title = `${APP_STATE.brandName} | ${pageTitle}`
  } else if (hasUsableValue(siteSettings?.siteTitle)) {
    document.title = siteSettings.siteTitle
  } else {
    document.title = fallbackTitle
  }

  const metaNode = document.getElementById('site-description-meta')
  if (metaNode && hasUsableValue(siteSettings?.siteDescription)) {
    metaNode.setAttribute('content', siteSettings.siteDescription)
  }

  const brandNodes = document.querySelectorAll('[data-site-title="brand"]')
  brandNodes.forEach((node) => {
    node.textContent = APP_STATE.brandName
  })
}

function setCtaLink(node, label, url) {
  if (!node) {
    return
  }

  if (hasUsableValue(label)) {
    node.textContent = label
  }

  const href = makeAbsoluteOrAnchorUrl(url, 'lien-he.html#bao-gia-form')
  node.setAttribute('href', href)

  if (/^https?:\/\//i.test(href)) {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener')
  } else {
    node.removeAttribute('target')
    node.removeAttribute('rel')
  }
}

function renderHero(hero) {
  if (!hero || typeof hero !== 'object') {
    return
  }

  const eyebrowNode = document.querySelector('[data-hero="eyebrow"]')
  const titleNode = document.querySelector('[data-hero="title"]')
  const subtitleNode = document.querySelector('[data-hero="subtitle"]')

  if (eyebrowNode && hasUsableValue(hero.eyebrow)) {
    eyebrowNode.textContent = hero.eyebrow
  }

  if (titleNode && hasUsableValue(hero.title)) {
    titleNode.textContent = hero.title
  }

  if (subtitleNode && hasUsableValue(hero.subtitle)) {
    subtitleNode.textContent = hero.subtitle
  }

  const primaryCtaNode = document.getElementById('hero-primary-cta')
  const secondaryCtaNode = document.getElementById('hero-secondary-cta')

  setCtaLink(primaryCtaNode, hero.primaryCtaLabel, hero.primaryCtaUrl)
  setCtaLink(secondaryCtaNode, hero.secondaryCtaLabel, hero.secondaryCtaUrl)

  const heroImageWrap = document.getElementById('hero-image-wrap')
  const heroImageNode = document.getElementById('hero-image')
  const heroFallbackCollage = document.getElementById('hero-fallback-collage')

  if (!heroImageWrap || !heroImageNode) {
    return
  }

  const imageUrl = buildImageUrl(hero.heroImage, {width: 1440, height: 820})

  if (!imageUrl) {
    heroImageWrap.hidden = true
    heroImageNode.removeAttribute('src')
    if (heroFallbackCollage) {
      heroFallbackCollage.hidden = false
    }
    return
  }

  heroImageWrap.hidden = false
  if (heroFallbackCollage) {
    heroFallbackCollage.hidden = true
  }
  heroImageNode.src = imageUrl
  heroImageNode.alt = hasUsableValue(hero.title) ? hero.title : APP_STATE.brandName
}

function renderTrustStrip(trustPoints) {
  const trustStripGrid = document.getElementById('trust-strip-grid')

  if (!trustStripGrid) {
    return
  }

  trustStripGrid.innerHTML = ''

  trustPoints.forEach((item) => {
    const title = hasUsableValue(item?.title) ? item.title : 'Đang cập nhật'
    const description = hasUsableValue(item?.description) ? item.description : title
    const badgeText = description.length > 40 ? title : description

    trustStripGrid.appendChild(createNode('p', '', badgeText))
  })
}

function createCategoryCard(category, options = {}) {
  const {compact = false, cssClass = ''} = options
  const article = createNode('article', `service-card reveal ${cssClass}`.trim())

  const coverImageUrl = buildImageUrl(category.coverImage, {width: 960, height: 640})
  if (coverImageUrl) {
    const coverWrap = createNode('div', 'service-cover')
    const coverImage = createNode('img', '', '')
    coverImage.src = coverImageUrl
    coverImage.loading = 'lazy'
    coverImage.alt = hasUsableValue(category.name) ? category.name : 'Ảnh nhóm sản phẩm'
    coverWrap.appendChild(coverImage)
    article.appendChild(coverWrap)
  }

  const categoryName = hasUsableValue(category.name) ? category.name : 'Nhóm sản phẩm'
  article.appendChild(createNode('h3', '', categoryName))

  const targetCustomer = hasUsableValue(category.targetCustomer)
    ? category.targetCustomer
    : 'Salon, spa và đại lý cần danh mục ổn định.'

  const keyBenefit = hasUsableValue(category.keyBenefit)
    ? category.keyBenefit
    : 'Tối ưu hiệu quả kinh doanh từ danh mục phù hợp.'

  article.appendChild(createNode('p', 'service-for', `Phù hợp: ${targetCustomer}`))
  article.appendChild(createNode('p', 'service-result', `Lợi ích nổi bật: ${keyBenefit}`))

  if (!compact) {
    const metaList = createNode('ul', 'service-meta')
    metaList.appendChild(
      createNode(
        'li',
        '',
        `Mô tả: ${hasUsableValue(category.shortDescription) ? category.shortDescription : 'Đang cập nhật nội dung mô tả.'}`
      )
    )
    metaList.appendChild(createNode('li', '', `Đối tác mục tiêu: ${targetCustomer}`))
    article.appendChild(metaList)
  }

  const action = createNode('a', 'btn btn-soft service-cta-link', compact ? 'Xem chi tiết và nhận giá' : 'Nhận báo giá nhóm này')
  action.href = buildLeadIntentUrl(categoryName)
  article.appendChild(action)

  return article
}

function createBrandCard(brand, categoryNames, options = {}) {
  const {compact = false, cssClass = ''} = options
  const article = createNode('article', `brand-card reveal ${cssClass}`.trim())

  const logoUrl = buildImageUrl(brand.logo, {width: 480, height: 220})
  if (logoUrl) {
    const logoWrap = createNode('div', 'brand-logo-wrap')
    const logoImage = createNode('img', '', '')
    logoImage.src = logoUrl
    logoImage.alt = hasUsableValue(brand.name) ? `${brand.name} logo` : 'Brand logo'
    logoImage.loading = 'lazy'
    logoWrap.appendChild(logoImage)
    article.appendChild(logoWrap)
  }

  const brandName = hasUsableValue(brand.name) ? brand.name : 'Thương hiệu'
  article.appendChild(createNode('h3', '', brandName))
  article.appendChild(
    createNode(
      'p',
      '',
      hasUsableValue(brand.shortDescription) ? brand.shortDescription : 'Nội dung mô tả thương hiệu sẽ được cập nhật sớm.'
    )
  )

  if (!compact && categoryNames.length) {
    article.appendChild(createNode('p', 'brand-primary-products', `Sản phẩm chính: ${categoryNames.slice(0, 3).join(' · ')}`))
  }

  const actions = createNode('div', 'card-actions')
  const detailsLink = createNode('a', 'btn btn-outline btn-small', 'Xem dòng sản phẩm')
  detailsLink.href = 'san-pham.html'

  const consultLink = createNode('a', 'btn btn-primary btn-small', 'Yêu cầu tư vấn')
  consultLink.href = buildLeadIntentUrl(brandName)

  actions.appendChild(detailsLink)
  actions.appendChild(consultLink)
  article.appendChild(actions)

  return article
}

function createReviewCard(item) {
  const reviewCard = createNode('article', 'review-card reveal')
  reviewCard.appendChild(
    createNode('span', 'review-tag', hasUsableValue(item.customerType) ? item.customerType : 'Đối tác The Hair Lab')
  )

  const quote = hasUsableValue(item.quote) ? item.quote : 'Nội dung phản hồi sẽ được cập nhật sớm.'
  reviewCard.appendChild(createNode('p', '', `"${quote}"`))
  reviewCard.appendChild(createNode('p', 'review-rating', buildRatingText(item.rating)))

  const customerName = hasUsableValue(item.customerName) ? item.customerName : 'Khách hàng doanh nghiệp'
  reviewCard.appendChild(createNode('p', 'review-author', customerName))

  return reviewCard
}

function categorySegmentFromName(name) {
  const lowerName = String(name || '').toLowerCase()

  if (/nhuộm|màu/.test(lowerName)) {
    return 'color'
  }

  if (/phục hồi|dưỡng|keratin/.test(lowerName)) {
    return 'recovery'
  }

  if (/kỹ thuật|uốn|duỗi|chuyên salon/.test(lowerName)) {
    return 'technical'
  }

  return 'care'
}

function renderHomePage(content) {
  const trustPoints = ensureArray(content?.trustPoints)
  const brands = ensureArray(content?.brands)
  const categories = ensureArray(content?.productCategories)
  const testimonials = ensureArray(content?.testimonials)
  const hero = content?.homepageHero || {}

  renderHero(hero)
  renderTrustStrip(trustPoints)

  const whyGrid = document.getElementById('home-why-grid')
  if (whyGrid) {
    whyGrid.innerHTML = ''
    trustPoints.slice(0, 4).forEach((item) => {
      const card = createNode('article', 'about-card reveal')
      card.appendChild(createNode('h3', '', hasUsableValue(item.title) ? item.title : 'Năng lực hỗ trợ'))
      card.appendChild(
        createNode(
          'p',
          '',
          hasUsableValue(item.description)
            ? item.description
            : 'Nội dung năng lực hỗ trợ sẽ được cập nhật trong CMS.'
        )
      )
      whyGrid.appendChild(card)
    })
  }

  const brandGrid = document.getElementById('home-brand-grid')
  if (brandGrid) {
    brandGrid.innerHTML = ''
    const categoryNames = categories.map((item) => item.name).filter((item) => hasUsableValue(item))

    brands.slice(0, 3).forEach((brand) => {
      brandGrid.appendChild(createBrandCard(brand, categoryNames, {compact: true}))
    })
  }

  const categoryGrid = document.getElementById('home-category-grid')
  if (categoryGrid) {
    categoryGrid.innerHTML = ''

    categories.slice(0, 4).forEach((category) => {
      categoryGrid.appendChild(createCategoryCard(category, {compact: true}))
    })
  }

  const capabilityGrid = document.getElementById('home-capability-grid')
  if (capabilityGrid) {
    capabilityGrid.innerHTML = ''

    DEFAULT_CAPABILITIES.forEach((item) => {
      const card = createNode('article', 'team-card reveal')
      card.appendChild(createNode('h3', '', item.title))
      card.appendChild(createNode('p', '', item.description))
      capabilityGrid.appendChild(card)
    })
  }

  const testimonialGrid = document.getElementById('home-testimonial-grid')
  if (testimonialGrid) {
    testimonialGrid.innerHTML = ''

    testimonials.slice(0, 2).forEach((item) => {
      testimonialGrid.appendChild(createReviewCard(item))
    })
  }
}

function renderBrandsPage(content) {
  const brandGrid = document.getElementById('brand-page-grid')

  if (!brandGrid) {
    return
  }

  const brands = ensureArray(content?.brands)
  const categories = ensureArray(content?.productCategories)
  const categoryNames = categories.map((item) => item.name).filter((item) => hasUsableValue(item))

  brandGrid.innerHTML = ''

  brands.forEach((brand) => {
    brandGrid.appendChild(createBrandCard(brand, categoryNames, {compact: false, cssClass: 'brand-page-card'}))
  })
}

function renderProductsPage(content) {
  const filterBar = document.getElementById('product-filter-bar')
  const categoryGrid = document.getElementById('product-category-grid')
  const showcaseGrid = document.getElementById('product-showcase-grid')

  if (!filterBar || !categoryGrid || !showcaseGrid) {
    return
  }

  const categories = ensureArray(content?.productCategories)

  filterBar.innerHTML = ''
  categoryGrid.innerHTML = ''
  showcaseGrid.innerHTML = ''

  const filterOptions = [
    {
      key: 'all',
      label: 'Tất cả nhóm',
      segment: 'all',
    },
  ]

  categories.forEach((category, index) => {
    const key = hasUsableValue(category?._id) ? category._id : `category-${index + 1}`
    const segment = categorySegmentFromName(category?.name)
    filterOptions.push({
      key,
      label: hasUsableValue(category?.name) ? category.name : `Nhóm ${index + 1}`,
      segment,
    })

    const card = createCategoryCard(category, {compact: false, cssClass: 'product-category-card'})
    card.dataset.filterKey = key
    card.dataset.segment = segment
    categoryGrid.appendChild(card)
  })

  PRODUCT_SHOWCASE_ITEMS.forEach((item) => {
    const card = createNode('article', 'product-showcase-card reveal')
    card.dataset.segment = item.segment

    const imageWrap = createNode('div', 'product-showcase-image')
    const image = createNode('img', '', '')
    image.src = item.image
    image.alt = item.title
    image.loading = 'lazy'
    imageWrap.appendChild(image)

    const body = createNode('div', 'product-showcase-body')
    body.appendChild(createNode('h3', '', item.title))
    body.appendChild(createNode('p', '', item.summary))

    const action = createNode('a', 'btn btn-outline btn-small', 'Nhận tư vấn SKU này')
    action.href = buildLeadIntentUrl(item.title)
    body.appendChild(action)

    card.appendChild(imageWrap)
    card.appendChild(body)
    showcaseGrid.appendChild(card)
  })

  filterOptions.forEach((option, index) => {
    const button = createNode('button', 'filter-chip', option.label)
    button.type = 'button'
    button.dataset.filterKey = option.key
    button.dataset.segment = option.segment
    button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false')
    filterBar.appendChild(button)
  })

  const applyFilter = (activeKey) => {
    const selectedOption = filterOptions.find((item) => item.key === activeKey) || filterOptions[0]
    const activeSegment = selectedOption.segment

    Array.from(categoryGrid.children).forEach((card) => {
      if (!(card instanceof HTMLElement)) {
        return
      }

      card.hidden = activeKey !== 'all' && card.dataset.filterKey !== activeKey
    })

    Array.from(showcaseGrid.children).forEach((card) => {
      if (!(card instanceof HTMLElement)) {
        return
      }

      card.hidden = activeSegment !== 'all' && card.dataset.segment !== activeSegment
    })

    filterBar.querySelectorAll('.filter-chip').forEach((button) => {
      const isActive = button.getAttribute('data-filter-key') === activeKey
      button.classList.toggle('is-active', isActive)
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false')
    })
  }

  filterBar.querySelectorAll('.filter-chip').forEach((button) => {
    button.addEventListener('click', () => {
      const activeKey = button.getAttribute('data-filter-key') || 'all'
      applyFilter(activeKey)
    })
  })

  applyFilter('all')
}

function renderAboutPage(content) {
  const trustGrid = document.getElementById('about-trust-grid')

  if (!trustGrid) {
    return
  }

  const trustPoints = ensureArray(content?.trustPoints)
  trustGrid.innerHTML = ''

  trustPoints.forEach((item) => {
    const card = createNode('article', 'info-card reveal')
    card.appendChild(createNode('h3', '', hasUsableValue(item.title) ? item.title : 'Năng lực hỗ trợ'))
    card.appendChild(
      createNode(
        'p',
        '',
        hasUsableValue(item.description)
          ? item.description
          : 'Nội dung năng lực hỗ trợ sẽ được cập nhật trong CMS.'
      )
    )
    trustGrid.appendChild(card)
  })
}

function renderContactBlock(contactBlock) {
  const titleNode = document.querySelector('[data-contact-block="title"]')
  const descriptionNode = document.querySelector('[data-contact-block="description"]')
  const ctaNode = document.querySelector('[data-contact-block="ctaLink"]')

  if (titleNode && hasUsableValue(contactBlock?.title)) {
    titleNode.textContent = contactBlock.title
  }

  if (descriptionNode && hasUsableValue(contactBlock?.description)) {
    descriptionNode.textContent = contactBlock.description
  }

  if (!ctaNode) {
    return
  }

  const ctaLabel = hasUsableValue(contactBlock?.ctaLabel) ? contactBlock.ctaLabel : 'Nhận tư vấn ngay'
  const ctaUrl = makeAbsoluteOrAnchorUrl(contactBlock?.ctaUrl, 'lien-he.html#bao-gia-form')

  ctaNode.textContent = ctaLabel
  ctaNode.setAttribute('href', ctaUrl)

  if (/^https?:\/\//i.test(ctaUrl)) {
    ctaNode.setAttribute('target', '_blank')
    ctaNode.setAttribute('rel', 'noopener')
  } else {
    ctaNode.removeAttribute('target')
    ctaNode.removeAttribute('rel')
  }
}

function renderByPage(pageKey, content) {
  if (pageKey === 'home') {
    renderHomePage(content)
    return
  }

  if (pageKey === 'brands') {
    renderBrandsPage(content)
    return
  }

  if (pageKey === 'products') {
    renderProductsPage(content)
    return
  }

  if (pageKey === 'about') {
    renderAboutPage(content)
  }
}

function updateTextBindings() {
  const textNodes = document.querySelectorAll('[data-contact]')

  textNodes.forEach((node) => {
    const field = node.getAttribute('data-contact')
    let value = ''

    if (field === 'businessHoursInline') {
      value = hasUsableValue(APP_STATE.contact.businessHours)
        ? APP_STATE.contact.businessHours
        : 'TODO_REPLACE_REAL_BUSINESS_HOURS'
    } else {
      const sourceValue = APP_STATE.contact[field]
      value = hasUsableValue(sourceValue) ? sourceValue : `TODO_REPLACE_REAL_${String(field).toUpperCase()}`
    }

    node.textContent = value
  })
}

function buildHrefFromField(field) {
  const value = APP_STATE.contact[field]

  if (!hasUsableValue(value)) {
    return null
  }

  if (field === 'phone') {
    const phoneDigits = value.replace(/[^\d+]/g, '')
    return phoneDigits ? `tel:${phoneDigits}` : null
  }

  if (field === 'email') {
    return `mailto:${value}`
  }

  return value
}

function updateLinkBindings() {
  const linkNodes = document.querySelectorAll('[data-contact-link]')

  linkNodes.forEach((link) => {
    const field = link.getAttribute('data-contact-link')
    const href = buildHrefFromField(field)

    if (href) {
      link.setAttribute('href', href)
      if (/^https?:\/\//i.test(href)) {
        link.setAttribute('target', '_blank')
        link.setAttribute('rel', 'noopener')
      } else {
        link.removeAttribute('target')
        link.removeAttribute('rel')
      }
      link.removeAttribute('aria-disabled')
      return
    }

    link.setAttribute('href', 'lien-he.html#thong-tin-lien-he')
    link.setAttribute('aria-disabled', 'true')
    link.removeAttribute('target')
    link.removeAttribute('rel')
  })
}

function buildChatLink(message) {
  const {zaloLink, whatsappLink} = APP_STATE.contact

  if (hasUsableValue(zaloLink)) {
    return appendQuery(zaloLink, 'text', message)
  }

  if (hasUsableValue(whatsappLink)) {
    return appendQuery(whatsappLink, 'text', message)
  }

  return null
}

function buildMailtoLink(message) {
  const {email} = APP_STATE.contact

  if (!hasUsableValue(email)) {
    return null
  }

  const subject = `Lead kinh doanh từ website ${APP_STATE.brandName}`
  const base = `mailto:${email}`
  return `${base}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
}

async function postToWebhook(payload) {
  const {webhookEnabled, webhookEndpoint, webhookMethod} = APP_STATE.lead

  if (!webhookEnabled || !hasUsableValue(webhookEndpoint)) {
    return false
  }

  const response = await fetch(webhookEndpoint, {
    method: webhookMethod,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return response.ok
}

async function postJson(url, payload) {
  const requestMode = APP_STATE.lead.requestMode === 'no-cors' ? 'no-cors' : 'cors'
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    mode: requestMode,
    body: JSON.stringify(payload),
  })

  if (requestMode === 'no-cors') {
    return true
  }

  return response.ok
}

async function postLeadToOwnerChannels(payload, message) {
  const tasks = []

  if (hasUsableValue(APP_STATE.lead.telegramEndpoint)) {
    tasks.push(postJson(APP_STATE.lead.telegramEndpoint, {text: message, payload}))
  }

  if (hasUsableValue(APP_STATE.lead.sheetEndpoint)) {
    tasks.push(postJson(APP_STATE.lead.sheetEndpoint, payload))
  }

  if (!tasks.length) {
    return false
  }

  const results = await Promise.allSettled(tasks)
  return results.some((item) => item.status === 'fulfilled' && item.value === true)
}

function showFormStatus(form, message, isError = false) {
  const statusNode = form.querySelector('[data-form-status]')

  if (!statusNode) {
    return
  }

  statusNode.textContent = message
  statusNode.style.color = isError ? '#9b223e' : '#35643f'
}

function hasRequiredField(form, fieldName) {
  const field = form.querySelector(`[name="${fieldName}"]`)
  return Boolean(field && field.hasAttribute('required'))
}

function validateLeadForm(form, formData) {
  if (hasRequiredField(form, 'contactName') && !formData.contactName) {
    return 'Vui lòng nhập họ tên người liên hệ.'
  }

  if (formData.contactName && formData.contactName.length < 2) {
    return 'Họ tên cần có ít nhất 2 ký tự.'
  }

  if (hasRequiredField(form, 'businessName') && !formData.businessName) {
    return 'Vui lòng nhập tên đơn vị.'
  }

  if (hasRequiredField(form, 'phone') && !formData.phone) {
    return 'Vui lòng nhập số điện thoại để đội kinh doanh liên hệ.'
  }

  if (formData.phone && !/^[0-9+()\s.-]{8,20}$/.test(formData.phone)) {
    return 'Vui lòng nhập số điện thoại hợp lệ.'
  }

  if (hasRequiredField(form, 'area') && !formData.area) {
    return 'Vui lòng nhập khu vực hoạt động.'
  }

  if (hasRequiredField(form, 'businessModel') && !formData.businessModel) {
    return 'Vui lòng chọn mô hình kinh doanh.'
  }

  if (hasRequiredField(form, 'interest') && !formData.interest) {
    return 'Vui lòng chọn nhu cầu quan tâm.'
  }

  return null
}

function buildLeadMessage(formData) {
  const lines = [
    `YÊU CẦU LEAD KINH DOANH - ${APP_STATE.brandName}`,
    `- Mục tiêu liên hệ: ${formData.leadType}`,
    `- Nguồn form: ${formData.formPurpose}`,
    `- Trang gửi: ${formData.pageSource}`,
  ]

  const optionalFields = [
    ['Họ tên người liên hệ', formData.contactName],
    ['Tên đơn vị', formData.businessName],
    ['Số điện thoại', formData.phone],
    ['Khu vực', formData.area],
    ['Mẫu landing page / mô hình kinh doanh', formData.businessModel],
    ['Nhu cầu quan tâm', formData.interest],
    ['Ghi chú', formData.note],
  ]

  optionalFields.forEach(([label, value]) => {
    if (hasUsableValue(value)) {
      lines.push(`- ${label}: ${value}`)
    }
  })

  return lines.join('\n')
}

function collectLeadFormData(form, submitter) {
  const data = new FormData(form)
  const defaultLeadType = form.getAttribute('data-form-purpose') || 'Nhận tư vấn'

  return {
    leadType: submitter?.value || defaultLeadType,
    formPurpose: form.getAttribute('data-form-purpose') || 'Biểu mẫu website',
    pageSource: window.location.pathname,
    contactName: String(data.get('contactName') || '').trim(),
    businessName: String(data.get('businessName') || '').trim(),
    phone: String(data.get('phone') || '').trim(),
    area: String(data.get('area') || '').trim(),
    businessModel: String(data.get('businessModel') || '').trim(),
    interest: String(data.get('interest') || '').trim(),
    note: String(data.get('note') || '').trim(),
  }
}

async function handleLeadSubmit(event) {
  event.preventDefault()

  const form = event.currentTarget
  const formData = collectLeadFormData(form, event.submitter)

  const validationError = validateLeadForm(form, formData)
  if (validationError) {
    showFormStatus(form, validationError, true)
    return
  }

  const message = buildLeadMessage(formData)
  const payload = {
    source: 'multi-page-website',
    leadKind: 'business-distribution',
    brand: APP_STATE.brandName,
    ...formData,
    submittedAt: new Date().toISOString(),
  }

  try {
    const ownerChannelSent = await postLeadToOwnerChannels(payload, message)

    if (ownerChannelSent) {
      form.reset()
      showFormStatus(form, 'Yêu cầu đã gửi về hệ thống Telegram/Google Sheet. Đội ngũ The Hair Lab sẽ liên hệ sớm.')
      return
    }
  } catch (_error) {
    // Fall through to other available channels.
  }

  const chatLink = buildChatLink(message)
  if (chatLink) {
    window.open(chatLink, '_blank', 'noopener')
    showFormStatus(form, 'Yêu cầu đã được chuyển sang kênh tư vấn. Vui lòng gửi tin nhắn để đội kinh doanh xác nhận.')
    return
  }

  const mailtoLink = buildMailtoLink(message)
  if (mailtoLink) {
    window.location.href = mailtoLink
    showFormStatus(form, 'Yêu cầu đã được chuyển sang email báo giá. Vui lòng gửi thư để đội kinh doanh xử lý.')
    return
  }

  try {
    const webhookSent = await postToWebhook(payload)

    if (webhookSent) {
      showFormStatus(form, 'Yêu cầu đã được chuyển sang hệ thống lead. Đội kinh doanh sẽ liên hệ bạn sớm.')
      return
    }
  } catch (_error) {
    // Keep silent and fall through to a user-friendly message.
  }

  showFormStatus(
    form,
    'Chưa có endpoint nhận form trong cấu hình. Vui lòng cấu hình THEHAIRLAB_CONFIG.lead để gửi về Telegram/Google Sheet.',
    true
  )
}

function setupLeadForms() {
  const forms = document.querySelectorAll('.js-lead-form')

  forms.forEach((form) => {
    form.addEventListener('submit', handleLeadSubmit)
  })
}

function setupPrefillInterestFromQuery() {
  const params = new URLSearchParams(window.location.search)
  const interest = params.get('interest')

  if (!hasUsableValue(interest)) {
    return
  }

  document.querySelectorAll('select[name="interest"]').forEach((selectNode) => {
    const select = selectNode
    const hasOption = Array.from(select.options).some((option) => option.value === interest)

    if (!hasOption) {
      const option = document.createElement('option')
      option.value = interest
      option.textContent = interest
      select.appendChild(option)
    }

    select.value = interest
  })

  document.querySelectorAll('input[name="interest"]').forEach((inputNode) => {
    inputNode.value = interest
  })
}

function setupQuickConsultLinks() {
  const links = document.querySelectorAll('.js-quick-contact-link, #quick-consult-link')

  if (!links.length) {
    return
  }

  const message = `Tôi muốn được tư vấn nhanh về danh mục phân phối tại ${APP_STATE.brandName}.`
  const chatLink = buildChatLink(message)
  const mailtoLink = buildMailtoLink(message)

  links.forEach((link) => {
    if (!(link instanceof HTMLAnchorElement)) {
      return
    }

    if (chatLink) {
      link.href = chatLink
      link.setAttribute('target', '_blank')
      link.setAttribute('rel', 'noopener')
      return
    }

    if (mailtoLink) {
      link.href = mailtoLink
      link.removeAttribute('target')
      link.removeAttribute('rel')
      return
    }

    if (!link.getAttribute('href')) {
      link.href = 'lien-he.html#thong-tin-lien-he'
    }

    link.removeAttribute('target')
    link.removeAttribute('rel')
  })
}

function setupMobileNav() {
  const navToggle = document.querySelector('.nav-toggle')
  const nav = document.getElementById('main-nav')

  if (!navToggle || !nav) {
    return
  }

  const closeNav = () => {
    nav.classList.remove('open')
    navToggle.setAttribute('aria-expanded', 'false')
    document.body.classList.remove('nav-open')
  }

  const openNav = () => {
    nav.classList.add('open')
    navToggle.setAttribute('aria-expanded', 'true')
    document.body.classList.add('nav-open')
  }

  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('open')

    if (isOpen) {
      closeNav()
    } else {
      openNav()
    }
  })

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      closeNav()
    })
  })

  document.addEventListener('click', (event) => {
    const target = event.target

    if (!(target instanceof Node)) {
      return
    }

    if (!nav.classList.contains('open')) {
      return
    }

    if (nav.contains(target) || navToggle.contains(target)) {
      return
    }

    closeNav()
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeNav()
    }
  })
}

function setupActiveNavigation() {
  if (document.body?.dataset?.page === 'home') {
    setupHomeAnchorNavigation()
    return
  }

  const activeKey = document.body?.dataset?.nav || ''

  document.querySelectorAll('#main-nav a[data-nav]').forEach((link) => {
    const isActive = link.getAttribute('data-nav') === activeKey

    link.classList.toggle('is-active', isActive)

    if (isActive) {
      link.setAttribute('aria-current', 'page')
    } else {
      link.removeAttribute('aria-current')
    }
  })
}

function setupHomeAnchorNavigation() {
  const nav = document.getElementById('main-nav')

  if (!nav) {
    return
  }

  const anchorLinks = Array.from(nav.querySelectorAll('a[href^="#"]'))

  if (!anchorLinks.length) {
    return
  }

  const sections = anchorLinks
    .map((link) => {
      const id = link.getAttribute('href')?.slice(1)
      if (!id) {
        return null
      }

      const section = document.getElementById(id)
      if (!section) {
        return null
      }

      return {link, section, id}
    })
    .filter(Boolean)

  const setActiveLink = (id) => {
    sections.forEach((item) => {
      const isActive = item.id === id
      item.link.classList.toggle('is-active', isActive)
      if (isActive) {
        item.link.setAttribute('aria-current', 'page')
      } else {
        item.link.removeAttribute('aria-current')
      }
    })
  }

  const hashId = window.location.hash.replace('#', '')
  if (hashId) {
    setActiveLink(hashId)
  } else if (sections[0]) {
    setActiveLink(sections[0].id)
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

      if (!visible?.target?.id) {
        return
      }

      setActiveLink(visible.target.id)
    },
    {
      rootMargin: '-35% 0px -45% 0px',
      threshold: [0.15, 0.35, 0.55],
    }
  )

  sections.forEach((item) => {
    observer.observe(item.section)
    item.link.addEventListener('click', () => {
      setActiveLink(item.id)
    })
  })
}

function setupBackToTop() {
  const backToTop = document.getElementById('back-to-top')

  if (!backToTop) {
    return
  }

  const toggleVisibility = () => {
    const isVisible = window.scrollY > 420
    backToTop.classList.toggle('visible', isVisible)
  }

  backToTop.addEventListener('click', () => {
    window.scrollTo({top: 0, behavior: 'smooth'})
  })

  toggleVisibility()
  window.addEventListener('scroll', toggleVisibility, {passive: true})
}

function setupRevealAnimations() {
  const revealNodes = document.querySelectorAll('.reveal')

  if (!('IntersectionObserver' in window)) {
    revealNodes.forEach((node) => node.classList.add('visible'))
    return
  }

  const observer = new IntersectionObserver(
    (entries, io) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return
        }

        entry.target.classList.add('visible')
        io.unobserve(entry.target)
      })
    },
    {threshold: 0.14}
  )

  revealNodes.forEach((node) => observer.observe(node))
}

function setupFooterYear() {
  const year = document.getElementById('current-year')

  if (!year) {
    return
  }

  year.textContent = String(new Date().getFullYear())
}

async function initSite() {
  let homepageContent = {}

  applyRuntimeConfig()

  try {
    homepageContent = await fetchHomepageData()
  } catch (_error) {
    homepageContent = {}
  }

  applySiteSettings(homepageContent?.siteSettings)
  renderSiteMeta(homepageContent?.siteSettings)
  renderByPage(document.body?.dataset?.page || 'home', homepageContent)
  renderContactBlock(homepageContent?.contactBlock || {})

  updateTextBindings()
  updateLinkBindings()
  setupActiveNavigation()
  setupMobileNav()
  setupBackToTop()
  setupQuickConsultLinks()
  setupLeadForms()
  setupPrefillInterestFromQuery()
  setupRevealAnimations()
  setupFooterYear()
}

document.addEventListener('DOMContentLoaded', () => {
  initSite()
})
