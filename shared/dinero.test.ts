import { describe, expect, it } from 'vitest'
import { formatearDinero, formatearDineroCorto } from './dinero'

describe('formatearDinero', () => {
  it('usa punto para miles y coma para decimales', () => {
    expect(formatearDinero(1190000)).toBe('$1.190.000,00')
    expect(formatearDinero(189.81)).toBe('$189,81')
  })

  it('muestra el cero con decimales', () => {
    expect(formatearDinero(0)).toBe('$0,00')
  })

  it('pone el signo antes del peso', () => {
    expect(formatearDinero(-1700)).toBe('-$1.700,00')
  })

  it('no le pone signo a un valor que se redondea a cero', () => {
    expect(formatearDinero(-0.001)).toBe('$0,00')
  })
})

describe('formatearDineroCorto', () => {
  it('quita los centavos', () => {
    expect(formatearDineroCorto(1190000.4)).toBe('$1.190.000')
    expect(formatearDineroCorto(0)).toBe('$0')
  })
})
