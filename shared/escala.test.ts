import { describe, expect, it } from 'vitest'
import { escalaLineal, marcasDelEje } from './escala'

describe('marcasDelEje', () => {
  it('da marcas redondas que cubren el rango', () => {
    expect(marcasDelEje(0, 874)).toEqual([0, 200, 400, 600, 800, 1000])
    expect(marcasDelEje(0, 100)).toEqual([0, 20, 40, 60, 80, 100])
  })

  it('funciona con decimales sin ruido de coma flotante', () => {
    expect(marcasDelEje(1.92, 2.06)).toEqual([1.9, 1.95, 2, 2.05, 2.1])
  })

  it('abre el rango cuando solo hay un valor', () => {
    const marcas = marcasDelEje(2.06, 2.06)
    expect(marcas[0]).toBeLessThan(2.06)
    expect(marcas.at(-1)).toBeGreaterThan(2.06)
  })

  it('no falla con valores que no son números', () => {
    expect(marcasDelEje(Number.NaN, 5)).toEqual([0, 1])
  })
})

describe('escalaLineal', () => {
  it('reparte el rango en los píxeles', () => {
    const y = escalaLineal(0, 100, 200, 0)
    expect(y(0)).toBe(200)
    expect(y(50)).toBe(100)
    expect(y(100)).toBe(0)
  })

  it('pone todo en el centro si el rango es cero', () => {
    expect(escalaLineal(5, 5, 0, 100)(5)).toBe(50)
  })
})
