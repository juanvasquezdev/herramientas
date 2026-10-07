import { describe, expect, it } from 'vitest'
import { repartirPagos, sumaDePorcentajes } from './calculo'

const pagos = (...porcentajes: string[]) => porcentajes.map((porcentaje) => ({ porcentaje }))

describe('sumaDePorcentajes', () => {
  it('suma y cuenta vacíos como 0', () => {
    expect(sumaDePorcentajes(pagos('50', '30', ''))).toBe(80)
  })
})

describe('repartirPagos', () => {
  it('reparte según el porcentaje', () => {
    expect(repartirPagos(1000000, pagos('50', '50'))).toEqual([500000, 500000])
    expect(repartirPagos(2400000, pagos('30', '40', '30'))).toEqual([720000, 960000, 720000])
  })

  it('hace que tres tercios sumen exactamente el total', () => {
    const valores = repartirPagos(1000000, pagos('33.33', '33.33', '33.34'))
    expect(valores).toEqual([333300, 333300, 333400])
    expect(valores.reduce((a, b) => a + b, 0)).toBe(1000000)
  })

  it('el último pago absorbe los centavos del redondeo', () => {
    const valores = repartirPagos(100, pagos('33.333', '33.333', '33.334'))
    expect(valores.reduce((a, b) => a + b, 0)).toBe(100)
    expect(valores).toEqual([33.33, 33.33, 33.34])
  })

  it('no fuerza el total cuando los porcentajes no suman 100', () => {
    expect(repartirPagos(1000000, pagos('50', '30'))).toEqual([500000, 300000])
  })

  it('da ceros sin presupuesto y lista vacía sin pagos', () => {
    expect(repartirPagos(0, pagos('50', '50'))).toEqual([0, 0])
    expect(repartirPagos(1000, [])).toEqual([])
  })
})
