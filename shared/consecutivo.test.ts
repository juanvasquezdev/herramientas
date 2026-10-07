import { describe, expect, it } from 'vitest'
import { siguienteNumero } from './consecutivo'

describe('siguienteNumero', () => {
  it('sube el consecutivo y respeta los ceros', () => {
    expect(siguienteNumero('COT-0001', 'COT-0001')).toBe('COT-0002')
    expect(siguienteNumero('COT-0099', 'COT-0001')).toBe('COT-0100')
  })

  it('crece cuando se acaban los dígitos', () => {
    expect(siguienteNumero('COT-9999', 'COT-0001')).toBe('COT-10000')
  })

  it('funciona con otros formatos que terminan en número', () => {
    expect(siguienteNumero('2026-15', 'X')).toBe('2026-16')
    expect(siguienteNumero('7', 'X')).toBe('8')
  })

  it('agrega -2 cuando no termina en número', () => {
    expect(siguienteNumero('Propuesta', 'X')).toBe('Propuesta-2')
  })

  it('usa el número inicial si está vacío', () => {
    expect(siguienteNumero('   ', 'PRO-0001')).toBe('PRO-0001')
  })
})
