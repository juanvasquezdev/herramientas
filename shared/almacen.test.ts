import { describe, expect, it } from 'vitest'
import { type Almacen, guardar, leer } from './almacen'

/** Un localStorage de mentira que vive en memoria. */
function almacenEnMemoria(datos: Record<string, string> = {}): Almacen {
  return {
    getItem: (clave) => datos[clave] ?? null,
    setItem: (clave, valor) => {
      datos[clave] = valor
    },
  }
}

const esLista = (dato: unknown): dato is number[] => Array.isArray(dato)

describe('leer', () => {
  it('devuelve el valor inicial si no hay nada guardado', () => {
    expect(leer(almacenEnMemoria(), 'clave', [1, 2])).toEqual([1, 2])
  })

  it('devuelve lo que se guardó antes', () => {
    const almacen = almacenEnMemoria()
    guardar(almacen, 'clave', { nombre: 'Ana' })

    expect(leer(almacen, 'clave', { nombre: '' })).toEqual({ nombre: 'Ana' })
  })

  it('vuelve al inicial si el JSON está dañado', () => {
    const almacen = almacenEnMemoria({ clave: '{esto no es json' })
    expect(leer(almacen, 'clave', 'inicial')).toBe('inicial')
  })

  it('vuelve al inicial si el dato no pasa la validación', () => {
    const almacen = almacenEnMemoria({ clave: '"un texto"' })
    expect(leer(almacen, 'clave', [0], esLista)).toEqual([0])
  })

  it('vuelve al inicial si no hay almacén', () => {
    expect(leer(null, 'clave', 7)).toBe(7)
  })

  it('vuelve al inicial si el almacén falla al leer', () => {
    const roto: Almacen = {
      getItem: () => {
        throw new Error('bloqueado')
      },
      setItem: () => {},
    }
    expect(leer(roto, 'clave', 7)).toBe(7)
  })
})

describe('guardar', () => {
  it('guarda como JSON y avisa que pudo', () => {
    const datos: Record<string, string> = {}

    expect(guardar(almacenEnMemoria(datos), 'clave', [1, 2])).toBe(true)
    expect(datos.clave).toBe('[1,2]')
  })

  it('devuelve false si no hay almacén', () => {
    expect(guardar(null, 'clave', 1)).toBe(false)
  })

  it('devuelve false si el almacén está lleno', () => {
    const lleno: Almacen = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    expect(guardar(lleno, 'clave', 1)).toBe(false)
  })
})
