import { stockStatus, type Product } from '../types'

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

const SHADE_IMAGE: Record<string, string> = {
  'Champagne Gold': IMG.gold,
  Ivory: IMG.ivory,
  Midnight: IMG.midnight,
  Bronze: IMG.bronze,
  Blush: IMG.blush,
  Charcoal: IMG.charcoal,
  'Jamdani Cream': IMG.jamdani,
}

type Seed = {
  name: string
  subtitle: string
  skuBase: string
  category: string
  collection: string
  price: number
  stocks: number[]
  image: string
  description: string
  motif?: string
  sizes: string[]
  material: string
  featured?: boolean
  shopVisible?: boolean
}

const SEEDS: Seed[] = [
  {
    name: 'Signature Silk Scarf',
    subtitle: 'Style Heaven Signature',
    skuBase: 'SH-SILK-SCF',
    category: 'Scarves',
    collection: 'Signature Collection',
    price: 18750,
    stocks: [32, 28, 21, 18, 12, 9],
    image: IMG.jamdani,
    motif: 'Bengali Jamdani Motifs',
    sizes: ['Regular – 90cm x 200cm', 'Grande – 110cm x 220cm'],
    material: '100% mulberry silk',
    description:
      'Handwoven in Bengal. 100% mulberry silk with intricate jamdani motifs, rooted in heritage and refined for the modern wardrobe.',
    featured: true,
    shopVisible: true,
  },
  {
    name: 'Silk Charmeuse Scarf',
    subtitle: 'Noor Signature',
    skuBase: 'NS-SILK-SCF',
    category: 'Scarves',
    collection: 'Signature Collection',
    price: 18500,
    stocks: [32, 26, 19, 14, 11, 7],
    image: IMG.gold,
    sizes: ['90cm x 90cm', '90cm x 200cm'],
    material: 'Pure mulberry silk',
    description:
      'Fluid charmeuse silk with a luminous champagne drape. Cut as a square or oblong scarf for day-to-evening wear.',
    shopVisible: true,
  },
  {
    name: 'Silk Blouse',
    subtitle: 'Draped Silk',
    skuBase: 'NS-SILK-BLS',
    category: 'Tops',
    collection: 'Ready to Wear',
    price: 24750,
    stocks: [14, 11, 8, 6, 4, 2],
    image: IMG.blush,
    sizes: ['XS', 'S', 'M', 'L'],
    material: 'Draped mulberry silk',
    description:
      'A softly draped blouse in liquid silk, tailored with a quiet neckline and a bias-cut hem.',
    shopVisible: true,
  },
  {
    name: 'Silk Kaftan',
    subtitle: 'Luxe Atelier',
    skuBase: 'NS-SILK-KFT',
    category: 'Dresses',
    collection: 'Luxe',
    price: 32000,
    stocks: [8, 7, 6, 5, 3, 2],
    image: IMG.charcoal,
    sizes: ['S', 'M', 'L', 'XL'],
    material: 'Handloom silk',
    description:
      'An evening kaftan with gold-threaded borders, designed to move like candlelight.',
    shopVisible: true,
  },
  {
    name: 'Silk Sleepwear Set',
    subtitle: 'Midnight Silk',
    skuBase: 'NS-SILK-SLP',
    category: 'Loungewear',
    collection: 'Atelier Night',
    price: 16900,
    stocks: [25, 22, 18, 15, 10, 6],
    image: IMG.midnight,
    sizes: ['S', 'M', 'L'],
    material: 'Mulberry silk satin',
    description:
      'A two-piece sleep set in midnight silk satin, finished with covered buttons and a self-tie.',
    shopVisible: true,
  },
  {
    name: 'Silk Pillowcase',
    subtitle: 'Set of 2',
    skuBase: 'NS-SILK-PIL',
    category: 'Accessories',
    collection: 'Maison',
    price: 6750,
    stocks: [0, 4, 8, 12, 3, 0],
    image: IMG.ivory,
    sizes: ['Standard pair', 'King pair'],
    material: '22-momme silk',
    description:
      'A pair of 22-momme silk pillowcases, woven to rest as softly as the garments they accompany.',
    shopVisible: true,
  },
  {
    name: 'Jamdani Saree',
    subtitle: 'Woven in Light',
    skuBase: 'SH-JAM-SAR',
    category: 'Sarees',
    collection: 'Heritage',
    price: 48500,
    stocks: [6, 5, 4, 3, 2, 1],
    image: IMG.hero,
    sizes: ['5.5m with blouse piece'],
    material: 'Handwoven jamdani silk',
    description:
      'A black-and-gold jamdani saree, handwoven in Bengal and finished with an heirloom border.',
    shopVisible: true,
  },
  {
    name: 'Bronze Dupatta',
    subtitle: 'Heritage Weave',
    skuBase: 'SH-BRZ-DUP',
    category: 'Scarves',
    collection: 'Heritage',
    price: 12500,
    stocks: [20, 16, 14, 9, 7, 5],
    image: IMG.bronze,
    sizes: ['2.5m'],
    material: 'Silk-cotton jamdani',
    description:
      'A bronze dupatta with jamdani butis, light enough for Dhaka heat and formal enough for evening.',
    shopVisible: true,
  },
]

const SHADES = [
  'Jamdani Cream',
  'Champagne Gold',
  'Blush',
  'Charcoal',
  'Midnight',
  'Ivory',
] as const

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function createCatalog(): Product[] {
  const primary: Product[] = []
  const rest: Product[] = []
  SEEDS.forEach((seed, seedIndex) => {
    SHADES.forEach((shade, shadeIndex) => {
      const stock = seed.stocks[shadeIndex] ?? 8
      const sku = `${seed.skuBase}-${String(shadeIndex + 1).padStart(2, '0')}`
      const isHero = Boolean(seed.featured && shadeIndex === 0)
      const image = shadeIndex === 0 ? seed.image : SHADE_IMAGE[shade] || seed.image
      const product: Product = {
        id: `p-${seedIndex + 1}-${shadeIndex + 1}`,
        slug: slugify(`${seed.name}-${shade}`),
        name: seed.name,
        subtitle: seed.subtitle,
        sku,
        category: seed.category,
        collection: seed.collection,
        price: seed.price,
        stock,
        status: stockStatus(stock),
        image,
        description: seed.description,
        motif: seed.motif,
        sizeOptions: seed.sizes,
        material: seed.material,
        origin: 'Handwoven in Bengal',
        shade,
        featured: isHero,
        shopVisible: Boolean(seed.shopVisible && shadeIndex < 3),
      }
      if (shadeIndex === 0) primary.push(product)
      else rest.push(product)
    })
  })
  return [...primary, ...rest]
}

export const SIGNATURE_SLUG = 'signature-silk-scarf-jamdani-cream'
