import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { CLAVE_TEMA, esTema, otroTema, type Tema, temaInicial } from './tema'

const CONSULTA_OSCURO = '(prefers-color-scheme: dark)'
const CONSULTA_SIN_MOVIMIENTO = '(prefers-reduced-motion: reduce)'

/** Lo que la persona eligió, o null si no ha elegido o el navegador bloquea el guardado. */
function leerGuardado(): string | null {
  try {
    return window.localStorage.getItem(CLAVE_TEMA)
  } catch {
    return null
  }
}

function temaActual(): Tema {
  // index.html ya lo dejó puesto antes de pintar; esto es por si ese script no corrió.
  const puesto = document.documentElement.dataset.tema
  if (esTema(puesto)) return puesto
  return temaInicial(leerGuardado(), window.matchMedia(CONSULTA_OSCURO).matches)
}

/**
 * El tema y la función para alternarlo. El tema vive en <html data-tema="…">, que es de
 * donde lo leen los estilos; el estado de React solo sirve para pintar el botón.
 */
export function useTema(): [Tema, () => void] {
  const [tema, setTema] = useState<Tema>(temaActual)

  // Si la persona no ha elegido y cambia el tema del equipo, el sitio lo sigue.
  useEffect(() => {
    const consulta = window.matchMedia(CONSULTA_OSCURO)
    const seguirAlEquipo = () => {
      if (esTema(leerGuardado())) return
      const nuevo: Tema = consulta.matches ? 'oscuro' : 'claro'
      document.documentElement.dataset.tema = nuevo
      setTema(nuevo)
    }
    consulta.addEventListener('change', seguirAlEquipo)
    return () => consulta.removeEventListener('change', seguirAlEquipo)
  }, [])

  const alternar = () => {
    const nuevo = otroTema(tema)
    try {
      window.localStorage.setItem(CLAVE_TEMA, nuevo)
    } catch {
      // Sin guardado el cambio vale igual, solo que no se recuerda.
    }

    const aplicar = () => {
      document.documentElement.dataset.tema = nuevo
      flushSync(() => setTema(nuevo))
    }

    // Donde el navegador lo permite, el cambio de colores entra con un fundido.
    const conFundido =
      'startViewTransition' in document && !window.matchMedia(CONSULTA_SIN_MOVIMIENTO).matches
    if (conFundido) document.startViewTransition(aplicar)
    else aplicar()
  }

  return [tema, alternar]
}
