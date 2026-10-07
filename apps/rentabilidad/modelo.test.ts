import { describe, expect, it } from 'vitest'
import { analisisInicial, esAnalisis } from './modelo'

describe('esAnalisis', () => {
  it('acepta un análisis recién creado, también después de pasar por JSON', () => {
    expect(esAnalisis(analisisInicial())).toBe(true)
    expect(esAnalisis(JSON.parse(JSON.stringify(analisisInicial())))).toBe(true)
  })

  it('rechaza un modo que no existe', () => {
    expect(esAnalisis({ ...analisisInicial(), modo: 'otro' })).toBe(false)
  })

  it('rechaza listas de costos vacías o con otra forma', () => {
    expect(esAnalisis({ ...analisisInicial(), variables: [] })).toBe(false)
    expect(
      esAnalisis({ ...analisisInicial(), fijos: [{ id: 'a', nombre: 'Arriendo', monto: 300000 }] }),
    ).toBe(false)
  })

  it('rechaza lo que no es un objeto', () => {
    expect(esAnalisis(null)).toBe(false)
    expect(esAnalisis('texto')).toBe(false)
  })
})
