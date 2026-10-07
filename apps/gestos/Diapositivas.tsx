import { ChevronLeft, ChevronRight, Images, Maximize, Upload } from 'lucide-react'
import {
  type KeyboardEvent,
  type Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { Boton } from '../../shared/ui'
import estilos from './gestos.module.css'
import type { ControlDeModo } from './modos'

interface Imagen {
  url: string
  nombre: string
}

/** Presentar con la mano: las diapositivas son imágenes exportadas de cualquier programa. */
export function Diapositivas({ ref }: { ref: Ref<ControlDeModo> }) {
  const [imagenes, setImagenes] = useState<Imagen[]>([])
  const [indice, setIndice] = useState(0)
  const visorRef = useRef<HTMLDivElement>(null)
  const selectorRef = useRef<HTMLInputElement>(null)

  // En una presentación no se da la vuelta: en la última, "siguiente" no hace nada.
  const mover = (salto: number) =>
    setIndice((actual) => Math.min(Math.max(actual + salto, 0), imagenes.length - 1))

  useImperativeHandle(ref, () => ({
    hacer(accion) {
      if (accion === 'siguiente') mover(1)
      else if (accion === 'anterior') mover(-1)
    },
  }))

  // Las direcciones temporales de las imágenes se liberan cuando se cambian o al salir.
  useEffect(() => {
    return () => {
      for (const imagen of imagenes) URL.revokeObjectURL(imagen.url)
    }
  }, [imagenes])

  const cargar = (archivos: FileList | null) => {
    const nuevas = [...(archivos ?? [])]
      .filter((archivo) => archivo.type.startsWith('image/'))
      // Orden por nombre entendiendo los números: "Diapositiva2" va antes que "Diapositiva10".
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { numeric: true }))
      .map((archivo) => ({
        url: URL.createObjectURL(archivo),
        nombre: archivo.name.replace(/\.[^.]+$/, ''),
      }))
    if (nuevas.length === 0) return
    setImagenes(nuevas)
    setIndice(0)
  }

  const conTeclado = (evento: KeyboardEvent) => {
    if (evento.key === 'ArrowRight' || evento.key === 'PageDown') mover(1)
    else if (evento.key === 'ArrowLeft' || evento.key === 'PageUp') mover(-1)
    else return
    evento.preventDefault()
  }

  const actual = imagenes[indice]

  return (
    <div className={estilos.modo}>
      <input
        ref={selectorRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          cargar(e.target.files)
          e.target.value = ''
        }}
      />

      {!actual ? (
        <div className={estilos.vacio}>
          <Images size={28} aria-hidden />
          <p>
            Exporta tu presentación como imágenes (PowerPoint, Keynote, Google Slides y Canva lo
            hacen) y cárgalas todas juntas.
          </p>
          <Boton variante="primario" onClick={() => selectorRef.current?.click()}>
            <Upload size={16} aria-hidden /> Elegir imágenes
          </Boton>
        </div>
      ) : (
        <>
          {/* biome-ignore lint/a11y/useSemanticElements: es un visor con teclado, no un grupo de campos de formulario */}
          <div
            ref={visorRef}
            className={estilos.diapositiva}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: el visor recibe foco para pasar diapositivas con las flechas
            tabIndex={0}
            role="group"
            aria-label="Diapositivas. Usa las flechas para pasar."
            onKeyDown={conTeclado}
          >
            <img
              src={actual.url}
              alt={`Diapositiva ${indice + 1} de ${imagenes.length}: ${actual.nombre}`}
            />
            <span className={estilos.contador} aria-hidden>
              {indice + 1} / {imagenes.length}
            </span>
          </div>
          <div className={estilos.barraDeModo}>
            <Boton
              variante="plano"
              onClick={() => mover(-1)}
              disabled={indice === 0}
              aria-label="Diapositiva anterior"
            >
              <ChevronLeft size={18} aria-hidden />
            </Boton>
            <Boton
              variante="plano"
              onClick={() => mover(1)}
              disabled={indice === imagenes.length - 1}
              aria-label="Diapositiva siguiente"
            >
              <ChevronRight size={18} aria-hidden />
            </Boton>
            <output className={estilos.posicion}>
              Diapositiva {indice + 1} de {imagenes.length}
            </output>
            <Boton onClick={() => void visorRef.current?.requestFullscreen?.()}>
              <Maximize size={16} aria-hidden /> Pantalla completa
            </Boton>
            <Boton onClick={() => selectorRef.current?.click()}>Cambiar imágenes</Boton>
          </div>
        </>
      )}
    </div>
  )
}
