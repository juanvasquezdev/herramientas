import { type ChangeEvent, useRef, useState } from 'react'
import { descargarTexto } from './archivo'
import { crearRespaldo, leerRespaldo } from './archivoDeRespaldo'
import { hoyISO } from './fecha'

interface Props<T> {
  /** Nombre corto de la herramienta. Va dentro de la copia y en el nombre del archivo. */
  herramienta: string
  datos: T
  esValido: (dato: unknown) => dato is T
  alCargar: (datos: T) => void
}

/**
 * El pie de cada herramienta: recuerda dónde quedan los datos y deja sacar una copia o
 * cargar una que se hizo en otro equipo.
 */
export function Respaldo<T>({ herramienta, datos, esValido, alCargar }: Props<T>) {
  const selector = useRef<HTMLInputElement>(null)
  const [mensaje, setMensaje] = useState('')

  const descargar = () => {
    descargarTexto(
      `${herramienta}-${hoyISO()}.json`,
      crearRespaldo(herramienta, datos),
      'application/json',
    )
    setMensaje('Copia descargada.')
  }

  const cargar = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0]
    // Se limpia el selector para poder volver a elegir el mismo archivo.
    evento.target.value = ''
    if (!archivo) return

    const resultado = leerRespaldo(await archivo.text(), herramienta, esValido)
    if (!resultado.ok) {
      setMensaje(resultado.motivo)
      return
    }
    const seguro = window.confirm(
      'Se reemplaza lo que hay ahora por lo que trae la copia. ¿Cargarla?',
    )
    if (!seguro) return
    alCargar(resultado.datos)
    setMensaje('Copia cargada.')
  }

  return (
    <footer className="ui-pie">
      <span>
        Todo queda guardado en este navegador. Nada se envía a ningún servidor.{' '}
        <span role="status">{mensaje}</span>
      </span>
      <span className="ui-pie-acciones">
        <button type="button" className="ui-enlace" onClick={descargar}>
          Descargar copia
        </button>
        <button type="button" className="ui-enlace" onClick={() => selector.current?.click()}>
          Cargar copia
        </button>
        <input
          ref={selector}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={cargar}
        />
      </span>
    </footer>
  )
}
