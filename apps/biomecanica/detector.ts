import { cargarVision } from '../../shared/vision'
import type { PuntoPose } from './angulos'

/**
 * El detector de pose (MediaPipe Pose Landmarker). Corre completo dentro del navegador.
 *
 * El modelo entrenado (9 MB) se descarga de los servidores de Google la primera vez y el
 * navegador lo guarda en caché. Es la versión 1 de la variante "full".
 */
export const URL_DEL_MODELO =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task'

export interface Detector {
  /** Los 33 puntos del cuerpo en la imagen, o null si no encuentra a nadie. */
  detectar(imagen: HTMLVideoElement | HTMLCanvasElement): PuntoPose[] | null
  cerrar(): void
}

export async function crearDetector(): Promise<Detector> {
  const { vision, archivos } = await cargarVision()

  const tarea = await vision.PoseLandmarker.createFromOptions(archivos, {
    baseOptions: {
      modelAssetPath: URL_DEL_MODELO,
      // CPU y no GPU: es un poco más lento, pero da los mismos números en cualquier equipo,
      // que es lo que importa para comparar un salto con otro.
      delegate: 'CPU',
    },
    // Cada cuadro se analiza por separado. Así se puede ir hacia atrás en el video y un
    // cuadro no hereda errores del anterior.
    runningMode: 'IMAGE',
    numPoses: 1,
  })

  return {
    detectar(imagen) {
      const resultado = tarea.detect(imagen)
      return resultado.landmarks[0] ?? null
    },
    cerrar() {
      tarea.close()
    },
  }
}
