import { Link } from 'react-router-dom'
import { Chrome } from '../components/Chrome'
import { ImageCarousel } from '../components/Carousel'
import { LangToggle } from '../components/LangToggle'
import { activeCampaigns, useStore } from '../store'
import { tx } from '../i18n'

export function HomePage() {
  const { media, lang } = useStore()
  const t = tx(lang)
  const slides = media.heroSlides.length
    ? media.heroSlides.map((s) => s.image)
    : ['/images/hero-model.jpg']
  const ads = media.ads
  const offers = activeCampaigns(media.campaigns).filter((c) => c.type !== 'coupon')

  return (
    <div className="home">
      <img className="home-stone" src="/images/hero-stone.jpg" alt="" />
      <ImageCarousel
        className="home-model-carousel"
        images={slides}
        seconds={media.heroSeconds}
        alt="Style Heaven product"
      />
      <div className="home-scrim" />
      <header className="home-nav">
        <nav>
          <Link to="/shop">{t.shop}</Link>
          <Link to="/collections">{t.collections}</Link>
          <Link to="/account">{t.account}</Link>
        </nav>
        <div className="home-nav-right">
          <LangToggle light />
          <Link to="/" className="home-logo">
            Style Heaven
          </Link>
        </div>
      </header>
      {ads.length > 0 && (
        <div className="home-ad">
          <ImageCarousel
            images={ads.map((a) => a.image)}
            seconds={media.adSeconds}
            className="ad-strip"
          />
          <Link to={ads[0]?.link || '/shop'} className="ad-copy">
            {ads[0]?.title}
          </Link>
        </div>
      )}
      <main className="home-copy">
        <h1>Style Heaven</h1>
        <p className="tagline">{t.tagline}</p>
        <p className="bn">{lang === 'bn' ? t.taglineBn : t.taglineBn}</p>
        <Link to="/collections" className="ghost-btn">
          {t.explore} <span>→</span>
        </Link>
        {offers.length > 0 && (
          <p className="home-offer">
            {offers[0].title} — {offers[0].value}
          </p>
        )}
      </main>
      <Chrome />
    </div>
  )
}
