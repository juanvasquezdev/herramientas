import { describe, expect, it } from 'vitest'
import { esListaDe, esObjeto, esUnoDe, tieneTextos } from './validar'

describe('esObjeto', () => {
  it('acepta objetos y rechaza listas, null y valores sueltos', () => {
    expect(esObjeto({ a: 1 })).toBe(true)
    expect(esObjeto([])).toBe(false)
    expect(esObjeto(null)).toBe(false)
    expect(esObjeto('texto')).toBe(false)
  })
})

describe('tieneTextos', () => {
  it('exige que todos los campos existan y sean texto', () => {
    expect(tieneTextos({ a: 'x', b: '' }, ['a', 'b'])).toBe(true)
    expect(tieneTextos({ a: 'x' }, ['a', 'b'])).toBe(false)
    expect(tieneTextos({ a: 'x', b: 2 }, ['a', 'b'])).toBe(false)
    expect(tieneTextos(null, ['a'])).toBe(false)
  })
})

describe('esListaDe', () => {
  const esNumero = (dato: unknown) => typeof dato === 'number'

  it('revisa cada elemento', () => {
    expect(esListaDe([1, 2], esNumero)).toBe(true)
    expect(esListaDe([1, 'dos'], esNumero)).toBe(false)
    expect(esListaDe('no es lista', esNumero)).toBe(false)
  })

  it('respeta el mínimo de elementos', () => {
    expect(esListaDe([], esNumero)).toBe(true)
    expect(esListaDe([], esNumero, 1)).toBe(false)
  })
})

describe('esUnoDe', () => {
  it('acepta solo los valores de la lista', () => {
    expect(esUnoDe('Idea', ['Idea', 'Publicado'])).toBe(true)
    expect(esUnoDe('Otro', ['Idea', 'Publicado'])).toBe(false)
    expect(esUnoDe(3, ['Idea'])).toBe(false)
  })
})
