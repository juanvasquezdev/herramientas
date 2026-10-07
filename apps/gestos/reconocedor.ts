import { cargarVision } from '../../shared/vision'
import type { Gesto } from './regla'

/**
 * El reconocedor de gestos (MediaPipe Gesture Recognizer). Encuentra una mano en la imagen
 * de la cámara, ubica sus 21 puntos y dice cuál de siete gestos está haciendo.
 *
 * El modelo (8 MB) se descarga de los servidores de Google la primera vez.
 */
export const URL_DEL_MODELO =
  'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task'

/** Por debajo de esta seguridad, la lectura se trata como "ningún gesto". */
const SEGURIDAD_MINIMA = 0.6

export interface PuntoDeMano {
  /** De 0 a 1, como fracción del ancho y del alto de la imagen de la cámara. */
  x: number
  y: number
}

export interface Lectura {
  gesto: Gesto
  /** Los 21 puntos de la mano. La punta del índice es el número 8. */
  puntos: PuntoDeMano[]
}

export interface Reconocedor {
  /** Lo que ve en este instante, o null si no hay ninguna mano. `ahora` en milisegundos y siempre creciente. */
  reconocer(video: HTMLVideoElement, ahora: number): Lectura | null
  cerrar(): void
}

const GESTOS: readonly string[] = [
  'None',
  'Closed_Fist',
  'Open_Palm',
  'Pointing_Up',
  'Thumb_Down',
  'Thumb_Up',
  'Victory',
  'ILoveYou',
]

export async function crearReconocedor(): Promise<Reconocedor> {
  const { vision, archivos } = await cargarVision()

  const crear = (delegate: 'GPU' | 'CPU') =>
    vision.GestureRecognizer.createFromOptions(archivos, {
      baseOptions: { modelAssetPath: URL_DEL_MODELO, delegate },
      runningMode: 'VIDEO',
      numHands: 1,
    })

  // Aquí importa la fluidez: se intenta con la tarjeta gráfica y, si el equipo no la
  // soporta, se usa el procesador.
  const tarea = await crear('GPU').catch(() => crear('CPU'))

  return {
    reconocer(video, ahora) {
      const resultado = tarea.recognizeForVideo(video, ahora)
      const puntos = resultado.landmarks[0]
      if (!puntos) return null

      const mejor = resultado.gestures[0]?.[0]
      const reconocido =
        mejor && mejor.score >= SEGURIDAD_MINIMA && GESTOS.includes(mejor.categoryName)
      return { gesto: reconocido ? (mejor.categoryName as Gesto) : 'None', puntos }
    },
    cerrar() {
      tarea.close()
    },
  }
}
