import { describe, expect, it } from 'vitest'
import { type Ajustes, ajustesIniciales, esAjustes } from './modelo'

const angulos = {
  rodillaApoyo: 165,
  caderaApoyo: 170,
  tobilloApoyo: 95,
  rodillaLibre: 80,
  tronco: 12,
}

describe('esAjustes', () => {
  it('acepta los ajustes iniciales, también después de pasar por JSON', () => {
    expect(esAjustes(ajustesIniciales())).toBe(true)
    expect(esAjustes(JSON.parse(JSON.stringify(ajustesIniciales())))).toBe(true)
  })

  it('acepta ajustes con un salto de referencia', () => {
    const conReferencia: Ajustes = {
      ...ajustesIniciales(),
      referencia: { nombre: '2,06 Nacional', apoyo: angulos, despegue: angulos, contacto: 0.167 },
    }
    expect(esAjustes(JSON.parse(JSON.stringify(conReferencia)))).toBe(true)
  })

  it('rechaza una pierna que no existe', () => {
    expect(esAjustes({ ...ajustesIniciales(), pierna: 'ambas' })).toBe(false)
  })

  it('rechaza una referencia a la que le falta un ángulo', () => {
    const { tronco: _tronco, ...incompletos } = angulos
    const rara = {
      ...ajustesIniciales(),
      referencia: { nombre: 'x', apoyo: incompletos, despegue: angulos, contacto: null },
    }
    expect(esAjustes(rara)).toBe(false)
  })

  it('rechaza lo que no es un objeto', () => {
    expect(esAjustes(null)).toBe(false)
    expect(esAjustes('30')).toBe(false)
  })
})
