import { describe, expect, it } from 'vitest'
import { contarPorCategoria, filtrar, leerCategoria, normalizar } from './filtro'

const lista = [
  {
    nombre: 'Cotizador',
    resumen: 'Arma una cotización y expórtala en PDF.',
    categoria: 'negocio' as const,
  },
  {
    nombre: 'Registro de marcas',
    resumen: 'Lleva las marcas de un atleta y saca el PDF.',
    categoria: 'deporte' as const,
  },
  {
    nombre: 'Control por gestos',
    resumen: 'Maneja diapositivas con la mano.',
    categoria: 'experimentos' as const,
  },
]

describe('normalizar', () => {
  it('quita tildes, mayúsculas y espacios de los lados', () => {
    expect(normalizar('  Cotización ÁGIL ')).toBe('cotizacion agil')
  })
})

describe('filtrar', () => {
  it('sin texto y con "todas" devuelve la lista completa', () => {
    expect(filtrar(lista, '', 'todas')).toHaveLength(3)
  })

  it('encuentra sin importar tildes ni orden de las palabras', () => {
    expect(filtrar(lista, 'cotizacion', 'todas').map((h) => h.nombre)).toEqual(['Cotizador'])
    expect(filtrar(lista, 'pdf atleta', 'todas').map((h) => h.nombre)).toEqual([
      'Registro de marcas',
    ])
  })

  it('busca también en el nombre de la categoría', () => {
    expect(filtrar(lista, 'deporte', 'todas')).toHaveLength(1)
  })

  it('combina texto y categoría', () => {
    expect(filtrar(lista, 'pdf', 'negocio').map((h) => h.nombre)).toEqual(['Cotizador'])
    expect(filtrar(lista, 'pdf', 'experimentos')).toEqual([])
  })
})

describe('contarPorCategoria', () => {
  it('cuenta cada categoría y el total', () => {
    expect(contarPorCategoria(lista)).toEqual({
      todas: 3,
      negocio: 1,
      deporte: 1,
      contenido: 0,
      experimentos: 1,
    })
  })
})

describe('leerCategoria', () => {
  it('acepta solo categorías conocidas', () => {
    expect(leerCategoria('deporte')).toBe('deporte')
    expect(leerCategoria('inventada')).toBe('todas')
    expect(leerCategoria(null)).toBe('todas')
    expect(leerCategoria('toString')).toBe('todas')
  })
})
