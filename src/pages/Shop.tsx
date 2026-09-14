import { Link, useSearchParams } from 'react-router-dom'
import { Chrome, StoreHeader } from '../components/Chrome'
import { useStore } from '../store'
import { formatBdt } from '../types'

export function ShopPage() {
  const { products } = useStore()
  const [params] = useSearchParams()
  const category = params.get('category')
  const collection = params.get('collection')
  const list = products.filter((p) => {
    if (!p.shopVisible) return false
    if (category && p.category !== category) return false
    if (collection && p.collection !== collection) return false
    return true
  })

  return (
    <div className="shop-page">
      <StoreHeader />
      <main className="shop-wrap">
        <p className="crumbs">
          <Link to="/">Home</Link> <span>/</span> {category || collection || 'Shop'}
        </p>
        <h1>{category || collection || 'The collection'}</h1>
        <p className="shop-intro">Heritage silk, cut for the present.</p>
        <div className="product-grid">
          {list.map((p) => (
            <Link to={`/product/${p.slug}`} className="product-card" key={p.id}>
              <div className="card-img">
                <img src={p.image} alt={p.name} />
              </div>
              <h3>{p.name}</h3>
              <p>{p.shade}</p>
              <strong>৳ {formatBdt(p.price)}</strong>
            </Link>
          ))}
        </div>
      </main>
      <Chrome />
    </div>
  )
}

export function CollectionsPage() {
  const collections = [
    {
      title: 'Signature Scarves',
      copy: 'Jamdani motifs on mulberry silk.',
      to: '/shop?category=Scarves',
      image: '/images/scarf-jamdani.jpg',
    },
    {
      title: 'Sarees',
      copy: 'Heritage, woven in light.',
      to: '/shop?category=Sarees',
      image: '/images/hero-model.jpg',
    },
    {
      title: 'Ready to Wear',
      copy: 'Blouses, kaftans, evening silk.',
      to: '/shop?category=Dresses',
      image: '/images/silk-charcoal.jpg',
    },
    {
      title: 'Maison',
      copy: 'Silk for the private rooms of the house.',
      to: '/shop?category=Accessories',
      image: '/images/silk-ivory.jpg',
    },
  ]

  return (
    <div className="shop-page collections-page">
      <StoreHeader />
      <main className="shop-wrap">
        <p className="crumbs">
          <Link to="/">Home</Link> <span>/</span> Collections
        </p>
        <h1>Collections</h1>
        <div className="collection-grid">
          {collections.map((c) => (
            <Link to={c.to} className="collection-card" key={c.title}>
              <img src={c.image} alt="" />
              <div>
                <h2>{c.title}</h2>
                <p>{c.copy}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Chrome />
    </div>
  )
}
