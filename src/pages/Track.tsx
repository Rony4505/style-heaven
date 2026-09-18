import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Chrome, StoreHeader } from '../components/Chrome'
import { useStore } from '../store'
import { formatBdt, type OrderStatus } from '../types'

const STEPS: OrderStatus[] = ['Confirmed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered']

export function TrackPage() {
  const { code } = useParams()
  const { orders } = useStore()
  const [query, setQuery] = useState(code ?? '')
  const order = useMemo(
    () =>
      orders.find(
        (o) =>
          o.trackingNumber.toLowerCase() === query.trim().toLowerCase() ||
          o.id.toLowerCase() === query.trim().toLowerCase(),
      ),
    [orders, query],
  )
  const step = order ? STEPS.indexOf(order.status) : -1

  return (
    <div className="shop-page track-page">
      <StoreHeader />
      <main className="shop-wrap">
        <h1>Track delivery</h1>
        <form
          className="track-form"
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tracking number"
          />
        </form>
        {query && !order && <p className="muted">No shipment found for that number.</p>}
        {order && (
          <section className="track-card">
            <p className="gold">{order.trackingNumber}</p>
            <h2>{order.status}</h2>
            <p>
              {order.customerName} · {order.city}
            </p>
            <ol className="track-steps">
              {STEPS.map((s, i) => (
                <li key={s} className={i <= step ? 'on' : ''}>
                  {s}
                </li>
              ))}
            </ol>
            <ul>
              {order.items.map((item, i) => (
                <li key={i}>
                  {item.name} × {item.qty} — BDT {formatBdt(item.price)}
                </li>
              ))}
            </ul>
            <Link to="/shop" className="gold-btn compact">
              Continue shopping
            </Link>
          </section>
        )}
      </main>
      <Chrome />
    </div>
  )
}
