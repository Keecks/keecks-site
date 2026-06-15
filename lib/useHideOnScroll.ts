'use client'
import { useState, useEffect } from 'react'

/**
 * Comportamento navbar condiviso (home + book + landing):
 * - `scrolled`: true oltre i 30px → sfondo/blur della nav
 * - `hidden`:   nascondi scrollando verso il basso, rimostra scrollando su
 *   (la nav resta visibile in cima e sparisce in base allo scroll)
 *
 * @param holdViewports  numero di viewport entro cui la nav resta SEMPRE
 *   visibile (sulla home l'hero a fotogrammi è pinnato per 3× viewport: la nav
 *   deve sparire solo dopo, quando la pagina inizia a scorrere davvero).
 */
export function useHideOnScroll(holdViewports = 0) {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden]     = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const holdUntil = holdViewports * window.innerHeight
      setScrolled(y > 30)
      if (y < holdUntil)            setHidden(false)  // durante i fotogrammi → sempre visibile
      else if (y > lastY && y > 50) setHidden(true)   // scroll giù → nascondi
      else if (y < lastY)           setHidden(false)  // scroll su → mostra
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [holdViewports])

  return { scrolled, hidden }
}
