import { Music, SkipBack, SkipForward, Upload, Volume2 } from 'lucide-react'
import { type Ref, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Boton, unir } from '../../shared/ui'
import estilos from './gestos.module.css'
import type { ControlDeModo } from './modos'

interface Pista {
  url: string
  nombre: string
}

/** Un reproductor de verdad: canciones o videos del equipo, manejados con gestos. */
export function Reproductor({ ref }: { ref: Ref<ControlDeModo> }) {
  const [pistas, setPistas] = useState<Pista[]>([])
  const [indice, setIndice] = useState(0)
  const [volumen, setVolumen] = useState(0.8)
  const medioRef = useRef<HTMLVideoElement>(null)
  const selectorRef = useRef<HTMLInputElement>(null)
  /** Si al cambiar de pista hay que arrancarla (venía sonando) o dejarla quieta. */
  const seguirSonandoRef = useRef(false)

  const cambiarPista = (salto: number) => {
    if (pistas.length === 0) return
    seguirSonandoRef.current = true
    // El módulo hace que después de la última vuelva a la primera, y al revés.
    setIndice((actual) => (actual + salto + pistas.length) % pistas.length)
  }

  const cambiarVolumen = (salto: number) =>
    setVolumen((actual) => Math.min(1, Math.max(0, +(actual + salto).toFixed(2))))

  useImperativeHandle(ref, () => ({
    hacer(accion) {
      const medio = medioRef.current
      if (!medio || pistas.length === 0) return
      if (accion === 'alternar') {
        if (medio.paused) void medio.play()
        else medio.pause()
      } else if (accion === 'siguiente') cambiarPista(1)
      else if (accion === 'anterior') cambiarPista(-1)
      else if (accion === 'subir') cambiarVolumen(0.1)
      else if (accion === 'bajar') cambiarVolumen(-0.1)
    },
  }))

  const actual = pistas[indice]

  // El volumen se aplica cuando cambia y también cuando aparece el reproductor por primera vez.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `actual` es la señal de que el reproductor ya existe
  useEffect(() => {
    if (medioRef.current) medioRef.current.volume = volumen
  }, [volumen, actual])

  // Cuando cambia la pista, arranca sola si la orden fue "siguiente" o "anterior".
  // biome-ignore lint/correctness/useExhaustiveDependencies: `indice` es la señal de que cambió la pista
  useEffect(() => {
    if (seguirSonandoRef.current) void medioRef.current?.play()
    seguirSonandoRef.current = false
  }, [indice])

  // Las direcciones temporales de los archivos se liberan cuando se cambian o al salir.
  useEffect(() => {
    return () => {
      for (const pista of pistas) URL.revokeObjectURL(pista.url)
    }
  }, [pistas])

  const cargar = (archivos: FileList | null) => {
    const nuevas = [...(archivos ?? [])]
      .filter((archivo) => archivo.type.startsWith('audio/') || archivo.type.startsWith('video/'))
      .map((archivo) => ({
        url: URL.createObjectURL(archivo),
        nombre: archivo.name.replace(/\.[^.]+$/, ''),
      }))
    if (nuevas.length === 0) return
    setPistas(nuevas)
    setIndice(0)
  }

  return (
    <div className={estilos.modo}>
      <input
        ref={selectorRef}
        type="file"
        accept="audio/*,video/*"
        multiple
        hidden
        onChange={(e) => {
          cargar(e.target.files)
          e.target.value = ''
        }}
      />

      {!actual ? (
        <div className={estilos.vacio}>
          <Music size={28} aria-hidden />
          <p>Carga canciones o videos de tu equipo y manéjalos con la mano.</p>
          <Boton variante="primario" onClick={() => selectorRef.current?.click()}>
            <Upload size={16} aria-hidden /> Elegir archivos
          </Boton>
        </div>
      ) : (
        <>
          {/* Un <video> reproduce también audio; con un archivo de solo sonido queda la barra de controles. */}
          {/* biome-ignore lint/a11y/useMediaCaption: son archivos de la persona; no hay subtítulos que ofrecer */}
          <video
            ref={medioRef}
            className={estilos.medio}
            src={actual.url}
            controls
            playsInline
            onEnded={() => cambiarPista(1)}
          />
          <div className={estilos.barraDeModo}>
            <Boton variante="plano" onClick={() => cambiarPista(-1)} aria-label="Pista anterior">
              <SkipBack size={18} aria-hidden />
            </Boton>
            <Boton variante="plano" onClick={() => cambiarPista(1)} aria-label="Pista siguiente">
              <SkipForward size={18} aria-hidden />
            </Boton>
            <label className={estilos.volumen}>
              <Volume2 size={16} aria-hidden />
              <span className="ui-oculto">Volumen</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volumen}
                onChange={(e) => setVolumen(Number(e.target.value))}
              />
              <output>{Math.round(volumen * 100)} %</output>
            </label>
            <Boton onClick={() => selectorRef.current?.click()}>Cambiar archivos</Boton>
          </div>
          <ol className={estilos.pistas}>
            {pistas.map((pista, i) => (
              <li key={pista.url}>
                <button
                  type="button"
                  className={unir(estilos.pista, i === indice && estilos.pistaActiva)}
                  aria-current={i === indice}
                  onClick={() => {
                    seguirSonandoRef.current = true
                    setIndice(i)
                  }}
                >
                  {pista.nombre}
                </button>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  )
}
