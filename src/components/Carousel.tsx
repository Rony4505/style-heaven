import { useEffect, useState } from 'react'

export function ImageCarousel({
  images,
  seconds = 4,
  alt = '',
  className = '',
}: {
  images: string[]
  seconds?: number
  alt?: string
  className?: string
}) {
  const list = images.filter(Boolean)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [list.join('|')])

  useEffect(() => {
    if (list.length < 2) return
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % list.length),
      Math.max(2, seconds) * 1000,
    )
    return () => window.clearInterval(id)
  }, [list.length, seconds])

  if (!list.length) return <div className={`carousel ${className}`} />

  return (
    <div className={`carousel ${className}`}>
      {list.map((src, i) => (
        <img key={`${src}-${i}`} src={src} alt={alt} className={i === index ? 'on' : ''} />
      ))}
      {list.length > 1 && (
        <div className="carousel-dots">
          {list.map((_, i) => (
            <button
              key={i}
              className={i === index ? 'on' : ''}
              aria-label={`Image ${i + 1}`}
              onClick={() => setIndex(i)}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  )
}
