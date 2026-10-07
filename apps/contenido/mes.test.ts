import { describe, expect, it } from 'vitest'
import { fechaParaNueva, moverMes, nombreDelMes, semanasDelMes } from './mes'

describe('moverMes', () => {
  it('avanza y retrocede', () => {
    expect(moverMes('2026-10', 1)).toBe('2026-11')
    expect(moverMes('2026-10', -1)).toBe('2026-09')
  })

  it('cambia de año cuando toca', () => {
    expect(moverMes('2026-12', 1)).toBe('2027-01')
    expect(moverMes('2026-01', -1)).toBe('2025-12')
  })
})

describe('nombreDelMes', () => {
  it('lo escribe en español', () => {
    expect(nombreDelMes('2026-10')).toBe('octubre de 2026')
  })
})

describe('semanasDelMes', () => {
  it('octubre de 2026 empieza en jueves y tiene 31 días', () => {
    const semanas = semanasDelMes('2026-10')
    expect(semanas[0]).toEqual([
      null,
      null,
      null,
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ])
    expect(semanas.flat().filter(Boolean)).toHaveLength(31)
    expect(semanas.at(-1)).toEqual([
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
      null,
    ])
  })

  it('cada semana tiene siete casillas', () => {
    expect(semanasDelMes('2026-10').every((semana) => semana.length === 7)).toBe(true)
  })

  it('un mes que empieza en lunes no deja casillas vacías al inicio', () => {
    // Junio de 2026 empieza en lunes.
    expect(semanasDelMes('2026-06')[0]?.[0]).toBe('2026-06-01')
  })

  it('un mes que empieza en domingo deja seis vacías al inicio', () => {
    // Noviembre de 2026 empieza en domingo.
    expect(semanasDelMes('2026-11')[0]).toEqual([null, null, null, null, null, null, '2026-11-01'])
  })

  it('cuenta bien febrero en año bisiesto', () => {
    expect(semanasDelMes('2028-02').flat().filter(Boolean)).toHaveLength(29)
  })
})

describe('fechaParaNueva', () => {
  it('usa hoy si se está viendo el mes actual', () => {
    expect(fechaParaNueva('2026-10', '2026-10-07')).toBe('2026-10-07')
  })

  it('usa el día 1 si se está viendo otro mes', () => {
    expect(fechaParaNueva('2026-11', '2026-10-07')).toBe('2026-11-01')
  })
})
