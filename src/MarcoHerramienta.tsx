import { ArrowLeft } from 'lucide-react'
import { Suspense, useEffect } from 'react'
import { Link } from 'react-router'
import type { Herramienta } from './herramientas'
import estilos from './sitio.module.css'

interface Props {
  herramienta: Herramienta
}

/** Lo que rodea a cada herramienta: la barra para volver y la espera mientras carga. */
export function MarcoHerramienta({ herramienta }: Props) {
  const { nombre, ancha, Pantalla } = herramienta

  useEffect(() => {
    document.title = `${nombre} · Herramientas`
    return () => {
      document.title = 'Herramientas'
    }
  }, [nombre])

  // La barra tiene el mismo ancho que la página de la herramienta, para que queden alineadas.
  const barra = ancha ? `${estilos.barra} ${estilos.barraAncha}` : estilos.barra

  return (
    <>
      <nav className={`${barra} no-impresion`} aria-label="Navegación">
        <Link to="/" className={estilos.volver}>
          <ArrowLeft size={15} aria-hidden /> Herramientas
        </Link>
      </nav>
      <main>
        <Suspense fallback={<p className={estilos.cargando}>Cargando…</p>}>
          <Pantalla />
        </Suspense>
      </main>
    </>
  )
}
