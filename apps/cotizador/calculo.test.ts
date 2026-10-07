import { describe, expect, it } from 'vitest'
import { calcularTotales, precioUnitario, totalItem } from './calculo'

describe('totalItem', () => {
  it('multiplica cantidad por precio', () => {
    expect(totalItem({ cantidad: '3', precio: '25000' })).toBe(75000)
  })

  it('cuenta un campo vacío como 0', () => {
    expect(totalItem({ cantidad: '', precio: '25000' })).toBe(0)
    expect(totalItem({ cantidad: '2', precio: '' })).toBe(0)
  })

  it('cuenta como 0 lo que no es número', () => {
    expect(totalItem({ cantidad: 'dos', precio: '1000' })).toBe(0)
  })

  it('no deja pasar negativos', () => {
    expect(totalItem({ cantidad: '-2', precio: '1000' })).toBe(0)
    expect(totalItem({ cantidad: '2', precio: '-1000' })).toBe(0)
  })

  it('acepta cantidades con decimales', () => {
    expect(totalItem({ cantidad: '1.5', precio: '80000' })).toBe(120000)
  })
})

describe('precioUnitario', () => {
  it('devuelve el precio como número', () => {
    expect(precioUnitario({ precio: '25000' })).toBe(25000)
  })

  it('cuenta vacío y negativo como 0', () => {
    expect(precioUnitario({ precio: '' })).toBe(0)
    expect(precioUnitario({ precio: '-500' })).toBe(0)
  })
})

describe('calcularTotales', () => {
  it('suma las líneas y aplica el 19 %', () => {
    const items = [
      { cantidad: '1', precio: '800000' },
      { cantidad: '2', precio: '100000' },
    ]

    expect(calcularTotales(items, '19')).toEqual({
      subtotal: 1000000,
      impuesto: 190000,
      total: 1190000,
    })
  })

  it('con impuesto en 0 el total es el subtotal', () => {
    expect(calcularTotales([{ cantidad: '4', precio: '2500' }], '0')).toEqual({
      subtotal: 10000,
      impuesto: 0,
      total: 10000,
    })
  })

  it('trata el impuesto vacío o negativo como 0', () => {
    const items = [{ cantidad: '1', precio: '5000' }]

    expect(calcularTotales(items, '').impuesto).toBe(0)
    expect(calcularTotales(items, '-19').impuesto).toBe(0)
  })

  it('redondea el impuesto a centavos', () => {
    // 999 * 19 % = 189,81
    expect(calcularTotales([{ cantidad: '1', precio: '999' }], '19')).toEqual({
      subtotal: 999,
      impuesto: 189.81,
      total: 1188.81,
    })
  })

  it('no arrastra errores de coma flotante al sumar', () => {
    // 0.1 + 0.2 en JavaScript da 0.30000000000000004
    const items = [
      { cantidad: '1', precio: '0.1' },
      { cantidad: '1', precio: '0.2' },
    ]

    expect(calcularTotales(items, '0').subtotal).toBe(0.3)
  })

  it('una lista sin valores da todo en 0', () => {
    expect(calcularTotales([{ cantidad: '1', precio: '' }], '19')).toEqual({
      subtotal: 0,
      impuesto: 0,
      total: 0,
    })
  })
})
