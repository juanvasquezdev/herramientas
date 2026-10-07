import { describe, expect, it } from 'vitest'
import { aMilisegundos, formatearFecha, formatearFechaCorta, hoyISO } from './fecha'

describe('hoyISO', () => {
  it('da la fecha local aunque sea de noche', () => {
    // 7 de octubre a las 8:30 p. m. hora del equipo. Con toISOString() en Colombia
    // esto daría 2026-10-08, que es el error que se evita.
    const noche = new Date(2026, 9, 7, 20, 30)
    expect(hoyISO(noche)).toBe('2026-10-07')
  })

  it('rellena con cero el mes y el día', () => {
    expect(hoyISO(new Date(2026, 0, 5, 9, 0))).toBe('2026-01-05')
  })
})

describe('formatearFecha', () => {
  it('escribe la fecha en español sin correr el día', () => {
    expect(formatearFecha('2026-10-07')).toBe('7 de octubre de 2026')
    expect(formatearFecha('2026-01-01')).toBe('1 de enero de 2026')
  })

  it('devuelve el texto igual si no es una fecha', () => {
    expect(formatearFecha('')).toBe('')
    expect(formatearFecha('mañana')).toBe('mañana')
  })
})

describe('formatearFechaCorta', () => {
  it('abrevia el mes y no corre el día', () => {
    expect(formatearFechaCorta('2026-10-07')).toBe('7 oct 2026')
    expect(formatearFechaCorta('2026-01-01')).toBe('1 ene 2026')
  })

  it('devuelve el texto igual si no es una fecha', () => {
    expect(formatearFechaCorta('pronto')).toBe('pronto')
  })
})

describe('aMilisegundos', () => {
  it('respeta el orden y la distancia entre fechas', () => {
    const unDia = 24 * 60 * 60 * 1000
    expect(aMilisegundos('2026-10-08') - aMilisegundos('2026-10-07')).toBe(unDia)
  })

  it('devuelve NaN si no es una fecha', () => {
    expect(Number.isNaN(aMilisegundos('ayer'))).toBe(true)
  })
})
