import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useStore } from '../store'
import { Chrome } from '../components/Chrome'
import { LangToggle } from '../components/LangToggle'
import { tx } from '../i18n'
import { formatBdt } from '../types'

export function LoginPage() {
  const { login, register, lang } = useStore()
  const navigate = useNavigate()
  const t = tx(lang)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [show, setShow] = useState(false)
  const [mode, setMode] = useState<'in' | 'up'>('in')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    const ok =
      mode === 'up'
        ? register({ name: name || email.split('@')[0], email, password })
        : login(email, password, name)
    if (ok) navigate(email.toLowerCase().includes('admin') ? '/admin' : '/account')
  }

  return (
    <div className="login-page">
      <div className="login-silk silk-animated" />
      <div className="login-panel">
        <LangToggle light />
        <form className="login-card" onSubmit={submit}>
          <div className="sparkle">✦</div>
          <h1>Style Heaven</h1>
          <p className="luxury">Luxury. Redefined.</p>
          <h2>{mode === 'in' ? t.welcomeBack : t.createAccount}</h2>
          <p className="sub">{mode === 'in' ? t.signInSub : t.joinSub}</p>
          {mode === 'up' && (
            <label>
              Name
              <div className="field">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
            </label>
          )}
          <label>
            {t.email}
            <div className="field">
              <Mail size={16} />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </label>
          <label>
            {t.password}
            <div className="field">
              <Lock size={16} />
              <input
                type={show ? 'text' : 'password'}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="eye" onClick={() => setShow((s) => !s)}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
          <button className="gold-btn full continue" type="submit">
            {t.continue} <span>→</span>
          </button>
          <p className="switch">
            {mode === 'in' ? "Don't have an account? " : 'Already a member? '}
            <button type="button" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
              {mode === 'in' ? t.createAccount : t.signIn}
            </button>
          </p>
        </form>
      </div>
      <Chrome />
    </div>
  )
}

export function AccountPage() {
  const { user, logout, orders, setInvoiceOrder } = useStore()
  const navigate = useNavigate()
  if (!user) return <Navigate to="/login" replace />
  const mine = orders.filter((o) =>
    user.role === 'admin' ? true : o.userEmail === user.email || o.email === user.email,
  )

  return (
    <div className="account-page">
      <div className="account-card">
        <p className="luxury">Style Heaven</p>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        <p className="role">{user.role === 'admin' ? 'Super Administrator' : 'Collector'}</p>
        {user.role === 'admin' && (
          <Link className="gold-btn" to="/admin">
            Open back office
          </Link>
        )}
        <div className="order-list">
          <h2>Orders</h2>
          {mine.length === 0 && <p className="muted">No orders yet.</p>}
          {mine.map((o) => (
            <div key={o.id} className="order-row">
              <span>{o.trackingNumber}</span>
              <span>{o.status}</span>
              <strong>BDT {formatBdt(o.total)}</strong>
              <button className="text-btn" onClick={() => setInvoiceOrder(o)}>
                Invoice
              </button>
              <Link to={`/track/${o.trackingNumber}`}>Track</Link>
            </div>
          ))}
        </div>
        <button
          className="text-btn"
          onClick={() => {
            logout()
            navigate('/')
          }}
        >
          Sign out
        </button>
      </div>
      <Chrome />
    </div>
  )
}
