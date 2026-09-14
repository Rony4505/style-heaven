import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Home, LayoutGrid, Lock, Mail, Phone, ShoppingBag, UserRound } from 'lucide-react'
import { useStore } from '../store'
import { Chrome } from '../components/Chrome'
import { LangToggle } from '../components/LangToggle'
import { tx } from '../i18n'
import { formatBdt, type AuthProvider } from '../types'

function prettyName(email: string) {
  const local = email.split('@')[0] || ''
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.8-6.7 7.5l6.3 5.3C37.9 38.3 44 33 44 24c0-1.3-.1-2.5-.4-3.5z" />
    </svg>
  )
}

function FacebookMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.54-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.5 0-1.96.93-1.96 1.89v2.26h3.34l-.53 3.49h-2.81V24C19.61 23.09 24 18.1 24 12.07z" />
    </svg>
  )
}

function AppleMark() {
  return (
    <svg width="16" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d="M16.37 12.43c.03 3.3 2.89 4.4 2.92 4.41-.02.08-.45 1.56-1.5 3.09-.9 1.32-1.84 2.63-3.31 2.66-1.45.03-1.91-.86-3.57-.86s-2.18.83-3.54.89c-1.42.06-2.51-1.43-3.42-2.75-1.86-2.7-3.28-7.63-1.37-10.96 1-1.74 2.78-2.84 4.71-2.87 1.47-.03 2.86 1 3.57 1 .7 0 2.29-1.23 3.86-1.05.66.03 2.5.27 3.69 2.01-.1.06-2.2 1.29-2.04 3.43zM13.6 5.3c.79-.96 1.33-2.3 1.18-3.63-1.14.05-2.52.76-3.34 1.72-.73.85-1.37 2.22-1.2 3.53 1.27.1 2.57-.65 3.36-1.62z" />
    </svg>
  )
}

export function LoginPage() {
  const { login, register, socialLogin, lang, user } = useStore()
  const navigate = useNavigate()
  const t = tx(lang)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [show, setShow] = useState(false)
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [social, setSocial] = useState<AuthProvider | null>(null)
  const [socialEmail, setSocialEmail] = useState('')
  const [socialName, setSocialName] = useState('')
  const [nameLocked, setNameLocked] = useState(true)

  useEffect(() => {
    if (user) navigate(user.role === 'customer' ? '/account' : '/admin', { replace: true })
  }, [user, navigate])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'up') {
      if (!name || !email || !phone || !password) return
      register({ name, email, password, phone, provider: 'email' })
      return
    }
    if (!email || !password) return
    login(email, password, name, phone)
  }

  const confirmSocial = (e: React.FormEvent) => {
    e.preventDefault()
    if (!social) return
    const ok = socialLogin(social, { name: socialName, email: socialEmail })
    if (ok) setSocial(null)
  }

  return (
    <div className="login-page">
      <div className="login-silk silk-animated" />
      <div className="login-scrim" />
      <nav className="login-icons">
        <Link to="/" aria-label={t.home} title={t.home}>
          <Home size={20} strokeWidth={1.6} />
        </Link>
        <Link to="/shop" aria-label={t.shop} title={t.shop}>
          <ShoppingBag size={20} strokeWidth={1.6} />
        </Link>
        <Link to="/collections" aria-label={t.collections} title={t.collections}>
          <LayoutGrid size={20} strokeWidth={1.6} />
        </Link>
      </nav>
      <LangToggle light fixed />
      <div className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="sparkle">✦</div>
          <h1>Style Heaven</h1>
          <p className="luxury">Luxury. Redefined.</p>
          <h2>{mode === 'in' ? t.welcomeBack : t.createAccount}</h2>
          <p className="sub">{mode === 'in' ? t.signInSub : t.joinSub}</p>
          {mode === 'up' && (
            <>
              <label>
                {t.name}
                <div className="field">
                  <UserRound size={16} />
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.name} />
                </div>
              </label>
              <label>
                {t.phone}
                <div className="field">
                  <Phone size={16} />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
                </div>
              </label>
            </>
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
          {mode === 'up' && (
            <>
              <p className="or">{t.orEasy}</p>
              <div className="socials three">
                <button
                  type="button"
                  onClick={() => {
                    setSocial('google')
                    setSocialEmail('')
                    setSocialName('')
                    setNameLocked(true)
                  }}
                >
                  <GoogleMark /> Google
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSocial('facebook')
                    setSocialEmail('')
                    setSocialName('')
                    setNameLocked(true)
                  }}
                >
                  <FacebookMark /> Facebook
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSocial('apple')
                    setSocialEmail('')
                    setSocialName('')
                    setNameLocked(true)
                  }}
                >
                  <AppleMark /> Apple
                </button>
              </div>
            </>
          )}
          <p className="switch">
            {mode === 'in' ? "Don't have an account? " : 'Already a member? '}
            <button type="button" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
              {mode === 'in' ? t.createAccount : t.signIn}
            </button>
          </p>
        </form>
      </div>
      {social && (
        <div className="overlay" onClick={() => setSocial(null)}>
          <form className="modal social-modal" onClick={(e) => e.stopPropagation()} onSubmit={confirmSocial}>
            <h2>
              {t.continueWith} {social === 'google' ? 'Google' : social === 'facebook' ? 'Facebook' : 'Apple'}
            </h2>
            <label>
              {t.email}
              <input
                type="email"
                required
                value={socialEmail}
                onChange={(e) => {
                  setSocialEmail(e.target.value)
                  if (nameLocked) setSocialName(prettyName(e.target.value))
                }}
              />
            </label>
            <label>
              {t.name}
              <input
                value={socialName}
                onChange={(e) => {
                  setNameLocked(false)
                  setSocialName(e.target.value)
                }}
              />
            </label>
            <p className="muted">{t.nameAuto}</p>
            <div className="modal-actions">
              <button type="button" className="ghost" onClick={() => setSocial(null)}>
                Cancel
              </button>
              <button className="gold-btn compact" type="submit">
                {t.continue}
              </button>
            </div>
          </form>
        </div>
      )}
      <Chrome />
    </div>
  )
}

export function AccountPage() {
  const { user, logout, orders, setInvoiceOrder } = useStore()
  const navigate = useNavigate()
  if (!user) return <Navigate to="/login" replace />
  const mine = orders.filter((o) =>
    user.role === 'admin' || user.role === 'moderator'
      ? true
      : o.userEmail === user.email || o.email === user.email,
  )

  return (
    <div className="account-page">
      <div className="account-card">
        <p className="luxury">Style Heaven</p>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        {user.phone && <p>{user.phone}</p>}
        <p className="role">
          {user.role === 'admin' ? 'Super Administrator' : user.role === 'moderator' ? 'Moderator' : 'Collector'}
        </p>
        {(user.role === 'admin' || user.role === 'moderator') && (
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
