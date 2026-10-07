import { ArrowRight } from 'lucide-react'
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
          Herramientas pequeñas que resuelven una tarea concreta de un negocio o de un
          entrenamiento. Corren en el navegador, no piden cuenta y guardan los datos en tu equipo.
        </p>
      </header>

      {grupos.map(({ categoria, lista }) => (
        <section key={categoria} className={estilos.grupo}>
          <h2 className={estilos.categoria}>{categoria}</h2>
          <ul className={estilos.rejilla}>
            {lista.map((herramienta) => (
              <li key={herramienta.ruta}>
                <Link to={`/${herramienta.ruta}`} className={estilos.ficha}>
                  <span className={estilos.nombre}>{herramienta.nombre}</span>
                  <span className={estilos.resumen}>{herramienta.resumen}</span>
                  <span className={estilos.abrir}>
                    Abrir <ArrowRight size={14} aria-hidden />
                  </span>
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
        <a href={REPO}>Código en GitHub</a>
      </footer>
    </main>
  )
}
