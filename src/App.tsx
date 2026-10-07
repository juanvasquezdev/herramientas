import { Link, Route, Routes } from 'react-router'
import { herramientas } from './herramientas'
import { Inicio } from './Inicio'
import { MarcoHerramienta } from './MarcoHerramienta'
import estilos from './sitio.module.css'

/** Las rutas salen del registro: una por herramienta, más el inicio y la de "no existe". */
export function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      {herramientas.map((herramienta) => (
        <Route
          key={herramienta.ruta}
          path={`/${herramienta.ruta}`}
          element={<MarcoHerramienta herramienta={herramienta} />}
        />
      ))}
      <Route path="*" element={<NoEncontrada />} />
    </Routes>
  )
}

function NoEncontrada() {
  return (
    <main className={estilos.pagina}>
      <h1 className={estilos.titulo}>Esta página no existe</h1>
      <p className={estilos.entrada}>
        Puede que la herramienta haya cambiado de nombre. <Link to="/">Volver al inicio</Link>.
      </p>
    </main>
  )
}
