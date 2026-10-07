import { Camera, CameraOff } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Aviso, Boton, Encabezado, Pagina, Segmentos, Tarjeta } from '../../shared/ui'
import { Diapositivas } from './Diapositivas'
import estilos from './gestos.module.css'
import { type ControlDeModo, GUIA_EXTRA_DE_DIBUJO, MODOS, type Modo, REGLAS } from './modos'
import { Pizarra } from './Pizarra'
import { Reproductor } from './Reproductor'
import { crearReconocedor, type PuntoDeMano, type Reconocedor } from './reconocedor'
import { avanzar, ESTADO_INICIAL, type Gesto, NOMBRE_DEL_GESTO } from './regla'

type EstadoDeCamara = 'apagada' | 'encendiendo' | 'activa'

/** Milisegundos entre lecturas: unas 15 por segundo. Más seguido no mejora nada y gasta batería. */
const PAUSA_ENTRE_LECTURAS = 66

/** Qué puntos de la mano se unen con una línea (pulgar, índice, medio, anular, meñique y palma). */
// biome-ignore format: un dedo por renglón se lee mejor que un par por renglón
const HUESOS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
]

const PUNTA_DEL_INDICE = 8

/** Pinta la imagen de la cámara como un espejo y, encima, la mano que ve el reconocedor. */
function pintarCamara(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  puntos: PuntoDeMano[] | undefined,
) {
  const { width: ancho, height: alto } = ctx.canvas
  ctx.save()
  ctx.scale(-1, 1)
  ctx.drawImage(video, -ancho, 0, ancho, alto)
  ctx.restore()
  if (!puntos) return

  const en = (indice: number) => {
    const p = puntos[indice]
    return p ? { x: (1 - p.x) * ancho, y: p.y * alto } : null
  }
  ctx.lineWidth = 2
  ctx.strokeStyle = '#ffffff'
  for (const [a, b] of HUESOS) {
    const desde = en(a)
    const hasta = en(b)
    if (!desde || !hasta) continue
    ctx.beginPath()
    ctx.moveTo(desde.x, desde.y)
    ctx.lineTo(hasta.x, hasta.y)
    ctx.stroke()
  }
  puntos.forEach((_, indice) => {
    const p = en(indice)
    if (!p) return
    ctx.beginPath()
    ctx.arc(p.x, p.y, indice === PUNTA_DEL_INDICE ? 6 : 3.5, 0, Math.PI * 2)
    ctx.fillStyle = indice === PUNTA_DEL_INDICE ? '#eb6834' : '#ffffff'
    ctx.fill()
  })
}

function explicar(error: unknown): string {
  const nombre = error instanceof DOMException ? error.name : ''
  if (nombre === 'NotAllowedError') {
    return 'No hay permiso para usar la cámara. Dáselo desde el candado de la barra de direcciones y vuelve a intentar.'
  }
  if (nombre === 'NotFoundError' || nombre === 'OverconstrainedError')
    return 'No se encontró ninguna cámara en este equipo.'
  if (nombre === 'NotReadableError')
    return 'Otra aplicación está usando la cámara. Ciérrala y vuelve a intentar.'
  return 'No se pudo preparar el reconocedor de gestos. Revisa la conexión a internet: el modelo se descarga la primera vez.'
}

