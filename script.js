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
    // Set webhookEnabled=true only when a real lead endpoint is ready.
    webhookEnabled: false,
    webhookEndpoint: 'TODO_REPLACE_REAL_WEBHOOK_ENDPOINT',
    webhookMethod: 'POST',
  },
}

function isTodoValue(value) {
  return typeof value === 'string' && value.includes('TODO_REPLACE')
}

function hasUsableValue(value) {
  return typeof value === 'string' && value.trim() !== '' && !isTodoValue(value)
}

function formatDisplayValue(value, fallbackTodoLabel) {
  if (!hasUsableValue(value)) {
    return fallbackTodoLabel
  }

  return value
}

function makeAbsoluteOrAnchorUrl(url, fallback = '#lead') {
  if (!hasUsableValue(url)) {
    return fallback
  }

  return url
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
  if (!siteSettings || typeof siteSettings !== 'object') {
    return
  }

  if (hasUsableValue(siteSettings.siteTitle)) {
    document.title = siteSettings.siteTitle
  }

  const metaNode = document.getElementById('site-description-meta')
  if (metaNode && hasUsableValue(siteSettings.siteDescription)) {
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
    node.setAttribute('data-lead-intent', label)
  }

  const href = makeAbsoluteOrAnchorUrl(url, '#lead')
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

function renderTrustPoints(trustPoints) {
  const trustStripGrid = document.getElementById('trust-strip-grid')
  const heroTrustList = document.getElementById('hero-trust-list')

  if (!trustStripGrid || !heroTrustList) {
    return
  }

  trustStripGrid.innerHTML = ''
  heroTrustList.innerHTML = ''

  trustPoints.forEach((item) => {
    const title = hasUsableValue(item?.title) ? item.title : 'Đang cập nhật'
    const description = hasUsableValue(item?.description) ? item.description : title
    const trustBadgeText = description.length > 42 ? title : description

    trustStripGrid.appendChild(createNode('p', '', trustBadgeText))

    const listItem = createNode('li', '', '')
    const titleNode = createNode('strong', '', title)
    const descriptionNode = createNode('span', '', description)
    listItem.appendChild(titleNode)
    listItem.appendChild(descriptionNode)
    heroTrustList.appendChild(listItem)
  })
}

function renderCategories(categories) {
  const categoryGrid = document.getElementById('category-grid')

  if (!categoryGrid) {
    return
  }

  categoryGrid.innerHTML = ''

  categories.forEach((category) => {
    const article = createNode('article', 'service-card reveal')

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

    article.appendChild(createNode('h3', '', hasUsableValue(category.name) ? category.name : 'Nhóm sản phẩm'))

    const targetCustomer = hasUsableValue(category.targetCustomer)
      ? category.targetCustomer
      : 'Salon, spa và đại lý cần danh mục ổn định.'

    const keyBenefit = hasUsableValue(category.keyBenefit)
      ? category.keyBenefit
      : 'Tối ưu hiệu quả kinh doanh từ danh mục phù hợp.'

    article.appendChild(createNode('p', 'service-for', `Phù hợp: ${targetCustomer}`))
    article.appendChild(createNode('p', 'service-result', `Lợi ích nổi bật: ${keyBenefit}`))

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

    const button = createNode('button', 'service-cta', 'Nhận danh mục sản phẩm')
    button.type = 'button'
    button.setAttribute('data-interest', hasUsableValue(category.name) ? category.name : 'Nhận catalog')
    article.appendChild(button)

    categoryGrid.appendChild(article)
  })
}

function renderBrands(brands) {
  const brandGrid = document.getElementById('brand-grid')
  const sectionHead = document.getElementById('brand-section-head')

  if (!brandGrid || !sectionHead) {
    return
  }

  brandGrid.innerHTML = ''

  if (!brands.length) {
    sectionHead.setAttribute('hidden', 'hidden')
    brandGrid.setAttribute('hidden', 'hidden')
    return
  }

  sectionHead.removeAttribute('hidden')
  brandGrid.removeAttribute('hidden')

  brands.forEach((brand) => {
    const article = createNode('article', 'brand-card reveal')

    const logoUrl = buildImageUrl(brand.logo, {width: 400, height: 180})
    if (logoUrl) {
      const logoWrap = createNode('div', 'brand-logo-wrap')
      const logoImage = createNode('img', '', '')
      logoImage.src = logoUrl
      logoImage.alt = hasUsableValue(brand.name) ? `${brand.name} logo` : 'Brand logo'
      logoImage.loading = 'lazy'
      logoWrap.appendChild(logoImage)
      article.appendChild(logoWrap)
    }

    article.appendChild(createNode('h3', '', hasUsableValue(brand.name) ? brand.name : 'Thương hiệu'))
    article.appendChild(
      createNode(
        'p',
        '',
        hasUsableValue(brand.shortDescription) ? brand.shortDescription : 'Nội dung mô tả thương hiệu sẽ được cập nhật sớm.'
      )
    )

    brandGrid.appendChild(article)
  })
}

function renderTestimonials(testimonials) {
  const testimonialGrid = document.getElementById('testimonial-grid')

  if (!testimonialGrid) {
    return
  }

  testimonialGrid.innerHTML = ''

  testimonials.forEach((item) => {
    const reviewCard = createNode('article', 'review-card reveal')
    reviewCard.appendChild(
      createNode('span', 'review-tag', hasUsableValue(item.customerType) ? item.customerType : 'Đối tác The Hair Lab')
    )

    const quote = hasUsableValue(item.quote) ? item.quote : 'Nội dung phản hồi sẽ được cập nhật sớm.'
    reviewCard.appendChild(createNode('p', '', `"${quote}"`))
    reviewCard.appendChild(createNode('p', 'review-rating', buildRatingText(item.rating)))

    const customerName = hasUsableValue(item.customerName) ? item.customerName : 'Khách hàng doanh nghiệp'
    reviewCard.appendChild(createNode('p', 'review-author', customerName))

    testimonialGrid.appendChild(reviewCard)
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
  const ctaUrl = makeAbsoluteOrAnchorUrl(contactBlock?.ctaUrl, '#lead')

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

function syncInterestOptions(categories, hero) {
  const interestSelect = document.getElementById('interest-select')
  if (!interestSelect) {
    return
  }

  const desiredOptions = [
    hero.primaryCtaLabel,
    hero.secondaryCtaLabel,
    ...categories.map((item) => item.name),
  ].filter((item) => hasUsableValue(item))

  const existingValues = new Set(Array.from(interestSelect.options).map((option) => option.value))

  desiredOptions.forEach((value) => {
    if (existingValues.has(value)) {
      return
    }

    const option = document.createElement('option')
    option.value = value
    option.textContent = value
    interestSelect.appendChild(option)
    existingValues.add(value)
  })
}

function updateTextBindings() {
  const textNodes = document.querySelectorAll('[data-contact]')

  textNodes.forEach((node) => {
    const field = node.getAttribute('data-contact')
    let value = ''

    if (field === 'businessHoursInline') {
      value = formatDisplayValue(APP_STATE.contact.businessHours, 'TODO_REPLACE_REAL_BUSINESS_HOURS')
    } else {
      value = formatDisplayValue(APP_STATE.contact[field], `TODO_REPLACE_REAL_${field.toUpperCase()}`)
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

    link.setAttribute('href', '#contact')
    link.setAttribute('aria-disabled', 'true')
    link.removeAttribute('target')
    link.removeAttribute('rel')
  })
}

function buildLeadMessage(formData) {
  return [
    `YÊU CẦU LEAD KINH DOANH - ${APP_STATE.brandName}`,
    `- Mục tiêu liên hệ: ${formData.leadType}`,
    `- Từ CTA hero: ${formData.heroIntent || 'Không có'}`,
    `- Họ tên người liên hệ: ${formData.contactName}`,
    `- Tên đơn vị: ${formData.businessName}`,
    `- Số điện thoại: ${formData.phone}`,
    `- Khu vực: ${formData.area}`,
    `- Mô hình kinh doanh: ${formData.businessModel}`,
    `- Nhu cầu quan tâm: ${formData.interest}`,
    `- Ghi chú: ${formData.note || 'Không có ghi chú thêm'}`,
  ].join('\n')
}

function appendQuery(baseUrl, key, value) {
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}${key}=${encodeURIComponent(value)}`
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

function validateLeadForm(formData) {
  if (!formData.contactName || formData.contactName.length < 2) {
    return 'Vui lòng nhập họ tên người liên hệ hợp lệ.'
  }

  if (!formData.businessName || formData.businessName.length < 2) {
    return 'Vui lòng nhập tên đơn vị hợp lệ.'
  }

  if (!/^[0-9+()\s.-]{8,20}$/.test(formData.phone)) {
    return 'Vui lòng nhập số điện thoại hợp lệ để đội kinh doanh liên hệ.'
  }

  if (!formData.area) {
    return 'Vui lòng nhập khu vực hoạt động.'
  }

  if (!formData.businessModel) {
    return 'Vui lòng chọn mô hình kinh doanh.'
  }

  if (!formData.interest) {
    return 'Vui lòng chọn nhu cầu quan tâm.'
  }

  return null
}

function showLeadStatus(message, isError = false) {
  const statusNode = document.getElementById('lead-status')
  if (!statusNode) {
    return
  }

  statusNode.textContent = message
  statusNode.style.color = isError ? '#9b223e' : '#35643f'
}

async function handleLeadSubmit(event) {
  event.preventDefault()

  const form = event.currentTarget
  const data = new FormData(form)
  const clickedAction = event.submitter?.value || 'Nhận tư vấn'
  const formData = {
    leadType: clickedAction,
    heroIntent: String(data.get('heroIntent') || '').trim(),
    contactName: String(data.get('contactName') || '').trim(),
    businessName: String(data.get('businessName') || '').trim(),
    phone: String(data.get('phone') || '').trim(),
    area: String(data.get('area') || '').trim(),
    businessModel: String(data.get('businessModel') || '').trim(),
    interest: String(data.get('interest') || '').trim(),
    note: String(data.get('note') || '').trim(),
  }

  const validationError = validateLeadForm(formData)
  if (validationError) {
    showLeadStatus(validationError, true)
    return
  }

  const message = buildLeadMessage(formData)
  const payload = {
    source: 'landing-page',
    leadKind: 'business-distribution',
    brand: APP_STATE.brandName,
    ...formData,
    submittedAt: new Date().toISOString(),
  }

  const chatLink = buildChatLink(message)
  if (chatLink) {
    window.open(chatLink, '_blank', 'noopener')
    showLeadStatus('Yêu cầu đã được chuyển sang kênh tư vấn. Vui lòng gửi tin nhắn để đội kinh doanh xác nhận.')
    return
  }

  const mailtoLink = buildMailtoLink(message)
  if (mailtoLink) {
    window.location.href = mailtoLink
    showLeadStatus('Yêu cầu đã được chuyển sang email báo giá. Vui lòng gửi thư để đội kinh doanh xử lý.')
    return
  }

  try {
    const webhookSent = await postToWebhook(payload)

    if (webhookSent) {
      showLeadStatus('Yêu cầu đã được chuyển sang hệ thống lead. Đội kinh doanh sẽ liên hệ bạn sớm.')
      return
    }
  } catch (_error) {
    // Keep silent and fall through to a user-friendly message.
  }

  showLeadStatus(
    'Chưa có kênh liên hệ thật trong cấu hình. Vui lòng cập nhật APP_STATE.contact (Zalo/WhatsApp/email) để nhận lead.',
    true
  )
}

function setupLeadForm() {
  const form = document.getElementById('lead-form')
  if (!form) {
    return
  }

  form.addEventListener('submit', handleLeadSubmit)
}

function setupProductInterestButtons() {
  const serviceButtons = document.querySelectorAll('.service-cta')
  const interestSelect = document.getElementById('interest-select')

  serviceButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selectedInterest = button.getAttribute('data-interest')

      if (interestSelect && selectedInterest) {
        interestSelect.value = selectedInterest
      }

      const leadSection = document.getElementById('lead')
      leadSection?.scrollIntoView({behavior: 'smooth', block: 'start'})
    })
  })
}

function setupQuickConsultLink() {
  const link = document.getElementById('quick-consult-link')
  const mobileLink = document.getElementById('mobile-quick-contact')

  if (mobileLink) {
    mobileLink.setAttribute('aria-label', 'Liên hệ tư vấn nhanh')
  }

  if (!link) {
    if (mobileLink) {
      mobileLink.setAttribute('href', '#contact')
    }
    return
  }

  const message = `Tôi muốn được tư vấn nhanh về danh mục phân phối tại ${APP_STATE.brandName}.`
  const chatLink = buildChatLink(message)
  const mailtoLink = buildMailtoLink(message)

  if (chatLink) {
    link.setAttribute('href', chatLink)
    link.setAttribute('target', '_blank')
    link.setAttribute('rel', 'noopener')

    if (mobileLink) {
      mobileLink.setAttribute('href', chatLink)
      mobileLink.setAttribute('target', '_blank')
      mobileLink.setAttribute('rel', 'noopener')
    }
    return
  }

  if (mailtoLink) {
    link.setAttribute('href', mailtoLink)
    link.removeAttribute('target')
    link.removeAttribute('rel')

    if (mobileLink) {
      mobileLink.setAttribute('href', mailtoLink)
      mobileLink.removeAttribute('target')
      mobileLink.removeAttribute('rel')
    }
    return
  }

  link.setAttribute('href', '#contact')
  link.removeAttribute('target')
  link.removeAttribute('rel')

  if (mobileLink) {
    mobileLink.setAttribute('href', '#contact')
    mobileLink.removeAttribute('target')
    mobileLink.removeAttribute('rel')
  }
}

function setupHeroIntentLinks() {
  const links = document.querySelectorAll('.lead-intent-link')
  const intentInput = document.getElementById('hero-intent')
  const interestSelect = document.getElementById('interest-select')

  links.forEach((link) => {
    link.addEventListener('click', () => {
      const intent = link.getAttribute('data-lead-intent') || ''

      if (intentInput) {
        intentInput.value = intent
      }

      if (interestSelect && hasUsableValue(intent)) {
        interestSelect.value = intent
      }
    })
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

function renderHomepageContent(content) {
  const categories = Array.isArray(content?.productCategories) ? content.productCategories : []
  const brands = Array.isArray(content?.brands) ? content.brands : []
  const testimonials = Array.isArray(content?.testimonials) ? content.testimonials : []
  const trustPoints = Array.isArray(content?.trustPoints) ? content.trustPoints : []
  const hero = content?.homepageHero || {}

  applySiteSettings(content?.siteSettings)
  renderSiteMeta(content?.siteSettings)
  renderHero(hero)
  renderTrustPoints(trustPoints)
  renderCategories(categories)
  renderBrands(brands)
  renderTestimonials(testimonials)
  renderContactBlock(content?.contactBlock || {})
  syncInterestOptions(categories, hero)
  updateTextBindings()
  updateLinkBindings()
}

async function initLandingPage() {
  const homepageContent = await fetchHomepageData()
  renderHomepageContent(homepageContent)
  setupQuickConsultLink()
  setupHeroIntentLinks()
  setupMobileNav()
  setupProductInterestButtons()
  setupLeadForm()
  setupRevealAnimations()
  setupFooterYear()
}

document.addEventListener('DOMContentLoaded', () => {
  initLandingPage().catch(() => {
    updateTextBindings()
    updateLinkBindings()
    setupQuickConsultLink()
    setupHeroIntentLinks()
    setupMobileNav()
    setupProductInterestButtons()
    setupLeadForm()
    setupRevealAnimations()
    setupFooterYear()
  })
})
