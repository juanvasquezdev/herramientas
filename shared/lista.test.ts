import { describe, expect, it } from 'vitest'
import { cambiarEnLista, quitarDeLista } from './lista'

const filas = [
  { id: 'a', nombre: 'Uno' },
  { id: 'b', nombre: 'Dos' },
]

describe('cambiarEnLista', () => {
  it('cambia solo la fila indicada', () => {
    expect(cambiarEnLista(filas, 'b', { nombre: 'Segundo' })).toEqual([
      { id: 'a', nombre: 'Uno' },
      { id: 'b', nombre: 'Segundo' },
    ])
  })

  it('no modifica la lista original', () => {
    cambiarEnLista(filas, 'a', { nombre: 'Otro' })
    expect(filas[0]?.nombre).toBe('Uno')
  })

  it('deja todo igual si el id no existe', () => {
    expect(cambiarEnLista(filas, 'z', { nombre: 'Nada' })).toEqual(filas)
  })
})

describe('quitarDeLista', () => {
  it('quita la fila indicada', () => {
    expect(quitarDeLista(filas, 'a')).toEqual([{ id: 'b', nombre: 'Dos' }])
  })

  it('no deja la lista vacía', () => {
    const una = [{ id: 'a', nombre: 'Uno' }]
    expect(quitarDeLista(una, 'a')).toEqual(una)
  })

  it('permite vaciar si el mínimo es 0', () => {
    expect(quitarDeLista([{ id: 'a' }], 'a', 0)).toEqual([])
  })
})
