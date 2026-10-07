import { describe, expect, it } from 'vitest'
import { paraNombreDeArchivo } from './archivo'

describe('paraNombreDeArchivo', () => {
  it('quita tildes, espacios y símbolos', () => {
    expect(paraNombreDeArchivo('Página web / Ana María')).toBe('pagina-web-ana-maria')
  })

  it('usa el respaldo si no queda nada', () => {
    expect(paraNombreDeArchivo('  ¿? ', 'propuesta')).toBe('propuesta')
  })
})
