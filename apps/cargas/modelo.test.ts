import { describe, expect, it } from 'vitest'
import { agregarSemana, esPlan, planInicial, quitarSemana } from './modelo'

describe('agregarSemana', () => {
  it('copia los ejercicios de la semana activa con ids nuevos y la deja activa', () => {
    const plan = planInicial()
    const primera = plan.semanas[0]
    if (!primera) throw new Error('sin semana')
    primera.ejercicios = [
      { id: 'a', dia: 'Martes', nombre: 'Cargada', series: '5', reps: '3', kg: '80' },
    ]

    const conDos = agregarSemana(plan)
    const nueva = conDos.semanas[1]

    expect(conDos.semanas).toHaveLength(2)
    expect(nueva?.nombre).toBe('Semana 2')
    expect(nueva?.ejercicios[0]).toMatchObject({ dia: 'Martes', nombre: 'Cargada', kg: '80' })
    expect(nueva?.ejercicios[0]?.id).not.toBe('a')
    expect(conDos.activa).toBe(nueva?.id)
  })
})

describe('quitarSemana', () => {
  it('nunca quita la única semana', () => {
    const plan = planInicial()
    expect(quitarSemana(plan, plan.activa)).toBe(plan)
  })

  it('al quitar la activa deja activa la anterior', () => {
    const plan = agregarSemana(agregarSemana(planInicial()))
    const [primera, segunda, tercera] = plan.semanas
    const sinLaUltima = quitarSemana(plan, tercera?.id ?? '')

    expect(sinLaUltima.semanas.map((s) => s.id)).toEqual([primera?.id, segunda?.id])
    expect(sinLaUltima.activa).toBe(segunda?.id)
  })

  it('al quitar otra semana la activa no cambia', () => {
    const plan = agregarSemana(planInicial())
    const primera = plan.semanas[0]
    expect(quitarSemana(plan, primera?.id ?? '').activa).toBe(plan.activa)
  })
})

describe('esPlan', () => {
  it('acepta un plan nuevo, también después de pasar por JSON', () => {
    expect(esPlan(planInicial())).toBe(true)
    expect(esPlan(JSON.parse(JSON.stringify(agregarSemana(planInicial()))))).toBe(true)
  })

  it('rechaza un día que no existe', () => {
    const plan = planInicial()
    const raro = {
      ...plan,
      semanas: [
        {
          ...plan.semanas[0],
          ejercicios: [{ id: 'a', dia: 'Lunes 2', nombre: '', series: '', reps: '', kg: '' }],
        },
      ],
    }
    expect(esPlan(raro)).toBe(false)
  })

  it('rechaza un plan cuya semana activa no existe', () => {
    expect(esPlan({ ...planInicial(), activa: 'no-existe' })).toBe(false)
  })

  it('rechaza un plan sin semanas', () => {
    expect(esPlan({ ...planInicial(), semanas: [] })).toBe(false)
  })
})
