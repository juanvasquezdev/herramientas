import { describe, expect, it } from 'vitest'
import type { Registro } from './modelo'
import { buscarPrueba } from './pruebas'
import { contarPorPrueba, marcasDe, resumir, textoDeCambio } from './resumen'

const alto = buscarPrueba('salto-alto')
const cien = buscarPrueba('100m')

let contador = 0
const registro = (prueba: string, fecha: string, marca: string, lugar = ''): Registro => ({
  id: `r${++contador}`,
  prueba,
  fecha,
  marca,
  lugar,
})

describe('marcasDe', () => {
  it('deja solo las de la prueba, ordenadas por fecha', () => {
    const registros = [
      registro('salto-alto', '2026-06-01', '2,04'),
      registro('100m', '2026-05-01', '10,90'),
      registro('salto-alto', '2026-03-15', '2,00'),
    ]
    expect(marcasDe(registros, alto).map((m) => m.valor)).toEqual([2.0, 2.04])
  })

  it('salta las que están vacías, mal escritas o sin fecha', () => {
    const registros = [
      registro('salto-alto', '2026-06-01', ''),
      registro('salto-alto', '2026-06-02', 'nula'),
      registro('salto-alto', '', '2,00'),
      registro('salto-alto', '2026-06-03', '2,02'),
    ]
    expect(marcasDe(registros, alto)).toHaveLength(1)
  })
})

describe('resumir: pruebas donde gana la marca más alta', () => {
  const registros = [
    registro('salto-alto', '2025-11-20', '1,98', 'Departamental'),
    registro('salto-alto', '2026-03-15', '2,06', 'Grand Prix Cali'),
    registro('salto-alto', '2026-06-01', '2,02', 'Nacional'),
  ]
  const resumen = resumir(registros, alto)

  it('la mejor es la más alta, no la última', () => {
    expect(resumen.mejor).toMatchObject({ valor: 2.06, lugar: 'Grand Prix Cali' })
    expect(resumen.ultima?.valor).toBe(2.02)
  })

  it('mide el cambio de la primera a la última', () => {
    expect(resumen.cambio).toEqual({ diferencia: 0.04, porcentaje: 2, mejoro: true, igual: false })
  })

  it('la mejor del año solo mira el año de la última marca', () => {
    expect(resumen.mejorDelAnio?.valor).toBe(2.06)
    const soloViejas = resumir([registro('salto-alto', '2025-11-20', '1,98')], alto)
    expect(soloViejas.mejorDelAnio?.valor).toBe(1.98)
  })
})

describe('resumir: pruebas donde gana la marca más baja', () => {
  const registros = [
    registro('100m', '2026-02-01', '11,10'),
    registro('100m', '2026-04-01', '10,85'),
    registro('100m', '2026-06-01', '10,92'),
  ]
  const resumen = resumir(registros, cien)

  it('la mejor es el tiempo más bajo', () => {
    expect(resumen.mejor?.valor).toBe(10.85)
  })

  it('bajar el tiempo cuenta como mejorar', () => {
    expect(resumen.cambio).toMatchObject({ diferencia: -0.18, mejoro: true })
  })

  it('subir el tiempo cuenta como empeorar', () => {
    const peor = resumir(
      [registro('100m', '2026-02-01', '10,80'), registro('100m', '2026-04-01', '10,95')],
      cien,
    )
    expect(peor.cambio).toMatchObject({ diferencia: 0.15, mejoro: false, igual: false })
  })
})

describe('resumir: casos borde', () => {
  it('sin marcas todo queda vacío', () => {
    expect(resumir([], alto)).toEqual({
      marcas: [],
      mejor: null,
      ultima: null,
      mejorDelAnio: null,
      cambio: null,
    })
  })

  it('con una sola marca no hay cambio que medir', () => {
    const resumen = resumir([registro('salto-alto', '2026-06-01', '2,00')], alto)
    expect(resumen.mejor?.valor).toBe(2)
    expect(resumen.cambio).toBeNull()
  })

  it('en un empate la mejor es la que se hizo primero', () => {
    const resumen = resumir(
      [
        registro('salto-alto', '2026-03-01', '2,00', 'Primera'),
        registro('salto-alto', '2026-05-01', '2,00', 'Segunda'),
      ],
      alto,
    )
    expect(resumen.mejor?.lugar).toBe('Primera')
    expect(resumen.cambio).toMatchObject({ igual: true, mejoro: false })
  })
})

describe('contarPorPrueba', () => {
  it('cuenta las marcas escritas de cada prueba', () => {
    const conteo = contarPorPrueba([
      registro('salto-alto', '2026-06-01', '2,00'),
      registro('salto-alto', '2026-06-02', '2,02'),
      registro('100m', '2026-06-02', ''),
    ])
    expect(conteo.get('salto-alto')).toBe(2)
    expect(conteo.has('100m')).toBe(false)
  })
})

describe('textoDeCambio', () => {
  it('dice que mejoró cuando el salto sube', () => {
    const resumen = resumir(
      [registro('salto-alto', '2026-03-01', '2,00'), registro('salto-alto', '2026-06-01', '2,06')],
      alto,
    )
    expect(textoDeCambio(resumen, alto)).toEqual({
      valor: '+0,06 m',
      detalle: 'Mejoró 3 % desde 1 mar 2026',
    })
  })

  it('dice que mejoró cuando el tiempo baja, aunque el signo sea negativo', () => {
    const resumen = resumir(
      [registro('100m', '2026-03-01', '11,00'), registro('100m', '2026-06-01', '10,80')],
      cien,
    )
    expect(textoDeCambio(resumen, cien)).toEqual({
      valor: '−0,2 s',
      detalle: 'Mejoró 1,8 % desde 1 mar 2026',
    })
  })

  it('dice que retrocedió cuando empeora y que está igual cuando no cambia', () => {
    const peor = resumir(
      [registro('salto-alto', '2026-03-01', '2,06'), registro('salto-alto', '2026-06-01', '2,00')],
      alto,
    )
    expect(textoDeCambio(peor, alto)?.detalle).toBe('Retrocedió 2,9 % desde 1 mar 2026')

    const igual = resumir(
      [registro('salto-alto', '2026-03-01', '2,00'), registro('salto-alto', '2026-06-01', '2,00')],
      alto,
    )
    expect(textoDeCambio(igual, alto)).toEqual({
      valor: '0,00 m',
      detalle: 'Igual que el 1 mar 2026',
    })
  })

  it('devuelve null con menos de dos marcas', () => {
    expect(textoDeCambio(resumir([], alto), alto)).toBeNull()
  })
})
