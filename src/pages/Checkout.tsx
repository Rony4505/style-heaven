import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, CreditCard, FileText, Lock, MapPin, RefreshCcw, Shield } from 'lucide-react'
import { DISTRICTS } from '../data/districts'
import { COUNTRIES, validatePhone } from '../data/countries'
import { activeCampaigns, orderItemsFromCart, useCartLines, useStore } from '../store'
import { formatBdt, colorName, productImage, type PaymentMethod } from '../types'
import { Chrome } from '../components/Chrome'
import { tx } from '../i18n'

const METHODS: { id: PaymentMethod; kind: 'card' | 'wallet' | 'cod' }[] = [
  { id: 'Visa / Mastercard', kind: 'card' },
  { id: 'bKash', kind: 'wallet' },
  { id: 'Nagad', kind: 'wallet' },
  { id: 'Cash on delivery', kind: 'cod' },
]

export function CheckoutPage() {
  const lines = useCartLines()
  const { products, placeOrder, toast, user, lang, media, settings } = useStore()
  const t = tx(lang)
  const [method, setMethod] = useState<PaymentMethod>('bKash')
  const [paid, setPaid] = useState(false)
  const [promo, setPromo] = useState('')
  const [applied, setApplied] = useState(0)
  const [dial, setDial] = useState('880')
  const [form, setForm] = useState({
    name: user?.name && user.role !== 'admin' ? user.name : '',
    email: user?.email && user.role !== 'admin' ? user.email : '',
    phone: '',
    address: '',
    city: '',
    postal: '',
    country: 'Bangladesh',
    district: '',
  })

  const filled = useMemo(() => {
    if (lines.length) return lines
    const fallback = products[0]
    return fallback
      ? [
          {
            productId: fallback.id,
            size: fallback.hasSize ? fallback.sizes[0] : '',
            color: fallback.hasColor ? colorName(fallback.colors[0]) : '',
            qty: 1,
            product: fallback,
          },
        ]
      : []
  }, [lines, products])

  const subtotal = filled.reduce((sum, l) => sum + (l.product?.sellingPrice ?? 0) * l.qty, 0)
  const shipping = form.district
    ? (settings.deliveryCharges[form.district] ?? settings.defaultShipping)
    : settings.defaultShipping
  const discount = Math.round(subtotal * applied)
  const total = Math.max(0, subtotal + shipping - discount)
  const first = filled[0]?.product
  const country = COUNTRIES.find((c) => c.dial === dial)
  const payAccount =
    method === 'Visa / Mastercard'
      ? `${settings.payCardName} · ${settings.payCardNumber}`
      : method === 'bKash'
        ? settings.payBkash
        : method === 'Nagad'
          ? settings.payNagad
          : 'COD'

  const pay = () => {
    if (!form.name || !form.phone || !form.address || !form.city || !form.district) {
      toast(lang === 'bn' ? 'শিপিং তথ্য পূরণ করুন।' : 'Please complete your shipping details.')
      return
    }
    if (!validatePhone(dial, form.phone)) {
      toast(
        lang === 'bn'
          ? 'এই দেশের জন্য ফোন নম্বরটি সঠিক নয়।'
          : `That phone number is not valid for ${country?.name ?? 'this country'}.`,
      )
      return
    }
    if (method !== 'Cash on delivery' && !paid) {
      toast(
        lang === 'bn'
          ? 'পেমেন্ট পাঠানোর পর নিশ্চিত করুন।'
          : 'Confirm that you have sent the payment first.',
      )
      return
    }
    if (!lines.length && !first) {
      toast('Your bag is empty.')
      return
    }
    const guest = !user || user.role === 'admin'
    placeOrder({
      items: orderItemsFromCart(
        filled.map((l) => ({
          productId: l.productId,
          size: l.size,
          color: l.color,
          qty: l.qty,
        })),
        products,
      ),
      subtotal,
      shipping,
      discount,
      total,
      payment: method,
      paymentAccount: payAccount,
      customerName: guest && !user ? form.name : form.name,
      email: form.email,
      phone: form.phone,
      phoneDial: dial,
      address: form.address,
      city: form.city,
      district: form.district,
      postal: form.postal,
      country: country?.name ?? form.country,
      guest: !user || user.role === 'admin',
      userEmail: user && user.role !== 'admin' ? user.email : undefined,
    })
    toast(lang === 'bn' ? 'অর্ডার নিশ্চিত হয়েছে।' : 'Order confirmed.')
  }

  return (
    <div className="checkout-page">
      <header className="checkout-top">
        <Link to="/" className="checkout-brand">
          <span>Style Heaven</span>
          <small>Bangladesh</small>
        </Link>
        <ol className="steps">
          <li className="on">1. {t.shipping}</li>
          <li>2. {t.payment}</li>
          <li>3. {t.confirmation}</li>
        </ol>
        <div className="secure-flag">
          <Lock size={16} />
          <div>
            <strong>Secure checkout</strong>
            <span>256-bit encrypted</span>
          </div>
        </div>
      </header>

      <div className="checkout-grid">
        <aside className="summary-card">
          <h2>
            Order summary <FileText size={18} />
          </h2>
          {filled.map((line) => (
            <div className="summary-item" key={`${line.productId}-${line.size}-${line.color}`}>
              <div className="thumb-wrap">
                <img src={productImage(line.product)} alt="" />
              </div>
              <div>
                <h3>{line.product?.name}</h3>
                <p>
                  {line.size} · {line.color}
                </p>
                <div className="row-between">
                  <strong>BDT {formatBdt(line.product?.sellingPrice ?? 0)}</strong>
                  <em>Qty: {line.qty}</em>
                </div>
              </div>
            </div>
          ))}

          <div className="promo">
            <span className="promo-label">◇ Have a promo code?</span>
            <div className="promo-row">
              <input value={promo} onChange={(e) => setPromo(e.target.value)} />
              <button
                className="gold-btn compact"
                onClick={() => {
                  const hit = activeCampaigns(media.campaigns).find(
                    (c) => c.type === 'coupon' && c.code?.toUpperCase() === promo.trim().toUpperCase(),
                  )
                  if (hit) {
                    setApplied(Number(hit.value) / 100)
                    toast('Promo applied')
                  } else toast('That code is not valid.')
                }}
              >
                Apply
              </button>
            </div>
          </div>

          <dl className="totals">
            <div>
              <dt>{t.subtotal}</dt>
              <dd>BDT {formatBdt(subtotal)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>BDT {formatBdt(shipping)}</dd>
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
          <h1>{t.checkout}</h1>
          <div className="panel">
            <h2>
              <MapPin size={16} /> Shipping address
            </h2>
            <div className="form-grid">
              <label>
                Full name
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label>
                {t.email}
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>
              <label className="full">
                {t.phone}
                <div className="phone">
                  <select
                    value={dial}
                    onChange={(e) => {
                      const next = COUNTRIES.find((c) => c.dial === e.target.value)
                      setDial(e.target.value)
                      setForm({ ...form, country: next?.name ?? form.country })
                    }}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.iso} value={c.dial}>
                        {c.flag} +{c.dial}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder={country?.name === 'Bangladesh' ? '1712345678' : 'Phone number'}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </label>
              <label className="full">
                Address
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </label>
              <label>
                City
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </label>
              <label>
                {t.postalOptional}
                <input
                  value={form.postal}
                  onChange={(e) => setForm({ ...form, postal: e.target.value })}
                />
              </label>
              <label>
                Country
                <select
                  value={form.country}
                  onChange={(e) => {
                    const next = COUNTRIES.find((c) => c.name === e.target.value)
                    setForm({ ...form, country: e.target.value })
                    if (next) setDial(next.dial)
                  }}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.iso}>{c.name}</option>
                  ))}
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
              <CreditCard size={16} /> {t.payment}
            </h2>
            <div className="pay-grid">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  className={`pay-card ${method === m.id ? 'on' : ''} ${m.kind}`}
                  onClick={() => {
                    setMethod(m.id)
                    setPaid(false)
                  }}
                  type="button"
                >
                  {m.id === 'Visa / Mastercard' && (
                    <span className="pay-logos">
                      <i className="visa">VISA</i>
                      <i className="mc" />
                    </span>
                  )}
                  {m.id === 'bKash' && <span className="bkash">bKash</span>}
                  {m.id === 'Nagad' && <span className="nagad">Nagad</span>}
                  {m.id === 'Cash on delivery' && <span className="cod">{t.cod}</span>}
                  <small>{m.id === 'Cash on delivery' ? t.cod : m.id}</small>
                </button>
              ))}
            </div>
            {method !== 'Cash on delivery' && (
              <div className="pay-to">
                <h3>{t.payTo}</h3>
                {method === 'Visa / Mastercard' && (
                  <>
                    <p>
                      <span>{t.cardHolder}</span>
                      <strong>{settings.payCardName}</strong>
                    </p>
                    <p>
                      <span>{t.storeCard}</span>
                      <strong className="mono">{settings.payCardNumber}</strong>
                    </p>
                  </>
                )}
                {method === 'bKash' && (
                  <p>
                    <span>bKash</span>
                    <strong className="mono">{settings.payBkash}</strong>
                  </p>
                )}
                {method === 'Nagad' && (
                  <p>
                    <span>Nagad</span>
                    <strong className="mono">{settings.payNagad}</strong>
                  </p>
                )}
                <label className="check">
                  <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
                  {t.iPaid}
                </label>
              </div>
            )}
            {method === 'Cash on delivery' && (
              <p className="ssl-note">Pay in cash when your order arrives.</p>
            )}
          </div>

          <button className="gold-btn pay-btn" onClick={pay}>
            {method === 'Cash on delivery' ? 'Place order' : t.pay} &nbsp; BDT {formatBdt(total)}{' '}
            <span>→</span>
          </button>
        </section>
      </div>
      <Chrome />
    </div>
  )
}
