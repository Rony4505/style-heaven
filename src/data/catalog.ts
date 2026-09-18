import { asColor, stockStatus, type Product } from '../types'

const IMG = {
  teeBlack: '/products/tee-black.webp',
  teeCream: '/products/tee-cream.webp',
  polo: '/products/polo-burgundy.webp',
  hoodie: '/products/hoodie-charcoal.webp',
  oxford: '/products/shirt-oxford-blue.webp',
  linen: '/products/shirt-linen-sand.webp',
  jeansIndigo: '/products/jeans-indigo.webp',
  jeansLight: '/products/jeans-light.webp',
}

// Bump when the seed catalog changes so browsers with an older saved catalog pick up the new products.
export const CATALOG_VERSION = 3

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

type Seed = {
  name: string
  subtitle: string
  code: string
  category: string
  collection: string
  buy: number
  sell: number
  stock: number
  images: string[]
  colors: string[]
  sizes: string[]
  material: string
  description: string
  featured?: boolean
}

const TOP_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const WAISTS = ['28', '30', '32', '34', '36']

const SEEDS: Seed[] = [
  {
    name: 'Essential Black Tee',
    subtitle: 'Heavyweight cotton',
    code: 'SH-TEE-001',
    category: 'T-Shirts',
    collection: 'Essentials',
    buy: 420,
    sell: 890,
    stock: 120,
    images: [IMG.teeBlack, IMG.teeCream],
    colors: ['Black', 'Cream'],
    sizes: TOP_SIZES,
    material: '240 GSM combed cotton',
    description: 'A boxy crew-neck tee in heavyweight combed cotton. Pre-shrunk, ribbed collar, built to keep its shape.',
    featured: true,
  },
  {
    name: 'Oversized Cream Tee',
    subtitle: 'Relaxed drop shoulder',
    code: 'SH-TEE-002',
    category: 'T-Shirts',
    collection: 'Essentials',
    buy: 460,
    sell: 950,
    stock: 80,
    images: [IMG.teeCream, IMG.teeBlack],
    colors: ['Cream', 'Black'],
    sizes: TOP_SIZES,
    material: '220 GSM cotton jersey',
    description: 'Drop-shoulder oversized fit with a soft, washed hand feel.',
  },
  {
    name: 'Burgundy Pique Polo',
    subtitle: 'Two-button placket',
    code: 'SH-POL-001',
    category: 'T-Shirts',
    collection: 'Smart Casual',
    buy: 780,
    sell: 1590,
    stock: 45,
    images: [IMG.polo],
    colors: ['Burgundy', 'Navy', 'Forest'],
    sizes: TOP_SIZES,
    material: 'Cotton pique',
    description: 'A classic pique polo with a two-button placket and ribbed cuffs.',
  },
  {
    name: 'Charcoal Pullover Hoodie',
    subtitle: 'Brushed fleece',
    code: 'SH-HOD-001',
    category: 'T-Shirts',
    collection: 'Essentials',
    buy: 1150,
    sell: 2350,
    stock: 30,
    images: [IMG.hoodie],
    colors: ['Charcoal', 'Black', 'Cream'],
    sizes: TOP_SIZES,
    material: '400 GSM brushed fleece',
    description: 'Heavyweight pullover hoodie with a double-layer hood and kangaroo pocket.',
  },
  {
    name: 'Oxford Button-Down Shirt',
    subtitle: 'Sky blue',
    code: 'SH-SHT-001',
    category: 'Shirts',
    collection: 'Smart Casual',
    buy: 950,
    sell: 1950,
    stock: 60,
    images: [IMG.oxford],
    colors: ['Sky Blue', 'White', 'Navy'],
    sizes: TOP_SIZES,
    material: 'Oxford cotton',
    description: 'A soft-collar Oxford shirt in sky blue. Regular fit, single chest pocket, mother-of-pearl buttons.',
  },
  {
    name: 'Linen Camp Shirt',
    subtitle: 'Sand',
    code: 'SH-SHT-002',
    category: 'Shirts',
    collection: 'Summer',
    buy: 1050,
    sell: 2150,
    stock: 35,
    images: [IMG.linen],
    colors: ['Sand', 'Olive', 'White'],
    sizes: TOP_SIZES,
    material: '100% linen',
    description: 'Breathable pure linen shirt with a relaxed collar for warm days.',
  },
  {
    name: 'Slim Indigo Jeans',
    subtitle: 'Dark rinse',
    code: 'SH-JNS-001',
    category: 'Jeans',
    collection: 'Denim',
    buy: 1400,
    sell: 2890,
    stock: 50,
    images: [IMG.jeansIndigo, IMG.jeansLight],
    colors: ['Indigo', 'Light Wash'],
    sizes: WAISTS,
    material: '12 oz stretch denim',
    description: 'Slim-fit jeans in a deep indigo rinse with contrast stitching and a touch of stretch.',
  },
  {
    name: 'Relaxed Light-Wash Jeans',
    subtitle: 'Straight leg',
    code: 'SH-JNS-002',
    category: 'Jeans',
    collection: 'Denim',
    buy: 1350,
    sell: 2790,
    stock: 40,
    images: [IMG.jeansLight, IMG.jeansIndigo],
    colors: ['Light Wash', 'Indigo'],
    sizes: WAISTS,
    material: '13 oz rigid denim',
    description: 'Relaxed straight-leg jeans in a faded light wash. Rigid denim that breaks in with wear.',
  },
]

export function createCatalog(): Product[] {
  return SEEDS.map((seed, i) => ({
    id: `p-${i + 1}`,
    slug: slugify(seed.name),
    name: seed.name,
    subtitle: seed.subtitle,
    code: seed.code,
    category: seed.category,
    collection: seed.collection,
    buyingPrice: seed.buy,
    sellingPrice: seed.sell,
    stock: seed.stock,
    status: stockStatus(seed.stock),
    images: seed.images,
    description: seed.description,
    hasSize: true,
    hasColor: true,
    sizes: seed.sizes,
    colors: seed.colors.map(asColor),
    material: seed.material,
    origin: 'Made in Bangladesh',
    imageScrollSeconds: 4,
    featured: seed.featured,
    shopVisible: true,
    cutout: true,
  }))
}

export const SIGNATURE_SLUG = 'essential-black-tee'
