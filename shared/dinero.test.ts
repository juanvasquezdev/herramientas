import { describe, expect, it } from 'vitest'
import { aNumero, formatearDinero, redondear } from './dinero'

describe('aNumero', () => {
  it('convierte texto con números', () => {
    expect(aNumero('1500')).toBe(1500)
    expect(aNumero(' 2.5 ')).toBe(2.5)
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

describe('redondear', () => {
  it('deja dos decimales', () => {
    expect(redondear(189.814)).toBe(189.81)
    expect(redondear(189.816)).toBe(189.82)
  })

  it('redondea hacia arriba el medio centavo', () => {
    expect(redondear(1.005)).toBe(1.01)
  })

  it('limpia el error de coma flotante', () => {
    expect(redondear(0.1 + 0.2)).toBe(0.3)
  })
})

describe('formatearDinero', () => {
  it('usa punto para miles y coma para decimales', () => {
    expect(formatearDinero(1190000)).toBe('$1.190.000,00')
    expect(formatearDinero(189.81)).toBe('$189,81')
  })

  it('muestra el cero con decimales', () => {
    expect(formatearDinero(0)).toBe('$0,00')
  })
})
