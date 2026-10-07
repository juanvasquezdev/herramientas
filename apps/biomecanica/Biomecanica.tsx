import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ImageDown,
  Pause,
  Play,
  Upload,
} from 'lucide-react'
import { type DragEvent, type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react'
import { descargarBlob, paraNombreDeArchivo } from '../../shared/archivo'
import { aPositivo } from '../../shared/numero'
import {
  Aviso,
  Boton,
  Campo,
  CampoSelect,
  Encabezado,
  Pagina,
  Segmentos,
  Tarjeta,
} from '../../shared/ui'
import { useGuardadoLocal } from '../../shared/useGuardadoLocal'
import { ANGULOS, type Lado, medir, type PuntoPose } from './angulos'
import estilos from './biomecanica.module.css'
import { crearDetector, type Detector } from './detector'
import { dibujarCuadro } from './dibujo'
import { type Ajustes, ajustesIniciales, CLAVE_GUARDADO, esAjustes, VELOCIDADES } from './modelo'
import { Resultados } from './Resultados'
import {
  cuadroEn,
  type Muestra,
  segundosReales,
  tiempoDeContacto,
  tiempoDelCuadro,
} from './tiempos'

const PIERNAS: ReadonlyArray<{ valor: Lado; texto: string }> = [
  { valor: 'izquierda', texto: 'Izquierda' },
  { valor: 'derecha', texto: 'Derecha' },
]

/** El lienzo nunca pasa de este tamaño en su lado más largo: más grande solo lo hace lento. */
const LADO_MAXIMO = 1280
/** Tope de cuadros que se analizan entre apoyo y despegue. Si hay más, se saltan algunos. */
const MUESTRAS_MAXIMAS = 240

type EstadoDetector = 'apagado' | 'cargando' | 'listo' | 'error'

/** Un cuadro del video con los puntos del cuerpo que se detectaron en él. */
interface Marca {
  cuadro: number
  pose: PuntoPose[]
}

interface Video {
  url: string
  nombre: string
}

interface Dimensiones {
  ancho: number
  alto: number
  duracion: number
}

/** Mueve el video a un instante y espera a que el cuadro esté listo para leerlo. */
function saltarA(video: HTMLVideoElement, tiempo: number): Promise<void> {
  return new Promise((resolver) => {
    if (Math.abs(video.currentTime - tiempo) < 1e-4) {
      resolver()
      return
    }
    video.addEventListener('seeked', () => resolver(), { once: true })
    video.currentTime = tiempo
  })
}

export default function Biomecanica() {
  const [ajustes, setAjustes] = useGuardadoLocal<Ajustes>(
    CLAVE_GUARDADO,
    ajustesIniciales,
    esAjustes,
  )
  const [video, setVideo] = useState<Video | null>(null)
  const [dimensiones, setDimensiones] = useState<Dimensiones | null>(null)
  const [estadoDetector, setEstadoDetector] = useState<EstadoDetector>('apagado')
  const [errorDeVideo, setErrorDeVideo] = useState('')
  const [cuadro, setCuadro] = useState(0)
  const [pose, setPose] = useState<PuntoPose[] | null>(null)
  const [apoyo, setApoyo] = useState<Marca | null>(null)
  const [despegue, setDespegue] = useState<Marca | null>(null)
  const [tramo, setTramo] = useState<Marca[] | null>(null)
  /** De 0 a 1 mientras se analiza el contacto; null el resto del tiempo. */
  const [progreso, setProgreso] = useState<number | null>(null)
  const [reproduciendo, setReproduciendo] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const lienzoRef = useRef<HTMLCanvasElement>(null)
  const detectorRef = useRef<Detector | null>(null)
  const selectorRef = useRef<HTMLInputElement>(null)
  /** true mientras corre el análisis del contacto, para que nada más mueva el video. */
  const ocupadoRef = useRef(false)
  const cancelarRef = useRef(false)

  const fps = Number(ajustes.fps) || 30
  const camaraLenta = aPositivo(ajustes.camaraLenta) || 1
  const totalDeCuadros = dimensiones ? Math.max(1, Math.floor(dimensiones.duracion * fps)) : 1

  const medidasDe = (puntos: PuntoPose[] | null | undefined) =>
    puntos && dimensiones
      ? medir(puntos, ajustes.pierna, dimensiones.ancho, dimensiones.alto)
      : null
  const medidas = medidasDe(pose)
  const enApoyo = medidasDe(apoyo?.pose)
  const enDespegue = medidasDe(despegue?.pose)
  const contacto =
    apoyo && despegue ? tiempoDeContacto(apoyo.cuadro, despegue.cuadro, fps, camaraLenta) : null

  const muestras: Muestra[] = []
  if (tramo && apoyo) {
    for (const marca of tramo) {
      const delCuadro = medidasDe(marca.pose)
      if (delCuadro) {
        muestras.push({
          tiempo: segundosReales(marca.cuadro - apoyo.cuadro, fps, camaraLenta),
          medidas: delCuadro,
        })
      }
    }
  }

  const cambiar = (cambios: Partial<Ajustes>) => setAjustes((prev) => ({ ...prev, ...cambios }))

  /** Lee el cuadro que el video está mostrando: busca al atleta y actualiza la posición. */
  const leerCuadro = useCallback(() => {
    const elemento = videoRef.current
    // readyState < 2: el video todavía no tiene un cuadro que mostrar.
    if (!elemento || elemento.readyState < 2) return
    // Al terminar, el video queda justo en su duración, que ya sería "el cuadro siguiente al último".
    const ultimo = Math.max(0, Math.floor(elemento.duration * fps) - 1)
    setCuadro(Math.min(cuadroEn(elemento.currentTime, fps), ultimo))
    setPose(detectorRef.current?.detectar(elemento) ?? null)
  }, [fps])

  const prepararDetector = useCallback(async () => {
    if (detectorRef.current) return
    setEstadoDetector('cargando')
    try {
      detectorRef.current = await crearDetector()
      setEstadoDetector('listo')
      leerCuadro()
    } catch {
      setEstadoDetector('error')
    }
  }, [leerCuadro])

  // Al salir de la herramienta se libera el detector, que ocupa bastante memoria.
  useEffect(
    () => () => {
      cancelarRef.current = true
      detectorRef.current?.cerrar()
      detectorRef.current = null
    },
    [],
  )

  // La dirección temporal del video se libera cuando se cambia de video o se sale.
  useEffect(() => {
    if (!video) return
    return () => URL.revokeObjectURL(video.url)
  }, [video])

  // Dibuja el cuadro actual con el esqueleto encima cada vez que cambia algo de lo que se ve.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `cuadro` no se lee aquí, pero cuando cambia hay un cuadro nuevo que pintar
  useEffect(() => {
    const elemento = videoRef.current
    const ctx = lienzoRef.current?.getContext('2d')
    if (!elemento || !ctx || !dimensiones || elemento.readyState < 2) return
    const { width, height } = ctx.canvas
    dibujarCuadro(
      ctx,
      elemento,
      width,
      height,
      pose,
      ajustes.pierna,
      medir(pose ?? [], ajustes.pierna, width, height),
    )
  }, [pose, cuadro, ajustes.pierna, dimensiones])

  // Mientras el video corre, se lee un cuadro en cada refresco de pantalla.
  useEffect(() => {
    if (!reproduciendo) return
    let turno = requestAnimationFrame(function ciclo() {
      leerCuadro()
      turno = requestAnimationFrame(ciclo)
    })
    return () => cancelAnimationFrame(turno)
  }, [reproduciendo, leerCuadro])

  const abrir = (archivo: File | undefined) => {
    if (!archivo) return
    if (!archivo.type.startsWith('video/')) {
      setErrorDeVideo('Ese archivo no es un video.')
      return
    }
    cancelarRef.current = true
    setErrorDeVideo('')
    setDimensiones(null)
    setPose(null)
    setCuadro(0)
    setApoyo(null)
    setDespegue(null)
    setTramo(null)
    setReproduciendo(false)
    setVideo({ url: URL.createObjectURL(archivo), nombre: archivo.name.replace(/\.[^.]+$/, '') })
    void prepararDetector()
  }

  const soltar = (evento: DragEvent) => {
    evento.preventDefault()
    abrir(evento.dataTransfer.files[0])
  }

  const alCargarElVideo = () => {
    const elemento = videoRef.current
    if (!elemento) return
    setDimensiones({
      ancho: elemento.videoWidth,
      alto: elemento.videoHeight,
      duracion: elemento.duration,
    })
    elemento.currentTime = tiempoDelCuadro(0, fps)
  }

  const irA = (destino: number) => {
    const elemento = videoRef.current
    if (!elemento || ocupadoRef.current) return
    elemento.pause()
    const limitado = Math.min(Math.max(destino, 0), totalDeCuadros - 1)
    elemento.currentTime = tiempoDelCuadro(limitado, fps)
  }

  const alternar = () => {
    const elemento = videoRef.current
    if (!elemento || ocupadoRef.current) return
    if (elemento.paused) void elemento.play()
    else elemento.pause()
  }

  const conTeclado = (evento: KeyboardEvent) => {
    const paso = evento.shiftKey ? 10 : 1
    if (evento.key === 'ArrowRight') irA(cuadro + paso)
    else if (evento.key === 'ArrowLeft') irA(cuadro - paso)
    else if (evento.key === ' ') alternar()
    else return
    evento.preventDefault()
  }

  /** Cambiar la velocidad del video cambia qué es "un cuadro": las marcas dejan de valer. */
  const cambiarVelocidad = (valor: string) => {
    cambiar({ fps: valor })
    setApoyo(null)
    setDespegue(null)
    setTramo(null)
  }

  const marcar = (cual: 'apoyo' | 'despegue') => {
    if (!pose) return
    const marca = { cuadro, pose }
    if (cual === 'apoyo') setApoyo(marca)
    else setDespegue(marca)
    setTramo(null)
  }

  /** Recorre cuadro por cuadro del apoyo al despegue y guarda lo detectado en cada uno. */
  const analizar = async () => {
    const elemento = videoRef.current
    const detector = detectorRef.current
    if (!elemento || !detector || !apoyo || !despegue || despegue.cuadro <= apoyo.cuadro) return

    elemento.pause()
    ocupadoRef.current = true
    cancelarRef.current = false
    const total = despegue.cuadro - apoyo.cuadro
    const salto = Math.max(1, Math.ceil(total / MUESTRAS_MAXIMAS))
    const recogidas: Marca[] = []

    for (
      let actual = apoyo.cuadro;
      actual <= despegue.cuadro && !cancelarRef.current;
      actual += salto
    ) {
      await saltarA(elemento, tiempoDelCuadro(actual, fps))
      const puntos = detector.detectar(elemento)
      if (puntos) recogidas.push({ cuadro: actual, pose: puntos })
      setProgreso((actual - apoyo.cuadro) / total)
    }

    ocupadoRef.current = false
    setProgreso(null)
    if (!cancelarRef.current) setTramo(recogidas)
    leerCuadro()
  }

  const guardarImagen = () => {
    lienzoRef.current?.toBlob((blob) => {
      if (blob)
        descargarBlob(
          `${paraNombreDeArchivo(video?.nombre ?? '', 'salto')}-cuadro-${cuadro}.png`,
          blob,
        )
    }, 'image/png')
  }

  // El lienzo se achica si el video es enorme, sin perder la proporción.
  const factor = dimensiones
    ? Math.min(1, LADO_MAXIMO / Math.max(dimensiones.ancho, dimensiones.alto))
    : 1
  const tiempoReal = segundosReales(cuadro, fps, camaraLenta)

  return (
    <Pagina ancho="ancha">
      <Encabezado
        titulo="Análisis de salto en video"
        descripcion="Sube el video de un salto, avanza cuadro a cuadro y mide los ángulos y el tiempo de contacto del despegue. El video no sale de tu equipo."
      >
        {video && (
          <Boton onClick={() => selectorRef.current?.click()}>
            <Upload size={16} aria-hidden /> Otro video
          </Boton>
        )}
      </Encabezado>

      <input
        ref={selectorRef}
        type="file"
        accept="video/*"
        hidden
        onChange={(e) => {
          abrir(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      <div className={estilos.ajustes}>
        <div>
          <span className="ui-etiqueta">Pierna de despegue</span>
          <Segmentos
            etiqueta="Pierna de despegue del atleta"
            nombre="biomecanica-pierna"
            opciones={PIERNAS}
            valor={ajustes.pierna}
            alCambiar={(pierna) => cambiar({ pierna })}
          />
        </div>
        <CampoSelect
          etiqueta="Cuadros por segundo del video"
          value={ajustes.fps}
          onChange={(e) => cambiarVelocidad(e.target.value)}
        >
          {VELOCIDADES.map((velocidad) => (
            <option key={velocidad}>{velocidad}</option>
          ))}
        </CampoSelect>
        <Campo
          etiqueta="Cámara lenta (veces)"
          type="number"
          min="1"
          step="any"
          inputMode="decimal"
          value={ajustes.camaraLenta}
          onChange={(e) => cambiar({ camaraLenta: e.target.value })}
          ayuda="1 si el video va a velocidad normal. 8 si grabaste a 240 y se reproduce a 30."
        />
      </div>

      {errorDeVideo && <Aviso tono="error">{errorDeVideo}</Aviso>}
      {estadoDetector === 'error' && (
        <Aviso tono="error">
          No se pudo cargar el detector de pose. Revisa la conexión a internet (el modelo se
          descarga la primera vez) y{' '}
          <button
            type="button"
            className="ui-enlace"
            onClick={() => {
              setEstadoDetector('apagado')
              void prepararDetector()
            }}
          >
            vuelve a intentarlo
          </button>
          .
        </Aviso>
      )}

      {!video ? (
        // biome-ignore lint/a11y/noStaticElementInteractions: la zona acepta soltar un archivo; el botón de adentro es el control accesible
        <div className={estilos.vacio} onDragOver={(e) => e.preventDefault()} onDrop={soltar}>
          <Boton variante="primario" onClick={() => selectorRef.current?.click()}>
            <Upload size={16} aria-hidden /> Elegir video
          </Boton>
          <p>o arrástralo hasta aquí</p>
          <ul>
            <li>Graba de lado, con la cámara quieta y a la altura de la cadera.</li>
            <li>Que se vea el cuerpo completo en el último paso y el despegue.</li>
            <li>Si puedes, graba en cámara lenta: el tiempo de contacto sale más preciso.</li>
          </ul>
        </div>
      ) : (
        <div className={estilos.mesa}>
          <div>
            {/* biome-ignore lint/a11y/useSemanticElements: es un visor con teclado, no un grupo de campos de formulario */}
            <div
              className={estilos.visor}
              // biome-ignore lint/a11y/noNoninteractiveTabindex: el visor recibe foco para manejarlo con las flechas
              tabIndex={0}
              role="group"
              aria-label="Visor del video. Flechas izquierda y derecha: un cuadro. Con Mayús: diez. Espacio: reproducir o pausar."
              onKeyDown={conTeclado}
            >
              <canvas
                ref={lienzoRef}
                className={estilos.lienzo}
                width={dimensiones ? Math.round(dimensiones.ancho * factor) : 640}
                height={dimensiones ? Math.round(dimensiones.alto * factor) : 360}
              />
              {estadoDetector === 'cargando' && (
                <p className={estilos.cargando} role="status">
                  Preparando el detector de pose. La primera vez descarga 9 MB.
                </p>
              )}
              {/* El video real queda fuera de la vista: lo que se ve es el lienzo, con el esqueleto encima. */}
              <video
                ref={videoRef}
                className={estilos.video}
                src={video.url}
                muted
                playsInline
                preload="auto"
                onLoadedMetadata={alCargarElVideo}
                onSeeked={() => {
                  if (!ocupadoRef.current) leerCuadro()
                }}
                onPlay={() => setReproduciendo(true)}
                onPause={() => setReproduciendo(false)}
                onEnded={() => setReproduciendo(false)}
                onError={() =>
                  setErrorDeVideo('El navegador no pudo abrir este video. Prueba con un MP4.')
                }
              />
            </div>

            <div className={estilos.controles}>
              <Boton
                variante="plano"
                onClick={() => irA(cuadro - 10)}
                aria-label="Retroceder diez cuadros"
              >
                <ChevronsLeft size={18} aria-hidden />
              </Boton>
              <Boton variante="plano" onClick={() => irA(cuadro - 1)} aria-label="Cuadro anterior">
                <ChevronLeft size={18} aria-hidden />
              </Boton>
              <Boton
                variante="secundario"
                onClick={alternar}
                aria-label={reproduciendo ? 'Pausar' : 'Reproducir'}
              >
                {reproduciendo ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
              </Boton>
              <Boton variante="plano" onClick={() => irA(cuadro + 1)} aria-label="Cuadro siguiente">
                <ChevronRight size={18} aria-hidden />
              </Boton>
              <Boton
                variante="plano"
                onClick={() => irA(cuadro + 10)}
                aria-label="Avanzar diez cuadros"
              >
                <ChevronsRight size={18} aria-hidden />
              </Boton>
              <input
                className={estilos.barra}
                type="range"
                min={0}
                max={totalDeCuadros - 1}
                value={Math.min(cuadro, totalDeCuadros - 1)}
                onChange={(e) => irA(Number(e.target.value))}
                aria-label="Posición en el video"
                aria-valuetext={`Cuadro ${cuadro + 1} de ${totalDeCuadros}`}
              />
              <output className={estilos.posicion}>
                Cuadro {cuadro + 1} de {totalDeCuadros} ·{' '}
                {tiempoReal.toLocaleString('es-CO', {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}{' '}
                s
              </output>
            </div>

            <div className={estilos.marcas}>
              <Boton onClick={() => marcar('apoyo')} disabled={!pose}>
                Marcar apoyo
              </Boton>
              <Boton onClick={() => marcar('despegue')} disabled={!pose}>
                Marcar despegue
              </Boton>
              <Boton
                variante="primario"
                onClick={analizar}
                disabled={!contacto || progreso !== null || estadoDetector !== 'listo'}
              >
                Analizar el contacto
              </Boton>
              <Boton
                variante="plano"
                onClick={guardarImagen}
                disabled={!dimensiones}
                aria-label="Guardar este cuadro como imagen"
              >
                <ImageDown size={18} aria-hidden />
              </Boton>
            </div>
            <p className={estilos.pista}>
              Apoyo: el primer cuadro en que el pie de despegue toca el piso. Despegue: el último en
              que todavía lo toca.
            </p>

            <div className={estilos.fichas}>
              {apoyo && (
                <button type="button" className={estilos.ficha} onClick={() => irA(apoyo.cuadro)}>
                  Apoyo: cuadro {apoyo.cuadro + 1}
                </button>
              )}
              {despegue && (
                <button
                  type="button"
                  className={estilos.ficha}
                  onClick={() => irA(despegue.cuadro)}
                >
                  Despegue: cuadro {despegue.cuadro + 1}
                </button>
              )}
            </div>

            {apoyo && despegue && !contacto && (
              <Aviso tono="alerta">
                El despegue tiene que quedar después del apoyo. Vuelve a marcar uno de los dos.
              </Aviso>
            )}
            {progreso !== null && (
              <div className={estilos.progreso}>
                <progress value={progreso} aria-label="Avance del análisis" />
                <Boton
                  onClick={() => {
                    cancelarRef.current = true
                  }}
                >
                  Cancelar
                </Boton>
              </div>
            )}
          </div>

          <Tarjeta titulo="En este cuadro">
            {!medidas ? (
              <p className={estilos.sinPose}>
                {estadoDetector === 'listo'
                  ? 'No se detecta a nadie en este cuadro.'
                  : 'Los ángulos aparecen cuando el detector esté listo.'}
              </p>
            ) : (
              <>
                <dl className={estilos.angulos}>
                  {ANGULOS.map(({ clave, nombre, lectura }) => (
                    <div key={clave}>
                      <dt>
                        {nombre}
                        <small>{lectura}</small>
                      </dt>
                      <dd>{Math.round(medidas[clave])}°</dd>
                    </div>
                  ))}
                </dl>
                {!medidas.confiable && (
                  <Aviso tono="alerta">
                    El detector no ve bien alguna articulación en este cuadro. Toma estas medidas
                    con cuidado.
                  </Aviso>
                )}
              </>
            )}
          </Tarjeta>
        </div>
      )}

      {video && (
        <Resultados
          enApoyo={enApoyo}
          enDespegue={enDespegue}
          contacto={contacto}
          muestras={muestras}
          referencia={ajustes.referencia}
          nombreDelVideo={video.nombre}
          alGuardarReferencia={(referencia) => cambiar({ referencia })}
        />
      )}

      <Aviso tono="info">
        Las medidas son en dos dimensiones, sobre la imagen. Sirven para comparar tus saltos entre
        sí cuando los grabas igual; no reemplazan un análisis de laboratorio ni el ojo de tu
        entrenador.
      </Aviso>
    </Pagina>
  )
}
