import { formatearNumero } from '../../shared/numero'
import type { Sentido, Unidad } from './pruebas'

/**
 * Leer y escribir marcas. Los tiempos se guardan en segundos pero se escriben como en
 * una planilla de resultados: 10,52 o 1:52,45 o 2:05:30.
 */

/**
 * Convierte lo escrito en un número. Devuelve null si no se entiende o no es mayor que 0.
 * Acepta coma o punto decimal. En pruebas de tiempo acepta minutos y horas con dos puntos.
 */
export function leerMarca(texto: string, unidad: Unidad): number | null {
  const limpio = texto.trim().replace(',', '.')
  if (limpio === '') return null

  if (unidad !== 's') {
    if (!/^\d+(\.\d+)?$/.test(limpio)) return null
    const valor = Number(limpio)
    return valor > 0 ? valor : null
  }

  // Tiempo: [horas:]minutos:segundos o solo segundos.
  const partes = limpio.split(':')
  if (partes.length > 3) return null
  const segundos = partes.at(-1) ?? ''
  const enteros = partes.slice(0, -1)
  if (!/^\d+(\.\d+)?$/.test(segundos) || !enteros.every((parte) => /^\d+$/.test(parte))) return null
  // Con minutos delante, los segundos van de 0 a 59; lo mismo los minutos si hay horas.
  if (enteros.length > 0 && Number(segundos) >= 60) return null
  if (enteros.length === 2 && Number(enteros[1]) >= 60) return null

  const total =
    enteros.reduce((suma, parte) => suma * 60 + Number(parte), 0) * 60 + Number(segundos)
  return total > 0 ? total : null
}

function dosCifras(valor: number): string {
  return String(valor).padStart(2, '0')
}

/** 2.06 m -> "2,06 m". 112.45 s -> "1:52,45". 7530 s -> "2:05:30". */
export function formatearMarca(valor: number, unidad: Unidad): string {
  if (unidad === 'pts') return `${formatearNumero(valor, 0)} pts`
  if (unidad !== 's')
    return `${valor.toLocaleString('es-CO', { minimumFractionDigits: unidad === 'm' ? 2 : 0, maximumFractionDigits: 2 })} ${unidad}`

  if (valor < 60)
    return `${valor.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} s`

  // Se trabaja en centésimas enteras para que 59,999 no se muestre como 0:60,00.
  const centesimas = Math.round(valor * 100)
  const horas = Math.floor(centesimas / 360000)
  const minutos = Math.floor((centesimas % 360000) / 6000)
  const segundos = Math.floor((centesimas % 6000) / 100)
  const resto = centesimas % 100

  if (horas > 0) return `${horas}:${dosCifras(minutos)}:${dosCifras(segundos)}`
  return `${minutos}:${dosCifras(segundos)},${dosCifras(resto)}`
}

/** Un ejemplo de cómo escribir la marca, para el campo vacío. */
export function ejemploDeMarca(unidad: Unidad): string {
  const ejemplos: Record<Unidad, string> = {
    m: '2,06',
    cm: '65',
    kg: '120',
    s: '10,52 o 1:52,45',
    pts: '7250',
  }
  return ejemplos[unidad]
}

/** ¿`a` es mejor marca que `b`? */
export function esMejor(a: number, b: number, sentido: Sentido): boolean {
  return sentido === 'mayor' ? a > b : a < b
}
