/**
 * Geometría del análisis. Funciones puras: entran puntos, salen grados.
 *
 * Todo es en 2D, sobre la imagen. Por eso los ángulos solo son comparables entre videos
 * grabados igual: de lado, con la cámara quieta y perpendicular al movimiento.
 */

/** Un punto en píxeles de la imagen (x hacia la derecha, y hacia abajo). */
export interface Punto {
  x: number
  y: number
}

/**
 * Un punto del cuerpo como lo entrega el detector: x e y van de 0 a 1 (fracción del ancho
 * y del alto) y `visibility` dice qué tan seguro está de que el punto se ve.
 */
export interface PuntoPose extends Punto {
  visibility?: number
}

export type Lado = 'izquierda' | 'derecha'

/** El ángulo en `vertice`, entre los segmentos hacia `a` y hacia `c`. De 0 a 180 grados. */
export function anguloEn(a: Punto, vertice: Punto, c: Punto): number {
  const v1 = { x: a.x - vertice.x, y: a.y - vertice.y }
  const v2 = { x: c.x - vertice.x, y: c.y - vertice.y }
  const largos = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y)
  if (largos === 0) return Number.NaN

  // Se recorta a [-1, 1]: por redondeo el coseno puede dar 1,0000000002 y acos devolvería NaN.
  const coseno = Math.min(1, Math.max(-1, (v1.x * v2.x + v1.y * v2.y) / largos))
  return (Math.acos(coseno) * 180) / Math.PI
}

/**
 * Cuánto se aparta de la vertical el segmento que va de `abajo` a `arriba`.
 * 0 = derecho, 90 = acostado. No distingue hacia qué lado se inclina.
 */
export function inclinacion(abajo: Punto, arriba: Punto): number {
  const horizontal = Math.abs(arriba.x - abajo.x)
  const vertical = abajo.y - arriba.y // en la imagen, "arriba" tiene menor y
  if (horizontal === 0 && vertical === 0) return Number.NaN
  return (Math.atan2(horizontal, vertical) * 180) / Math.PI
}

function puntoMedio(a: Punto, b: Punto): Punto {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

/** Los ángulos que se miden, con el nombre que ve la persona y cómo leerlos. */
export const ANGULOS = [
  { clave: 'rodillaApoyo', nombre: 'Rodilla de despegue', lectura: '180° = pierna recta' },
  { clave: 'caderaApoyo', nombre: 'Cadera de despegue', lectura: '180° = cadera extendida' },
  { clave: 'tobilloApoyo', nombre: 'Tobillo de despegue', lectura: 'ángulo entre pierna y pie' },
  {
    clave: 'rodillaLibre',
    nombre: 'Rodilla de la pierna libre',
    lectura: 'menos grados = más recogida',
  },
  { clave: 'tronco', nombre: 'Inclinación del tronco', lectura: '0° = derecho' },
] as const

export type ClaveAngulo = (typeof ANGULOS)[number]['clave']

export type Medidas = Record<ClaveAngulo, number> & {
  /** false si el detector no vio bien alguno de los puntos usados: tomar la medida con cuidado. */
  confiable: boolean
}

/** Posiciones de cada punto en la lista de 33 que entrega el detector (MediaPipe Pose). */
const INDICE = {
  izquierda: { hombro: 11, cadera: 23, rodilla: 25, tobillo: 27, punta: 31 },
  derecha: { hombro: 12, cadera: 24, rodilla: 26, tobillo: 28, punta: 32 },
} as const

const VISIBILIDAD_MINIMA = 0.5

/**
 * Calcula los ángulos de un cuadro. `pierna` es la pierna de despegue del atleta (la suya,
 * no la que queda a la izquierda o a la derecha en la imagen).
 *
 * Los puntos vienen como fracción del ancho y del alto, así que primero se pasan a píxeles:
 * en un video que no es cuadrado, medir ángulos sobre las fracciones los deforma.
 */
export function medir(
  pose: readonly PuntoPose[],
  pierna: Lado,
  ancho: number,
  alto: number,
): Medidas | null {
  if (pose.length < 33) return null

  const usados: PuntoPose[] = []
  const punto = (indice: number): Punto => {
    const p = pose[indice] ?? { x: Number.NaN, y: Number.NaN }
    usados.push(p)
    return { x: p.x * ancho, y: p.y * alto }
  }

  const apoyo = INDICE[pierna]
  const libre = INDICE[pierna === 'izquierda' ? 'derecha' : 'izquierda']

  const cadera = punto(apoyo.cadera)
  const rodilla = punto(apoyo.rodilla)
  const tobillo = punto(apoyo.tobillo)
  const hombro = punto(apoyo.hombro)
  const caderaLibre = punto(libre.cadera)
  const hombroLibre = punto(libre.hombro)

  const medidas = {
    rodillaApoyo: anguloEn(cadera, rodilla, tobillo),
    caderaApoyo: anguloEn(hombro, cadera, rodilla),
    tobilloApoyo: anguloEn(rodilla, tobillo, punto(apoyo.punta)),
    rodillaLibre: anguloEn(caderaLibre, punto(libre.rodilla), punto(libre.tobillo)),
    // El tronco se mide entre el centro de las caderas y el centro de los hombros.
    tronco: inclinacion(puntoMedio(cadera, caderaLibre), puntoMedio(hombro, hombroLibre)),
  }

  if (Object.values(medidas).some((valor) => Number.isNaN(valor))) return null
  return { ...medidas, confiable: usados.every((p) => (p.visibility ?? 1) >= VISIBILIDAD_MINIMA) }
}
