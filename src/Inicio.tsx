import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { herramientas, ordenCategorias } from './herramientas'
import estilos from './sitio.module.css'

const REPO = 'https://github.com/juanvasquezdev/herramientas'
const PORTAFOLIO = 'https://juanvasquez.vercel.app'

export function Inicio() {
  // Solo se muestran las categorías que ya tienen al menos una herramienta publicada.
  const grupos = ordenCategorias
    .map((categoria) => ({
      categoria,
      lista: herramientas.filter((herramienta) => herramienta.categoria === categoria),
    }))
    .filter((grupo) => grupo.lista.length > 0)

  return (
    <main className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <h1 className={estilos.titulo}>Herramientas</h1>
        <p className={estilos.entrada}>
          {herramientas.length} herramientas pequeñas que resuelven una tarea concreta de un negocio
          o de un entrenamiento. Corren en el navegador, no piden cuenta y guardan los datos en tu
          equipo.
        </p>
      </header>

      {grupos.map(({ categoria, lista }) => (
        <section key={categoria} className={estilos.grupo} aria-labelledby={`grupo-${categoria}`}>
          <h2 id={`grupo-${categoria}`} className={estilos.categoria}>
            {categoria}
          </h2>
          <ul className={estilos.rejilla}>
            {lista.map(({ ruta, nombre, resumen, Icono }) => (
              <li key={ruta}>
                <Link to={`/${ruta}`} className={estilos.ficha}>
                  <span className={estilos.icono} aria-hidden>
                    <Icono size={20} strokeWidth={1.75} />
                  </span>
                  <span className={estilos.nombre}>{nombre}</span>
                  <span className={estilos.resumen}>{resumen}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <footer className={estilos.pie}>
        <span>
          Hecho por <a href={PORTAFOLIO}>Juan Vasquez</a>
        </span>
        <a href={REPO}>
          Código en GitHub <ArrowUpRight size={13} aria-hidden />
        </a>
      </footer>
    </main>
  )
}
