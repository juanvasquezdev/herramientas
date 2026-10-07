import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { herramientas, NOMBRE_DE_CATEGORIA } from './herramientas'
import estilos from './sitio.module.css'

const REPO = 'https://github.com/juanvasquezdev/herramientas'
const PORTAFOLIO = 'https://juanvasquez.vercel.app'

export function Inicio() {
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

      <ul className={estilos.rejilla}>
        {herramientas.map(({ ruta, nombre, resumen, categoria, Icono, precargar }) => (
          <li key={ruta}>
            <Link
              to={`/${ruta}`}
              className={estilos.ficha}
              data-categoria={categoria}
              onPointerEnter={precargar}
              onFocus={precargar}
            >
              <span className={estilos.mosaico} aria-hidden>
                <Icono size={26} strokeWidth={1.75} />
              </span>
              <span className={estilos.nombre}>{nombre}</span>
              <span className={estilos.resumen}>{resumen}</span>
              <span className={estilos.categoria}>{NOMBRE_DE_CATEGORIA[categoria]}</span>
            </Link>
          </li>
        ))}
      </ul>

      <footer className={estilos.pie}>
        <span>
          Hecho por <a href={PORTAFOLIO}>Juan Vasquez</a>
        </span>
        <a href={REPO}>
          Código en GitHub <ArrowUpRight size={13} aria-hidden />
        </a>
      </footer>
    </div>
  )
}
