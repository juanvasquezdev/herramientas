import { describe, expect, it } from 'vitest'
import { formatearFecha, hoyISO } from './fecha'

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
