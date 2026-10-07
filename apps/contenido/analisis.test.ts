import { describe, expect, it } from 'vitest'
import { contarPorEstado, delMes, rendimientoPor, tasaDeInteraccion } from './analisis'
import { type Publicacion, publicacionVacia } from './modelo'

const pub = (cambios: Partial<Publicacion>): Publicacion => ({
  ...publicacionVacia('2026-10-07'),
  ...cambios,
})

describe('delMes', () => {
  it('deja las del mes, ordenadas por fecha', () => {
    const lista = [
      pub({ fecha: '2026-10-20', titulo: 'B' }),
      pub({ fecha: '2026-11-02', titulo: 'Otro mes' }),
      pub({ fecha: '2026-10-03', titulo: 'A' }),
    ]
    expect(delMes(lista, '2026-10').map((p) => p.titulo)).toEqual(['A', 'B'])
  })

  it('no confunde octubre con otros meses que empiezan parecido', () => {
    expect(delMes([pub({ fecha: '2026-01-15' })], '2026-10')).toEqual([])
  })
})

describe('contarPorEstado', () => {
  it('cuenta cada estado y deja en 0 los que no aparecen', () => {
    const conteo = contarPorEstado([
      pub({ estado: 'Idea' }),
      pub({ estado: 'Idea' }),
      pub({ estado: 'Publicado' }),
    ])
    expect(conteo).toEqual({ Idea: 2, Grabado: 0, Editado: 0, Publicado: 1 })
  })
})

describe('tasaDeInteraccion', () => {
  it('son interacciones por cada 100 vistas', () => {
    expect(tasaDeInteraccion({ vistas: '2000', interacciones: '150' })).toBe(7.5)
  })

  it('da 0 sin vistas, en vez de dividir por cero', () => {
    expect(tasaDeInteraccion({ vistas: '', interacciones: '50' })).toBe(0)
    expect(tasaDeInteraccion({ vistas: '0', interacciones: '50' })).toBe(0)
  })
})

describe('rendimientoPor', () => {
  const lista = [
    pub({
      estado: 'Publicado',
      pilar: 'Entrenamiento',
      formato: 'Reel',
      vistas: '4000',
      interacciones: '400',
    }),
    pub({
      estado: 'Publicado',
      pilar: 'Entrenamiento',
      formato: 'Foto',
      vistas: '2000',
      interacciones: '80',
    }),
    pub({
      estado: 'Publicado',
      pilar: 'Competencia',
      formato: 'Reel',
      vistas: '9000',
      interacciones: '900',
    }),
    pub({ estado: 'Editado', pilar: 'Personal', vistas: '99999', interacciones: '1' }),
    pub({ estado: 'Publicado', pilar: 'Educativo', vistas: '', interacciones: '' }),
  ]

  it('promedia las vistas de cada pilar y ordena del mejor al peor', () => {
    expect(rendimientoPor(lista, 'pilar')).toEqual([
      { nombre: 'Competencia', publicaciones: 1, vistasPromedio: 9000, interaccion: 10 },
      { nombre: 'Entrenamiento', publicaciones: 2, vistasPromedio: 3000, interaccion: 8 },
    ])
  })

  it('agrupa igual por formato', () => {
    const porFormato = rendimientoPor(lista, 'formato')
    expect(porFormato[0]).toMatchObject({ nombre: 'Reel', publicaciones: 2, vistasPromedio: 6500 })
    expect(porFormato[1]).toMatchObject({ nombre: 'Foto', vistasPromedio: 2000, interaccion: 4 })
  })

  it('ignora lo que no está publicado o no tiene vistas', () => {
    const nombres = rendimientoPor(lista, 'pilar').map((r) => r.nombre)
    expect(nombres).not.toContain('Personal')
    expect(nombres).not.toContain('Educativo')
  })

  it('devuelve una lista vacía si todavía no hay resultados', () => {
    expect(rendimientoPor([pub({ estado: 'Idea' })], 'pilar')).toEqual([])
  })
})
