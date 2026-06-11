import type { Lang } from '@/contexts/LanguageContext'

/**
 * Returns the URL for the given path in the given language.
 *
 * EN:  lp('en', '/book')  →  '/book'
 * IT:  lp('it', '/book')  →  '/it/book'
 * IT:  lp('it', '/')      →  '/it'
 */
export function lp(lang: Lang, path: string): string {
  if (lang === 'it') {
    return path === '/' ? '/it' : `/it${path}`
  }
  return path
}
