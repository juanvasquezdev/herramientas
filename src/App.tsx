import { Link, Route, Routes } from 'react-router'
import { herramientas } from './herramientas'
import { Inicio } from './Inicio'
import { Marco } from './Marco'
import { MarcoHerramienta } from './MarcoHerramienta'
import estilos from './sitio.module.css'

/**
 * Las rutas salen del registro: una por herramienta, más el inicio y la de "no existe".
 * Todas van dentro del Marco, que es lo que no cambia al pasar de una a otra.
 */
export function App() {
  return (
    <Routes>
      <Route element={<Marco />}>
        <Route index element={<Inicio />} />
        {herramientas.map((herramienta) => (
          <Route
            key={herramienta.ruta}
            path={herramienta.ruta}
            element={<MarcoHerramienta herramienta={herramienta} />}
          />
        ))}
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}

function NoEncontrada() {
  return (
    <div className={estilos.inicio}>
      <h1 className={estilos.titular}>Esta página no existe</h1>
      <p className={estilos.entrada}>
        Puede que la herramienta haya cambiado de nombre. <Link to="/">Volver al inicio</Link>.
      </p>
    </div>
  )
}
