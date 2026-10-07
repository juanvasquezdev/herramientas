import { redondear } from '../../shared/numero'
import type { Medidas } from './angulos'

/**
 * Cuentas de tiempo. El video se recorre por cuadros, no por segundos: así "un cuadro
 * adelante" siempre es exactamente un cuadro y el tiempo de contacto sale de contar cuadros.
 */

/** En qué cuadro cae un instante del video. El primero es el 0. */
export function cuadroEn(tiempo: number, fps: number): number {
  // El pequeño margen evita que 0,1 s a 30 fps (que da 2,9999...) caiga en el cuadro 2.
  return Math.max(0, Math.floor(tiempo * fps + 1e-6))
}

/**
 * El instante al que hay que mover el video para ver un cuadro. Se apunta al centro del
 * cuadro y no a su inicio: en el borde entre dos, el navegador puede mostrar el anterior.
 */
export function tiempoDelCuadro(cuadro: number, fps: number): number {
  return (cuadro + 0.5) / fps
}

/**
 * Segundos reales que pasan en `cuadros` cuadros.
 * `camaraLenta` es cuántas veces más lento se reproduce el video frente a la realidad:
 * un video grabado a 240 cuadros por segundo que se reproduce a 30 va 8 veces más lento.
 */
export function segundosReales(cuadros: number, fps: number, camaraLenta: number): number {
  return cuadros / (fps * camaraLenta)
}

export interface Contacto {
  segundos: number
  /** El error posible de la medida: cada marca puede estar corrida hasta un cuadro. */
  margen: number
}

/** Tiempo entre el apoyo y el despegue. null si las marcas están al revés o sobre el mismo cuadro. */
export function tiempoDeContacto(
  cuadroApoyo: number,
  cuadroDespegue: number,
  fps: number,
  camaraLenta: number,
): Contacto | null {
  if (cuadroDespegue <= cuadroApoyo || fps <= 0 || camaraLenta <= 0) return null
  return {
    segundos: redondear(segundosReales(cuadroDespegue - cuadroApoyo, fps, camaraLenta), 3),
    margen: redondear(segundosReales(1, fps, camaraLenta), 3),
  }
}

/** Lo que se midió en un cuadro del tramo entre el apoyo y el despegue. */
export interface Muestra {
  /** Segundos reales desde el apoyo. */
  tiempo: number
  medidas: Medidas
}

export interface ResumenDelTramo {
  /** El momento en que la rodilla de despegue estuvo más doblada. */
  flexionMaxima: { angulo: number; tiempo: number }
  /** Cuántos grados se dobló la rodilla desde el apoyo hasta ese momento. */
  amortiguacion: number
  /** Cuántos grados se extendió desde ese momento hasta el despegue. */
  extension: number
}

/** Con menos muestras que estas no se suaviza: se perdería el movimiento que se quiere ver. */
const MINIMO_PARA_SUAVIZAR = 9

/**
 * El detector se equivoca unos grados de un cuadro a otro aunque el atleta casi no se mueva.
 * Para que ese temblor no invente una "flexión máxima", cada valor se promedia con sus dos
 * vecinos. Los extremos (apoyo y despegue) se dejan como están. Solo se hace cuando hay
 * suficientes cuadros: en un video a 30 por segundo el contacto dura 5 o 6 y se dejan crudos.
 */
export function suavizar(valores: readonly number[]): number[] {
  if (valores.length < MINIMO_PARA_SUAVIZAR) return [...valores]
  return valores.map((valor, i) => {
    const anterior = valores[i - 1]
    const siguiente = valores[i + 1]
    return anterior === undefined || siguiente === undefined
      ? valor
      : (anterior + valor + siguiente) / 3
  })
}

/** El ángulo de la rodilla de despegue en cada muestra, ya suavizado. */
export function rodillaEnElTramo(muestras: readonly Muestra[]): number[] {
  return suavizar(muestras.map((muestra) => muestra.medidas.rodillaApoyo))
}

export function resumirTramo(muestras: readonly Muestra[]): ResumenDelTramo | null {
  if (muestras.length < 2) return null
  const rodilla = rodillaEnElTramo(muestras)
  const enElApoyo = rodilla[0] ?? 0
  const enElDespegue = rodilla.at(-1) ?? 0

  let indiceMinimo = 0
  rodilla.forEach((angulo, i) => {
    if (angulo < (rodilla[indiceMinimo] ?? angulo)) indiceMinimo = i
  })
  const minimo = rodilla[indiceMinimo] ?? enElApoyo

  return {
    flexionMaxima: { angulo: redondear(minimo, 0), tiempo: muestras[indiceMinimo]?.tiempo ?? 0 },
    amortiguacion: redondear(enElApoyo - minimo, 0),
    extension: redondear(enElDespegue - minimo, 0),
  }
}
