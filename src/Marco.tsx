import { House, Moon, Sun } from 'lucide-react'
import { Suspense, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { unir } from '../shared/ui'
import { useTema } from '../shared/useTema'
import { type Herramienta, herramientas } from './herramientas'
import estilos from './sitio.module.css'

const ID_DEL_DOCK = 'cambiar-de-herramienta'

/** La herramienta de una dirección, o nada si es el inicio o una página que no existe. */
function herramientaDe(direccion: string): Herramienta | undefined {
  const ruta = direccion.replace(/^\/+|\/+$/g, '')
  return herramientas.find((herramienta) => herramienta.ruta === ruta)
}

/**
 * Lo que rodea a todas las pantallas y no cambia al pasar de una a otra: la barra de
 * arriba, el espacio donde entra cada pantalla y la barra de abajo para cambiar.
 */
export function Marco() {
  const { pathname } = useLocation()
  const actual = herramientaDe(pathname)
  const principal = useRef<HTMLElement>(null)
  const anterior = useRef(pathname)

  useEffect(() => {
    document.title = actual ? `${actual.nombre} · Herramientas` : 'Herramientas'
  }, [actual])

  // Al cambiar de pantalla se vuelve arriba y el foco pasa al contenido nuevo, que es lo
  // que haría el navegador si de verdad cargara otra página.
  useEffect(() => {
    if (anterior.current === pathname) return
    anterior.current = pathname
    window.scrollTo(0, 0)
    principal.current?.focus({ preventScroll: true })
  }, [pathname])

  // El inicio usa la página ancha; cada herramienta, la suya. La barra se alinea con ella.
  const ancha = actual ? actual.ancha : true

  return (
    <div className={estilos.marco} data-categoria={actual?.categoria}>
      {/* La barra para cambiar está al final de la página: este atajo lleva a ella con el teclado. */}
      <a href={`#${ID_DEL_DOCK}`} className={unir(estilos.atajo, 'no-impresion')}>
        Ir a cambiar de herramienta
      </a>
      <header className={unir(estilos.barra, ancha && estilos.barraAncha, 'no-impresion')}>
        <Link to="/" className={estilos.marca}>
          <span className={estilos.puntos} aria-hidden>
            <span data-categoria="negocio" />
            <span data-categoria="deporte" />
            <span data-categoria="contenido" />
            <span data-categoria="experimentos" />
          </span>
          Herramientas
        </Link>
        <BotonTema />
      </header>

      <main ref={principal} tabIndex={-1} className={estilos.contenido}>
        <Suspense fallback={<p className={estilos.cargando}>Cargando…</p>}>
          {/* La clave hace que cada pantalla sea un elemento nuevo, y por eso entra animada. */}
          <div key={pathname} className={estilos.entra}>
            <Outlet />
          </div>
        </Suspense>
      </main>

      <Dock actual={actual} enInicio={pathname === '/'} />
    </div>
  )
}

function BotonTema() {
  const [tema, alternar] = useTema()
  const oscuro = tema === 'oscuro'
  return (
    <button
      type="button"
      className={estilos.tema}
      onClick={alternar}
      aria-label={oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={oscuro ? 'Tema claro' : 'Tema oscuro'}
    >
      {oscuro ? <Sun size={19} aria-hidden /> : <Moon size={19} aria-hidden />}
    </button>
  )
}

interface DockProps {
  actual: Herramienta | undefined
  enInicio: boolean
}

/** La barra de abajo: el inicio y todas las herramientas, siempre a un clic. */
function Dock({ actual, enInicio }: DockProps) {
  const lista = useRef<HTMLUListElement>(null)

  // En celular la barra no cabe entera y se desliza: se deja a la vista la que está abierta.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `actual` y `enInicio` son la señal de que cambió la pantalla
  useEffect(() => {
    const barra = lista.current
    const abierta = barra?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!barra || !abierta) return
    const centrada = abierta.offsetLeft - (barra.clientWidth - abierta.clientWidth) / 2
    barra.scrollTo({ left: centrada })
  }, [actual, enInicio])

  return (
    <nav
      id={ID_DEL_DOCK}
      tabIndex={-1}
      className={unir(estilos.dock, 'no-impresion')}
      aria-label="Cambiar de herramienta"
    >
      <ul ref={lista} className={estilos.dockLista}>
        <li>
          <NavLink
            to="/"
            end
            className={unir(estilos.dockItem, estilos.dockInicio, enInicio && estilos.dockActivo)}
          >
            <House size={20} strokeWidth={1.75} aria-hidden />
            Inicio
          </NavLink>
        </li>
        <li className={estilos.dockSeparador} aria-hidden />
        {herramientas.map((herramienta) => {
          const { ruta, nombre, corto, categoria, Icono, precargar } = herramienta
          return (
            <li key={ruta}>
              <NavLink
                to={`/${ruta}`}
                className={unir(estilos.dockItem, herramienta === actual && estilos.dockActivo)}
                data-categoria={categoria}
                title={nombre}
                onPointerEnter={precargar}
                onFocus={precargar}
              >
                <Icono size={20} strokeWidth={1.75} aria-hidden />
                {/* El nombre completo es para quien usa lector de pantalla; el corto, para la vista. */}
                <span aria-hidden>{corto}</span>
                <span className="ui-oculto">{nombre}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
