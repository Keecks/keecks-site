'use client'
import { createContext, useContext, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export type Lang = 'en' | 'it'

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
})

// Map the current path to its counterpart in the other language.
function pathForLang(pathname: string, lang: Lang): string {
  if (lang === 'it') {
    // EN → IT: prefix with /it ('/' becomes '/it')
    return pathname === '/' ? '/it' : `/it${pathname}`
  }
  // IT → EN: strip the leading /it ('/it' becomes '/')
  return pathname.replace(/^\/it/, '') || '/'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/'
  const router = useRouter()

  // Language is derived from the URL: any /it* path is Italian, everything else English.
  // This keeps refreshes, deep links and the cookie banner in the correct language.
  const lang: Lang = pathname === '/it' || pathname.startsWith('/it/') ? 'it' : 'en'

  const setLang = (l: Lang) => {
    if (l === lang) return
    router.push(pathForLang(pathname, l))
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
