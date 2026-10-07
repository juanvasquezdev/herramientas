import { Eraser, ImageDown } from 'lucide-react'
import { type Ref, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { descargarBlob } from '../../shared/archivo'
import { hoyISO } from '../../shared/fecha'
import { Boton, unir } from '../../shared/ui'
import estilos from './gestos.module.css'
import type { ControlDeModo } from './modos'

const ANCHO = 960
const ALTO = 720
const COLORES = [
  { valor: '#1a1a1a', nombre: 'Negro' },
  { valor: '#2a78d6', nombre: 'Azul' },
  { valor: '#eb6834', nombre: 'Naranja' },
  { valor: '#1baf7a', nombre: 'Verde' },
]

interface Punto {
  x: number
  y: number
}

interface Trazo {
  color: string
  puntos: Punto[]
}

/** Un tablero en el que se dibuja con la punta del índice. */
export function Pizarra({ ref }: { ref: Ref<ControlDeModo> }) {
  const [color, setColor] = useState(0)
  const [hayDibujo, setHayDibujo] = useState(false)
  const lienzoRef = useRef<HTMLCanvasElement>(null)
  // Los trazos van en una referencia y no en el estado: cambian 15 veces por segundo y
  // solo hay que repintar el lienzo, no toda la pantalla.
  const trazosRef = useRef<Trazo[]>([])
  const dibujandoRef = useRef(false)
  const cursorRef = useRef<Punto | null>(null)
  const colorRef = useRef(0)
  colorRef.current = color

  const pintar = () => {
    const ctx = lienzoRef.current?.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, ANCHO, ALTO)
    ctx.lineWidth = 6
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const trazo of trazosRef.current) {
      const [primero, ...resto] = trazo.puntos
      if (!primero) continue
      ctx.strokeStyle = trazo.color
      ctx.beginPath()
      ctx.moveTo(primero.x, primero.y)
      // Un trazo de un solo punto se pinta como un punto.
      if (resto.length === 0) ctx.lineTo(primero.x + 0.1, primero.y)
      for (const punto of resto) ctx.lineTo(punto.x, punto.y)
      ctx.stroke()
    }
    // El círculo muestra dónde está el dedo aunque no esté dibujando.
    const cursor = cursorRef.current
    if (cursor) {
      ctx.lineWidth = 2
      ctx.strokeStyle = COLORES[colorRef.current]?.valor ?? '#1a1a1a'
      ctx.beginPath()
      ctx.arc(cursor.x, cursor.y, 10, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  const borrar = () => {
    trazosRef.current = []
    dibujandoRef.current = false
    setHayDibujo(false)
    pintar()
  }

  useImperativeHandle(ref, () => ({
    hacer(accion) {
      if (accion === 'color') setColor((actual) => (actual + 1) % COLORES.length)
      else if (accion === 'borrar') borrar()
    },
    mover(x, y, dibujando) {
      if (Number.isNaN(x)) {
        // No hay mano a la vista: se levanta el lápiz y se quita el cursor.
        cursorRef.current = null
        dibujandoRef.current = false
        pintar()
        return
      }
      // La cámara se ve como un espejo: mover la mano a la derecha mueve el cursor a la derecha.
      const destino = { x: (1 - x) * ANCHO, y: y * ALTO }
      // El punto se acerca a medias al destino: quita el temblor de la mano sin sentirse lento.
      const anterior = cursorRef.current ?? destino
      const punto = {
        x: anterior.x + (destino.x - anterior.x) * 0.5,
        y: anterior.y + (destino.y - anterior.y) * 0.5,
      }
      cursorRef.current = punto

      if (dibujando) {
        if (!dibujandoRef.current) {
          trazosRef.current.push({
            color: COLORES[colorRef.current]?.valor ?? '#1a1a1a',
            puntos: [],
          })
          setHayDibujo(true)
        }
        trazosRef.current.at(-1)?.puntos.push(punto)
      }
      dibujandoRef.current = dibujando
      pintar()
    },
  }))

  // biome-ignore lint/correctness/useExhaustiveDependencies: se repinta al montar y cuando cambia el color del cursor
  useEffect(pintar, [color])

  const guardar = () => {
    // Se quita el cursor un momento para que no salga en la imagen.
    const cursor = cursorRef.current
    cursorRef.current = null
    pintar()
    lienzoRef.current?.toBlob((blob) => {
      if (blob) descargarBlob(`dibujo-${hoyISO()}.png`, blob)
    }, 'image/png')
    cursorRef.current = cursor
  }

  return (
    <div className={estilos.modo}>
      <canvas
        ref={lienzoRef}
        className={estilos.pizarra}
        width={ANCHO}
        height={ALTO}
        role="img"
        aria-label="Tablero de dibujo. Se dibuja con el dedo índice frente a la cámara."
      />
      <div className={estilos.barraDeModo}>
        <fieldset className={estilos.colores}>
          <legend className="ui-oculto">Color del trazo</legend>
          {COLORES.map((opcion, i) => (
            <button
              key={opcion.valor}
              type="button"
              className={unir(estilos.color, i === color && estilos.colorActivo)}
              style={{ background: opcion.valor }}
              aria-label={opcion.nombre}
              aria-pressed={i === color}
              onClick={() => setColor(i)}
            />
          ))}
        </fieldset>
        <Boton onClick={borrar} disabled={!hayDibujo}>
          <Eraser size={16} aria-hidden /> Borrar
        </Boton>
        <Boton onClick={guardar} disabled={!hayDibujo}>
          <ImageDown size={16} aria-hidden /> Guardar dibujo
        </Boton>
      </div>
    </div>
  )
}
