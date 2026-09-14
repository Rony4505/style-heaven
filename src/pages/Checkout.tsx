import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  FileText,
  Lock,
  MapPin,
  RefreshCcw,
  Shield,
  CreditCard,
} from 'lucide-react'
import { DISTRICTS } from '../data/districts'
import { useCartLines, useStore } from '../store'
import { formatBdt } from '../types'
import { Chrome } from '../components/Chrome'

const METHODS = [
  { id: 'card', label: 'Visa / Mastercard', kind: 'card' },
  { id: 'bkash', label: 'bKash', kind: 'wallet' },
  { id: 'nagad', label: 'Nagad', kind: 'wallet' },
  { id: 'ssl', label: 'SSLCommerz Secure Gateway', kind: 'gateway' },
] as const

export function CheckoutPage() {
  const lines = useCartLines()
  const { products, addToCart, placeOrder, toast } = useStore()
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [method, setMethod] = useState('card')
  const [promo, setPromo] = useState('')
  const [applied, setApplied] = useState(0)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    postal: '',
    country: 'Bangladesh',
    district: '',
  })

  const filled = useMemo(() => {
    if (lines.length) return lines
    const fallback =
      products.find((p) => p.name === 'Silk Charmeuse Scarf' && p.shade === 'Champagne Gold') ||
      products.find((p) => p.price === 18500) ||
      products[0]
    return fallback
      ? [{ productId: fallback.id, size: fallback.sizeOptions[0], qty: 1, product: fallback }]
      : []
  }, [lines, products])

  const subtotal = filled.reduce((sum, l) => sum + (l.product?.price ?? 0) * l.qty, 0)
  const shipping = 120
  const tax = 0
  const discount = Math.round(subtotal * applied)
  const total = Math.max(0, subtotal + shipping + tax - discount)
  const first = filled[0]?.product

  const pay = () => {
    if (!form.name || !form.phone || !form.address || !form.city || !form.district) {
      toast('Please complete your shipping details.')
      return
    }
    if (!lines.length && first) {
      addToCart(first.id, first.sizeOptions[0])
    }
    const order = placeOrder({
      customer: form.name,
      payment: METHODS.find((m) => m.id === method)?.label ?? method,
      total,
      items: filled.map((l) => ({
        name: l.product?.name ?? 'Item',
        qty: l.qty,
        price: l.product?.price ?? 0,
      })),
    })
    setStep(3)
    navigate(`/checkout/confirmation?order=${order.id}&total=${total}`)
  }

  return (
    <div className="checkout-page">
      <header className="checkout-top">
        <Link to="/" className="checkout-brand">
          <span>Style Heaven</span>
          <small>Bangladesh</small>
        </Link>
        <ol className="steps">
          <li className={step === 1 ? 'on' : ''}>1. Shipping</li>
          <li>2. Payment</li>
          <li>3. Confirmation</li>
        </ol>
        <div className="secure-flag">
          <Lock size={16} />
          <div>
            <strong>Secure checkout</strong>
            <span>256-bit SSL encrypted</span>
          </div>
        </div>
      </header>

      <div className="checkout-grid">
        <aside className="summary-card">
          <h2>
            Order summary <FileText size={18} />
          </h2>
          {first && (
            <div className="summary-item">
              <div className="thumb-wrap">
                <img src={first.image} alt="" />
                <span className="silk-badge">100% Silk</span>
              </div>
              <div>
                <h3>{first.name.replace('Signature ', '')}</h3>
                <p>
                  {first.material} • {filled[0].size}
                </p>
                <p>Shade: {first.shade}</p>
                <div className="row-between">
                  <strong>BDT {formatBdt(first.price)}</strong>
                  <em>Qty: {filled[0].qty}</em>
                </div>
              </div>
            </div>
          )}

          <div className="promo">
            <span className="promo-label">◇ Have a promo code?</span>
            <div className="promo-row">
              <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="" />
              <button
                className="gold-btn compact"
                onClick={() => {
                  if (promo.trim().toUpperCase() === 'HEAVEN10') {
                    setApplied(0.1)
                    toast('Promo applied: 10% off')
                  } else {
                    toast('That code is not valid.')
                  }
                }}
              >
                Apply
              </button>
            </div>
          </div>

          <dl className="totals">
            <div>
              <dt>Subtotal</dt>
              <dd>BDT {formatBdt(subtotal)}</dd>
            </div>
            <div>
              <dt>Shipping (Inside Bangladesh)</dt>
              <dd>BDT {formatBdt(shipping)}</dd>
            </div>
            <div>
              <dt>Tax (Included)</dt>
              <dd>BDT {formatBdt(tax)}</dd>
            </div>
            {discount > 0 && (
              <div>
                <dt>Promo</dt>
                <dd>− BDT {formatBdt(discount)}</dd>
              </div>
            )}
            <div className="grand">
              <dt>Total</dt>
              <dd>BDT {formatBdt(total)}</dd>
            </div>
          </dl>
          <p className="tax-note">
            <Shield size={14} /> All prices include applicable taxes.
          </p>

          <div className="trust-row">
            <article>
              <Lock size={18} />
              <div>
                <strong>Secure checkout</strong>
                <p>Your payment information is encrypted and secure.</p>
              </div>
            </article>
            <ul>
              <li>
                <BadgeCheck size={16} /> Trusted by 50,000+ customers
              </li>
              <li>
                <Lock size={16} /> Secure payments
              </li>
              <li>
                <RefreshCcw size={16} /> Easy returns
              </li>
            </ul>
          </div>
        </aside>

        <section className="checkout-main">
          <h1>Checkout</h1>
          <p className="lede">Please review your order and complete your details.</p>

          <div className="panel">
            <h2>
              <MapPin size={16} /> Shipping address
            </h2>
            <div className="form-grid">
              <label>
                Full name
                <input
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label>
                Phone number
                <div className="phone">
                  <span>🇧🇩 +880</span>
                  <input
                    placeholder="Enter your phone number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </label>
              <label className="full">
                Address
                <input
                  placeholder="Enter your street address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </label>
              <label>
                City
                <input
                  placeholder="Enter your city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </label>
              <label>
                Postal code
                <input
                  placeholder="Enter postal code"
                  value={form.postal}
                  onChange={(e) => setForm({ ...form, postal: e.target.value })}
                />
              </label>
              <label>
                Country
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                >
                  <option>Bangladesh</option>
                </select>
              </label>
              <label>
                District
                <select
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                >
                  <option value="">Select district</option>
                  {DISTRICTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="panel">
            <h2>
              <CreditCard size={16} /> Payment method
            </h2>
            <p className="mini">Choose your preferred payment method</p>
            <div className="pay-grid">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  className={`pay-card ${method === m.id ? 'on' : ''} ${m.id}`}
                  onClick={() => setMethod(m.id)}
                  type="button"
                >
                  {m.id === 'card' && (
                    <span className="pay-logos">
                      <i className="visa">VISA</i>
                      <i className="mc" />
                    </span>
                  )}
                  {m.id === 'bkash' && <span className="bkash">bKash</span>}
                  {m.id === 'nagad' && <span className="nagad">Nagad</span>}
                  {m.id === 'ssl' && (
                    <span className="ssl">
                      <b>▲</b> SSLCommerz
                    </span>
                  )}
                  <small>{m.label.includes('Gateway') ? 'Secure Gateway' : m.label}</small>
                </button>
              ))}
            </div>
            <p className="ssl-note">
              <Lock size={12} /> Secure & encrypted payments · Powered by SSLCommerz
            </p>
          </div>

          <button className="gold-btn pay-btn" onClick={pay}>
            Pay securely &nbsp; BDT {formatBdt(total)} <span>→</span>
          </button>
          <p className="fineprint">
            <Lock size={12} /> Your payment is secure and encrypted. You will receive an order
            confirmation via email and SMS.
          </p>
        </section>
      </div>
      <Chrome />
    </div>
  )
}

export function ConfirmationPage() {
  const params = new URLSearchParams(window.location.search)
  const id = params.get('order') || 'SH-000000'
  const total = params.get('total') || '0'

  return (
    <div className="checkout-page confirm-page">
      <header className="checkout-top">
        <Link to="/" className="checkout-brand">
          <span>Style Heaven</span>
          <small>Bangladesh</small>
        </Link>
        <ol className="steps">
          <li>1. Shipping</li>
          <li>2. Payment</li>
          <li className="on">3. Confirmation</li>
        </ol>
        <div className="secure-flag">
          <Lock size={16} />
          <div>
            <strong>Order confirmed</strong>
            <span>Receipt sent by SMS & email</span>
          </div>
        </div>
      </header>
      <div className="confirm-card">
        <p className="motif">Thank you</p>
        <h1>Your order is placed.</h1>
        <p>
          Order <strong>{id}</strong>
        </p>
        <p>Total paid BDT {formatBdt(Number(total))}</p>
        <Link to="/shop" className="gold-btn">
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
