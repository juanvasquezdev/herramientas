import { ArrowUpRight, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { contarPorCategoria, type FiltroCategoria, filtrar, leerCategoria } from './filtro'
import { type Categoria, herramientas, NOMBRE_DE_CATEGORIA } from './herramientas'
import estilos from './sitio.module.css'

const REPO = 'https://github.com/juanvasquezdev/herramientas'
const PORTAFOLIO = 'https://juanvasquez.vercel.app'
const FILTROS: FiltroCategoria[] = ['todas', ...(Object.keys(NOMBRE_DE_CATEGORIA) as Categoria[])]
const cuenta = contarPorCategoria(herramientas)

/** La dirección que corresponde a una búsqueda: sin parámetros cuando no hay filtro. */
function direccion(q: string, c: FiltroCategoria) {
  const siguiente = new URLSearchParams()
  if (q) siguiente.set('q', q)
  if (c !== 'todas') siguiente.set('c', c)
  return siguiente
}

export function Inicio() {
  // La búsqueda y la categoría van en la dirección: se pueden compartir y sobreviven al recargar.
  // El texto se maneja aquí y se copia a la dirección un momento después: si el campo leyera
  // directo de la dirección, al escribir rápido se perderían letras (la navegación es asíncrona).
  const [params, setParams] = useSearchParams()
  const [texto, setTexto] = useState(() => params.get('q') ?? '')
  const categoria = leerCategoria(params.get('c'))
  const buscador = useRef<HTMLInputElement>(null)
  const visibles = useMemo(() => filtrar(herramientas, texto, categoria), [texto, categoria])

  useEffect(() => {
    if ((params.get('q') ?? '') === texto) return
    const espera = setTimeout(() => setParams(direccion(texto, categoria), { replace: true }), 250)
    return () => clearTimeout(espera)
  }, [texto, categoria, params, setParams])

  function cambiar(q: string, c: FiltroCategoria) {
    setTexto(q)
    if (c !== categoria) setParams(direccion(q, c), { replace: true })
  }

  // "/" lleva al buscador, como en GitHub o en la documentación de muchos sitios.
  useEffect(() => {
    function alTeclear(e: KeyboardEvent) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const destino = e.target as HTMLElement | null
      if (destino?.closest('input, textarea, select, [contenteditable="true"]')) return
      e.preventDefault()
      buscador.current?.focus()
    }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [])

  return (
    <div className={estilos.inicio}>
      <header className={estilos.cabecera}>
        <h1 className={estilos.titular}>Herramientas</h1>
        <p className={estilos.entrada}>
          {herramientas.length} herramientas pequeñas que resuelven una tarea concreta de un negocio
          o de un entrenamiento. Corren en el navegador, no piden cuenta y guardan los datos en tu
          equipo.
        </p>
      </header>

      <search className={estilos.filtros}>
        <div className={estilos.buscador}>
          <Search size={17} aria-hidden className={estilos.lupa} />
          <label htmlFor="buscar" className="ui-oculto">
            Buscar herramienta
          </label>
          <input
            ref={buscador}
            id="buscar"
            type="search"
            value={texto}
            onChange={(e) => cambiar(e.target.value, categoria)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && texto) {
                e.preventDefault()
                cambiar('', categoria)
              }
            }}
            placeholder="Buscar: cotización, PDF, salto…"
            autoComplete="off"
            spellCheck={false}
          />
          {texto ? (
            <button
              type="button"
              className={estilos.limpiar}
              onClick={() => {
                cambiar('', categoria)
                buscador.current?.focus()
              }}
              aria-label="Borrar la búsqueda"
            >
              <X size={15} aria-hidden />
            </button>
          ) : (
            <kbd className={estilos.tecla} aria-hidden>
              /
            </kbd>
          )}
        </div>
        <fieldset className={estilos.chips} aria-label="Filtrar por categoría">
          {FILTROS.map((c) => (
            <button
              key={c}
              type="button"
              className={estilos.chip}
              aria-pressed={categoria === c}
              onClick={() => cambiar(texto, c)}
            >
              {c === 'todas' ? 'Todas' : NOMBRE_DE_CATEGORIA[c]}
              <span className={estilos.chipCuenta}>{cuenta[c]}</span>
            </button>
          ))}
        </fieldset>
      </search>

      <p className={estilos.conteo} role="status" aria-live="polite">
        {visibles.length === herramientas.length
          ? `${herramientas.length} herramientas`
          : `${visibles.length} de ${herramientas.length} herramientas`}
      </p>

      {visibles.length > 0 ? (
        <ul className={estilos.rejilla}>
          {visibles.map(({ ruta, nombre, resumen, categoria: cat, Icono, precargar }) => (
            <li key={ruta}>
              <Link
                to={`/${ruta}`}
                className={estilos.ficha}
                data-categoria={cat}
                onPointerEnter={precargar}
                onFocus={precargar}
              >
                <span className={estilos.mosaico} aria-hidden>
                  <Icono size={26} strokeWidth={1.75} />
                </span>
                <span className={estilos.nombre}>{nombre}</span>
                <span className={estilos.resumen}>{resumen}</span>
                <span className={estilos.categoria}>{NOMBRE_DE_CATEGORIA[cat]}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className={estilos.vacio}>
          <p>Ninguna herramienta coincide con “{texto}”.</p>
          <button type="button" className={estilos.chip} onClick={() => cambiar('', 'todas')}>
            Ver todas
          </button>
        </div>
      )}

      <footer className={estilos.pie}>
        <span>
          Hecho por <a href={PORTAFOLIO}>Juan Vasquez</a> · H&amp;J Company
        </span>
        <a href={REPO}>
          Código en GitHub <ArrowUpRight size={13} aria-hidden />
        </a>
      </footer>
    </div>
  )
}
