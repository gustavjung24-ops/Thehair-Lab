export const HOMEPAGE_QUERY = `{
  "siteSettings": *[_type == "siteSettings"] | order(_updatedAt desc)[0]{
    siteTitle,
    siteDescription,
    hotline,
    email,
    zaloLink,
    address,
    businessHours
  },
  "homepageHero": *[_type == "homepageHero"] | order(_updatedAt desc)[0]{
    eyebrow,
    title,
    subtitle,
    primaryCtaLabel,
    primaryCtaUrl,
    secondaryCtaLabel,
    secondaryCtaUrl,
    heroImage
  },
  "trustPoints": *[_type == "trustPoint"] | order(_createdAt asc){
    _id,
    title,
    description,
    iconName
  },
  "brands": *[_type == "brand"] | order(sortOrder asc, name asc){
    _id,
    name,
    slug,
    logo,
    shortDescription,
    sortOrder
  },
  "productCategories": *[_type == "productCategory"] | order(sortOrder asc, name asc){
    _id,
    name,
    slug,
    coverImage,
    shortDescription,
    targetCustomer,
    keyBenefit,
    sortOrder
  },
  "testimonials": *[_type == "testimonial"] | order(sortOrder asc, _createdAt asc){
    _id,
    customerName,
    customerType,
    quote,
    rating,
    sortOrder
  },
  "contactBlock": *[_type == "contactBlock"] | order(_updatedAt desc)[0]{
    title,
    description,
    ctaLabel,
    ctaUrl
  }
}`
