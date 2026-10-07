import { describe, expect, it } from 'vitest'
import { crearRespaldo, leerRespaldo } from './archivoDeRespaldo'

interface Nota {
  texto: string
}
const esNota = (dato: unknown): dato is Nota =>
  typeof dato === 'object' && dato !== null && 'texto' in dato && typeof dato.texto === 'string'

describe('respaldo', () => {
  it('lo que se descarga se puede volver a cargar', () => {
    const archivo = crearRespaldo('notas', { texto: 'hola' }, '2026-10-07')
    expect(leerRespaldo(archivo, 'notas', esNota)).toEqual({ ok: true, datos: { texto: 'hola' } })
  })

  it('guarda la fecha y el nombre de la herramienta', () => {
    const archivo = JSON.parse(crearRespaldo('notas', { texto: 'hola' }, '2026-10-07'))
    expect(archivo).toMatchObject({ herramienta: 'notas', fecha: '2026-10-07' })
  })

  it('rechaza un archivo que no es JSON', () => {
    expect(leerRespaldo('esto no es json', 'notas', esNota).ok).toBe(false)
  })

  it('rechaza un JSON que no es una copia', () => {
    expect(leerRespaldo('{"otra":"cosa"}', 'notas', esNota).ok).toBe(false)
    expect(leerRespaldo('[1,2,3]', 'notas', esNota).ok).toBe(false)
  })

  it('rechaza la copia de otra herramienta y dice por qué', () => {
    const archivo = crearRespaldo('cotizador', { texto: 'hola' })
    expect(leerRespaldo(archivo, 'notas', esNota)).toEqual({
      ok: false,
      motivo: 'Esta copia es de otra herramienta.',
    })
  })

  it('rechaza datos con otra forma', () => {
    const archivo = crearRespaldo('notas', { texto: 42 })
    expect(leerRespaldo(archivo, 'notas', esNota).ok).toBe(false)
  })
})
