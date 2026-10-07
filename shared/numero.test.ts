import { describe, expect, it } from 'vitest'
import { aNumero, aPositivo, formatearNumero, porcentajeDe, redondear } from './numero'

describe('aNumero', () => {
  it('convierte texto con números', () => {
    expect(aNumero('1500')).toBe(1500)
    expect(aNumero(' 2.5 ')).toBe(2.5)
  })

  it('acepta coma decimal', () => {
    expect(aNumero('2,06')).toBe(2.06)
  })

  it('devuelve 0 con vacío o texto que no es número', () => {
    expect(aNumero('')).toBe(0)
    expect(aNumero('abc')).toBe(0)
    expect(aNumero('12abc')).toBe(0)
  })

  it('devuelve 0 con valores que no son finitos', () => {
    expect(aNumero(Number.NaN)).toBe(0)
    expect(aNumero(Number.POSITIVE_INFINITY)).toBe(0)
  })
})

describe('aPositivo', () => {
  it('deja pasar los positivos y sube los negativos a 0', () => {
    expect(aPositivo('12')).toBe(12)
    expect(aPositivo('-12')).toBe(0)
    expect(aPositivo('')).toBe(0)
  })
})

describe('redondear', () => {
  it('deja dos decimales por defecto', () => {
    expect(redondear(189.814)).toBe(189.81)
    expect(redondear(189.816)).toBe(189.82)
  })

  it('redondea hacia arriba el medio centavo', () => {
    expect(redondear(1.005)).toBe(1.01)
  })

  it('limpia el error de coma flotante', () => {
    expect(redondear(0.1 + 0.2)).toBe(0.3)
  })

  it('acepta otra cantidad de decimales', () => {
    expect(redondear(12.345, 1)).toBe(12.3)
    expect(redondear(12.5, 0)).toBe(13)
  })
})

describe('porcentajeDe', () => {
  it('calcula la proporción', () => {
    expect(porcentajeDe(25, 200)).toBe(12.5)
  })

  it('devuelve 0 cuando el total es 0', () => {
    expect(porcentajeDe(5, 0)).toBe(0)
  })
})

describe('formatearNumero', () => {
  it('usa punto para miles y coma para decimales, sin ceros de relleno', () => {
    expect(formatearNumero(12500)).toBe('12.500')
    expect(formatearNumero(2.06)).toBe('2,06')
    expect(formatearNumero(7.26, 1)).toBe('7,3')
  })
})
