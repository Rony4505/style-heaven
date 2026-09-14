import { Link } from 'react-router-dom'
import { Chrome } from '../components/Chrome'

export function HomePage() {
  return (
    <div className="home">
      <img className="home-stone" src="/images/hero-stone.jpg" alt="" />
      <img className="home-model" src="/images/hero-model.jpg" alt="Style Heaven muse in a gold jamdani saree" />
      <div className="home-scrim" />
      <header className="home-nav">
        <nav>
          <Link to="/shop">Shop</Link>
          <Link to="/collections">Collections</Link>
          <Link to="/account">Account</Link>
        </nav>
        <Link to="/" className="home-logo">
          Style Heaven
        </Link>
      </header>
      <main className="home-copy">
        <h1>Style Heaven</h1>
        <p className="tagline">Heritage, woven in light.</p>
        <p className="bn">ঐতিহ্য, আলোতে বোনা.</p>
        <Link to="/collections" className="ghost-btn">
          Explore collections <span>→</span>
        </Link>
      </main>
      <Chrome />
    </div>
  )
}
