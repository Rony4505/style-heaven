import { useStore } from '../store'

export function LangToggle({ light = false }: { light?: boolean }) {
  const { lang, setLang } = useStore()
  return (
    <div className={`lang-toggle ${light ? 'light' : ''}`} role="group" aria-label="Language">
      <button type="button" className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>
        EN
      </button>
      <button type="button" className={lang === 'bn' ? 'on' : ''} onClick={() => setLang('bn')}>
        বাং
      </button>
    </div>
  )
}