export default function Gestos() {
  const [modo, setModo] = useState<Modo>('diapositivas')
  const [camara, setCamara] = useState<EstadoDeCamara>('apagada')
  const [error, setError] = useState('')
  const [hayMano, setHayMano] = useState(false)
  const [gesto, setGesto] = useState<Gesto>('None')
  const [avance, setAvance] = useState(0)
  const [ultimaAccion, setUltimaAccion] = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const lienzoRef = useRef<HTMLCanvasElement>(null)
  const flujoRef = useRef<MediaStream | null>(null)
  const reconocedorRef = useRef<Reconocedor | null>(null)
  const controlRef = useRef<ControlDeModo>(null)
  const estadoRef = useRef(ESTADO_INICIAL)

  const apagar = useCallback(() => {
    for (const pista of flujoRef.current?.getTracks() ?? []) pista.stop()
    flujoRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    estadoRef.current = ESTADO_INICIAL
    setCamara('apagada')
    setHayMano(false)
    setGesto('None')
    setAvance(0)
  }, [])

  const encender = async () => {
    // getUserMedia solo existe en páginas seguras: https o localhost.
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Este navegador no deja usar la cámara aquí. Abre el sitio con https.')
      return
    }
    setError('')
    setCamara('encendiendo')
    try {
      const flujo = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      })
      flujoRef.current = flujo
      const video = videoRef.current
      if (!video) return
      video.srcObject = flujo
      await video.play()
      reconocedorRef.current ??= await crearReconocedor()
      setCamara('activa')
    } catch (motivo) {
      apagar()
      setError(explicar(motivo))
    }
  }

  // Al salir se apaga la cámara (se apaga su luz) y se libera el reconocedor.
  useEffect(
    () => () => {
      for (const pista of flujoRef.current?.getTracks() ?? []) pista.stop()
      reconocedorRef.current?.cerrar()
      reconocedorRef.current = null
    },
    [],
  )

  // Un gesto que se venía sosteniendo en un modo no debe dispararse al pasar a otro.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `modo` es la señal para reiniciar
  useEffect(() => {
    estadoRef.current = ESTADO_INICIAL
    setUltimaAccion('')
  }, [modo])

  // El ciclo: leer la cámara, reconocer el gesto, decidir si toca una acción y ejecutarla.
  useEffect(() => {
    if (camara !== 'activa') return
    const reglas = REGLAS[modo]
    let ultimaLectura = 0

    let turno = requestAnimationFrame(function ciclo(ahora) {
      turno = requestAnimationFrame(ciclo)
      if (ahora - ultimaLectura < PAUSA_ENTRE_LECTURAS) return
      ultimaLectura = ahora

      const video = videoRef.current
      const ctx = lienzoRef.current?.getContext('2d')
      const reconocedor = reconocedorRef.current
      if (!video || !ctx || !reconocedor || video.readyState < 2) return

      const lectura = reconocedor.reconocer(video, ahora)
      pintarCamara(ctx, video, lectura?.puntos)

      const paso = avanzar(estadoRef.current, lectura?.gesto ?? 'None', ahora, reglas)
      estadoRef.current = paso.estado
      setHayMano(lectura !== null)
      setGesto(paso.estado.gesto)
      setAvance(paso.avance)

      if (paso.accion) {
        controlRef.current?.hacer(paso.accion)
        setUltimaAccion(reglas.find((regla) => regla.accion === paso.accion)?.descripcion ?? '')
      }

      if (modo === 'dibujo') {
        const punta = lectura?.puntos[PUNTA_DEL_INDICE]
        if (punta) controlRef.current?.mover?.(punta.x, punta.y, lectura.gesto === 'Pointing_Up')
        else controlRef.current?.mover?.(Number.NaN, Number.NaN, false)
      }
    })
    return () => cancelAnimationFrame(turno)
  }, [camara, modo])

  const guia = [
    ...(modo === 'dibujo' ? GUIA_EXTRA_DE_DIBUJO : []),
    ...REGLAS[modo].map((regla) => ({ gesto: regla.gesto, descripcion: regla.descripcion })),
  ]

  return (
    <Pagina ancho="ancha">
      <Encabezado
        titulo="Control por gestos"
        descripcion="Maneja música, diapositivas o un tablero de dibujo con la mano, sin tocar el equipo. La cámara se procesa en tu navegador: no se graba ni se envía."
      />

      <Segmentos
        etiqueta="Qué quieres controlar"
        nombre="gestos-modo"
        opciones={MODOS}
        valor={modo}
        alCambiar={setModo}
      />

      {error && <Aviso tono="error">{error}</Aviso>}

      <div className={estilos.mesa}>
        <Tarjeta
          titulo="Cámara"
          accion={
            camara === 'activa' && (
              <Boton onClick={apagar}>
                <CameraOff size={16} aria-hidden /> Apagar
              </Boton>
            )
          }
        >
          <div className={estilos.camara}>
            <canvas
              ref={lienzoRef}
              className={estilos.vista}
              width={640}
              height={480}
              hidden={camara !== 'activa'}
            />
            {/* El <video> recibe la cámara pero no se muestra: se ve el lienzo, en espejo y con la mano marcada. */}
            <video ref={videoRef} className={estilos.oculto} muted playsInline />
            {camara !== 'activa' && (
              <div className={estilos.apagada}>
                <Boton variante="primario" onClick={encender} disabled={camara === 'encendiendo'}>
                  <Camera size={16} aria-hidden />{' '}
                  {camara === 'encendiendo' ? 'Preparando…' : 'Activar cámara'}
                </Boton>
                <p>
                  {camara === 'encendiendo'
                    ? 'La primera vez se descarga el reconocedor (8 MB).'
                    : 'El navegador te va a pedir permiso.'}
                </p>
              </div>
            )}
          </div>

          <div className={estilos.estado} aria-live="polite">
            <p>
              <span>Gesto</span>
              <strong>
                {camara !== 'activa'
                  ? '—'
                  : !hayMano
                    ? 'Sin mano a la vista'
                    : NOMBRE_DEL_GESTO[gesto]}
              </strong>
            </p>
            <progress value={avance} aria-label="Cuánto falta para que el gesto cuente" />
            <p>
              <span>Última acción</span>
              <strong>{ultimaAccion || '—'}</strong>
            </p>
          </div>

          <dl className={estilos.guia}>
            {guia.map((fila) => (
              <div key={fila.gesto}>
                <dt>{NOMBRE_DEL_GESTO[fila.gesto]}</dt>
                <dd>{fila.descripcion}</dd>
              </div>
            ))}
          </dl>
          <p className={estilos.nota}>
            Sostén el gesto medio segundo. Para repetirlo, baja la mano y vuelve a hacerlo.
          </p>
        </Tarjeta>

        {modo === 'reproductor' && <Reproductor ref={controlRef} />}
        {modo === 'diapositivas' && <Diapositivas ref={controlRef} />}
        {modo === 'dibujo' && <Pizarra ref={controlRef} />}
      </div>
    </Pagina>
  )
}
