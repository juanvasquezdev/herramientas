import { describe, expect, it } from 'vitest'
import { esTema, otroTema, temaInicial } from './tema'

describe('temaInicial', () => {
  it('sin nada guardado sigue al equipo', () => {
    expect(temaInicial(null, true)).toBe('oscuro')
    expect(temaInicial(null, false)).toBe('claro')
  })

  it('lo que la persona eligió manda sobre el equipo', () => {
    expect(temaInicial('claro', true)).toBe('claro')
    expect(temaInicial('oscuro', false)).toBe('oscuro')
  })

  it('un valor guardado que no es un tema se ignora', () => {
    expect(temaInicial('azul', true)).toBe('oscuro')
    expect(temaInicial('', false)).toBe('claro')
    expect(temaInicial('"oscuro"', false)).toBe('claro')
  })
})

describe('otroTema', () => {
  it('alterna entre los dos', () => {
    expect(otroTema('claro')).toBe('oscuro')
    expect(otroTema('oscuro')).toBe('claro')
  })
})

describe('esTema', () => {
  it('solo acepta los dos temas', () => {
    expect(esTema('claro')).toBe(true)
    expect(esTema('oscuro')).toBe(true)
    expect(esTema('Oscuro')).toBe(false)
    expect(esTema(null)).toBe(false)
    expect(esTema(1)).toBe(false)
  })
})
