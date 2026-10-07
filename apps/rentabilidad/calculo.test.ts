import { describe, expect, it } from 'vitest'
import { calcular, sumarCostos } from './calculo'
import { type Analisis, analisisInicial } from './modelo'

/** Un análisis de ejemplo: tortas que cuestan 12.000 de hacer, con 300.000 de fijos al mes. */
function tortas(cambios: Partial<Analisis> = {}): Analisis {
  return {
    ...analisisInicial(),
    variables: [
      { id: 'a', nombre: 'Ingredientes', monto: '10000' },
      { id: 'b', nombre: 'Empaque', monto: '2000' },
    ],
    fijos: [{ id: 'c', nombre: 'Arriendo', monto: '300000' }],
    unidades: '100',
    comision: '0',
    modo: 'margen',
    margen: '25',
    ...cambios,
  }
}

describe('sumarCostos', () => {
  it('suma los montos y cuenta vacíos y negativos como 0', () => {
    expect(
      sumarCostos([{ monto: '1500' }, { monto: '' }, { monto: '-200' }, { monto: '500.5' }]),
    ).toBe(2000.5)
  })
})

describe('calcular: buscar el precio a partir del margen', () => {
  it('reparte los costos fijos entre las unidades', () => {
    const r = calcular(tortas())
    expect(r.costoVariable).toBe(12000)
    expect(r.fijoPorUnidad).toBe(3000)
    expect(r.costoPorUnidad).toBe(15000)
  })

  it('pone el margen sobre el precio de venta, no sobre el costo', () => {
    // Costo 15.000 y margen 25 % -> 15.000 / 0,75 = 20.000 (no 18.750)
    const r = calcular(tortas())
    expect(r.precio).toBe(20000)
    expect(r.gananciaPorUnidad).toBe(5000)
    expect(r.margen).toBe(25)
  })

  it('sube el precio para que la comisión no se coma el margen', () => {
    // 15.000 / (1 - 0,25 - 0,05) = 21.428,57
    const r = calcular(tortas({ comision: '5' }))
    expect(r.precio).toBe(21428.57)
    expect(r.comisionPorUnidad).toBe(1071.43)
    expect(r.margen).toBe(25)
  })

  it('avisa cuando margen y comisión suman 100 % o más', () => {
    const r = calcular(tortas({ margen: '95', comision: '5' }))
    expect(r.margenImposible).toBe(true)
    expect(r.precio).toBe(0)
  })
})

describe('calcular: revisar un precio que ya existe', () => {
  it('calcula cuánto queda de verdad', () => {
    const r = calcular(tortas({ modo: 'precio', precio: '18000' }))
    expect(r.gananciaPorUnidad).toBe(3000)
    expect(r.margen).toBe(16.7)
    expect(r.gananciaMensual).toBe(300000)
  })

  it('muestra la pérdida cuando el precio no cubre los costos', () => {
    const r = calcular(tortas({ modo: 'precio', precio: '14000' }))
    expect(r.gananciaPorUnidad).toBe(-1000)
    expect(r.margen).toBe(-7.1)
    expect(r.gananciaMensual).toBe(-100000)
  })

  it('no calcula margen sin precio', () => {
    expect(calcular(tortas({ modo: 'precio', precio: '' })).margen).toBe(0)
  })
})

describe('calcular: punto de equilibrio', () => {
  it('sale de lo que deja cada venta antes de costos fijos', () => {
    // Cada torta a 20.000 deja 8.000 después de costos variables: 300.000 / 8.000 = 37,5 -> 38
    expect(calcular(tortas()).equilibrioUnidades).toBe(38)
  })

  it('redondea hacia arriba: con media unidad menos todavía se pierde', () => {
    const r = calcular(tortas({ modo: 'precio', precio: '15000' }))
    // 300.000 / 3.000 = 100 exactas
    expect(r.equilibrioUnidades).toBe(100)
    expect(r.gananciaMensual).toBe(0)
  })

  it('es 0 cuando no hay costos fijos', () => {
    expect(
      calcular(tortas({ fijos: [{ id: 'c', nombre: '', monto: '' }] })).equilibrioUnidades,
    ).toBe(0)
  })

  it('es null cuando el precio no cubre ni los costos variables', () => {
    expect(calcular(tortas({ modo: 'precio', precio: '11000' })).equilibrioUnidades).toBeNull()
  })
})

describe('calcular: sin unidades', () => {
  it('no divide por cero y avisa que los fijos quedaron sin repartir', () => {
    const r = calcular(tortas({ unidades: '0' }))
    expect(r.fijosSinRepartir).toBe(true)
    expect(r.fijoPorUnidad).toBe(0)
    expect(Number.isFinite(r.precio)).toBe(true)
    expect(r.precio).toBe(16000)
    expect(r.gananciaMensual).toBe(-300000)
  })

  it('trata el campo vacío igual que 0', () => {
    expect(calcular(tortas({ unidades: '' })).fijosSinRepartir).toBe(true)
  })

  it('una calculadora recién abierta da todo en 0 sin errores', () => {
    const r = calcular(analisisInicial())
    expect(r.precio).toBe(0)
    expect(r.gananciaMensual).toBe(0)
    expect(r.equilibrioUnidades).toBe(0)
    expect(r.fijosSinRepartir).toBe(false)
  })
})
