import { asColor, stockStatus, type Product } from '../types'

const IMG = {
  jamdani: '/images/scarf-jamdani.jpg',
  jamdaniSq: '/images/scarf-jamdani-square.jpg',
  gold: '/images/silk-gold.jpg',
  goldSq: '/images/silk-gold-square.jpg',
  blush: '/images/silk-blush.jpg',
  midnight: '/images/silk-midnight.jpg',
  charcoal: '/images/silk-charcoal.jpg',
  ivory: '/images/silk-ivory.jpg',
  bronze: '/images/silk-bronze.jpg',
  hero: '/images/hero-model.jpg',
}

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
  motif?: string
  featured?: boolean
}

const SEEDS: Seed[] = [
  {
    name: 'Signature Silk Scarf',
    subtitle: 'Style Heaven Signature',
    code: 'SH-SILK-SCF-01',
    category: 'Scarves',
    collection: 'Signature Collection',
    buy: 9800,
    sell: 18750,
    stock: 32,
    images: [IMG.jamdani, IMG.jamdaniSq, IMG.bronze],
    colors: ['Jamdani Cream', 'Bronze', 'Champagne Gold'],
    sizes: ['Regular – 90cm x 200cm', 'Grande – 110cm x 220cm'],
    material: '100% mulberry silk',
    motif: 'Bengali Jamdani Motifs',
    description:
      'Handwoven in Bengal. 100% mulberry silk with intricate jamdani motifs, rooted in heritage and refined for the modern wardrobe.',
    featured: true,
  },
  {
    name: 'Silk Charmeuse Scarf',
    subtitle: 'Atelier Scarf',
    code: 'SH-SILK-SCF-02',
    category: 'Scarves',
    collection: 'Signature Collection',
    buy: 9200,
    sell: 18500,
    stock: 26,
    images: [IMG.gold, IMG.goldSq, IMG.ivory],
    colors: ['Champagne Gold', 'Ivory', 'Blush'],
    sizes: ['90cm x 90cm', 'Regular – 90cm x 200cm'],
    material: 'Pure mulberry silk',
    description: 'Fluid charmeuse silk with a luminous champagne drape.',
  },
  {
    name: 'Silk Blouse',
    subtitle: 'Draped Silk',
    code: 'SH-SILK-BLS-01',
    category: 'Tops',
    collection: 'Ready to Wear',
    buy: 12800,
    sell: 24750,
    stock: 14,
    images: [IMG.blush, IMG.ivory, IMG.gold],
    colors: ['Blush', 'Ivory', 'Champagne Gold'],
    sizes: ['XS', 'S', 'M', 'L'],
    material: 'Draped mulberry silk',
    description: 'A softly draped blouse in liquid silk.',
  },
  {
    name: 'Silk Kaftan',
    subtitle: 'Luxe Atelier',
    code: 'SH-SILK-KFT-01',
    category: 'Dresses',
    collection: 'Luxe',
    buy: 16800,
    sell: 32000,
    stock: 8,
    images: [IMG.charcoal, IMG.midnight, IMG.bronze],
    colors: ['Charcoal', 'Midnight', 'Bronze'],
    sizes: ['S', 'M', 'L', 'XL'],
    material: 'Handloom silk',
    description: 'An evening kaftan with gold-threaded borders.',
  },
  {
    name: 'Silk Sleepwear Set',
    subtitle: 'Midnight Silk',
    code: 'SH-SILK-SLP-01',
    category: 'Loungewear',
    collection: 'Atelier Night',
    buy: 8400,
    sell: 16900,
    stock: 25,
    images: [IMG.midnight, IMG.charcoal, IMG.blush],
    colors: ['Midnight', 'Charcoal', 'Blush'],
    sizes: ['S', 'M', 'L'],
    material: 'Mulberry silk satin',
    description: 'A two-piece sleep set in midnight silk satin.',
  },
  {
    name: 'Silk Pillowcase',
    subtitle: 'Set of 2',
    code: 'SH-SILK-PIL-01',
    category: 'Accessories',
    collection: 'Maison',
    buy: 3100,
    sell: 6750,
    stock: 0,
    images: [IMG.ivory, IMG.goldSq, IMG.blush],
    colors: ['Ivory', 'Champagne Gold', 'Blush'],
    sizes: ['Standard pair', 'King pair'],
    material: '22-momme silk',
    description: 'A pair of 22-momme silk pillowcases.',
  },
  {
    name: 'Jamdani Saree',
    subtitle: 'Woven in Light',
    code: 'SH-JAM-SAR-01',
    category: 'Sarees',
    collection: 'Heritage',
    buy: 24000,
    sell: 48500,
    stock: 6,
    images: [IMG.hero, IMG.charcoal, IMG.bronze],
    colors: ['Charcoal', 'Bronze', 'Midnight'],
    sizes: ['5.5m with blouse piece'],
    material: 'Handwoven jamdani silk',
    description: 'A black-and-gold jamdani saree, handwoven in Bengal.',
  },
  {
    name: 'Bronze Dupatta',
    subtitle: 'Heritage Weave',
    code: 'SH-BRZ-DUP-01',
    category: 'Scarves',
    collection: 'Heritage',
    buy: 6200,
    sell: 12500,
    stock: 20,
    images: [IMG.bronze, IMG.jamdani, IMG.gold],
    colors: ['Bronze', 'Jamdani Cream', 'Champagne Gold'],
    sizes: ['2.5m'],
    material: 'Silk-cotton jamdani',
    description: 'A bronze dupatta with jamdani butis.',
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
    motif: seed.motif,
    hasSize: true,
    hasColor: true,
    sizes: seed.sizes,
    colors: seed.colors.map(asColor),
    material: seed.material,
    origin: 'Handwoven in Bengal',
    imageScrollSeconds: 4,
    featured: seed.featured,
    shopVisible: true,
  }))
}

export const SIGNATURE_SLUG = 'signature-silk-scarf'
