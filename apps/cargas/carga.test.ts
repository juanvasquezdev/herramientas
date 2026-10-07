import { describe, expect, it } from 'vitest'
import { comparar, repeticionesDe, resumirSemana, superaElTope, tonelajeDe } from './carga'
import type { Dia, Ejercicio, Semana } from './modelo'

let contador = 0
const ejercicio = (dia: Dia, series: string, reps: string, kg: string): Ejercicio => ({
  id: `e${++contador}`,
  dia,
  nombre: 'Sentadilla',
  series,
  reps,
  kg,
})
const semana = (...ejercicios: Ejercicio[]): Semana => ({ id: 's', nombre: 'Semana 1', ejercicios })

describe('cuentas de un ejercicio', () => {
  it('repeticiones = series × reps', () => {
    expect(repeticionesDe({ series: '4', reps: '6' })).toBe(24)
  })

  it('tonelaje = series × reps × kg', () => {
    expect(tonelajeDe({ series: '4', reps: '6', kg: '100' })).toBe(2400)
    expect(tonelajeDe({ series: '3', reps: '5', kg: '82.5' })).toBe(1237.5)
  })

  it('sin peso el tonelaje es 0 pero las repeticiones cuentan', () => {
    expect(tonelajeDe({ series: '3', reps: '10', kg: '' })).toBe(0)
    expect(repeticionesDe({ series: '3', reps: '10' })).toBe(30)
  })

  it('campos vacíos o negativos dan 0', () => {
    expect(tonelajeDe({ series: '', reps: '6', kg: '100' })).toBe(0)
    expect(tonelajeDe({ series: '-4', reps: '6', kg: '100' })).toBe(0)
  })
})

describe('resumirSemana', () => {
  const plan = semana(
    ejercicio('Lunes', '4', '5', '100'), // 2.000
    ejercicio('Lunes', '3', '8', '50'), // 1.200
    ejercicio('Jueves', '4', '5', '40'), // 800
  )
  const resumen = resumirSemana(plan, 'tonelaje')

  it('suma la semana y cada día', () => {
    expect(resumen.total).toBe(4000)
    expect(resumen.porDia.find((d) => d.dia === 'Lunes')?.carga).toBe(3200)
    expect(resumen.porDia.find((d) => d.dia === 'Jueves')?.carga).toBe(800)
    expect(resumen.porDia).toHaveLength(7)
  })

  it('dice qué parte de la semana se hace cada día', () => {
    expect(resumen.porDia.find((d) => d.dia === 'Lunes')?.porcentaje).toBe(80)
    expect(resumen.porDia.find((d) => d.dia === 'Martes')?.porcentaje).toBe(0)
  })

  it('cuenta los días de entrenamiento y encuentra el más cargado', () => {
    expect(resumen.diasDeEntrenamiento).toBe(2)
    expect(resumen.diaMasCargado).toMatchObject({ dia: 'Lunes', porcentaje: 80 })
  })

  it('calcula el peso medio por repetición', () => {
    // 4.000 kg en 20 + 24 + 20 = 64 repeticiones
    expect(resumen.pesoMedio).toBe(62.5)
  })

  it('el peso medio no cuenta los ejercicios sin carga', () => {
    const conSaltos = semana(ejercicio('Lunes', '4', '5', '100'), ejercicio('Lunes', '4', '10', ''))
    expect(resumirSemana(conSaltos, 'tonelaje').pesoMedio).toBe(100)
  })

  it('puede medir en repeticiones en vez de kilos', () => {
    expect(resumirSemana(plan, 'repeticiones').total).toBe(64)
  })

  it('una semana vacía da ceros y ningún día más cargado', () => {
    const vacia = resumirSemana(semana(ejercicio('Lunes', '', '', '')), 'tonelaje')
    expect(vacia).toMatchObject({
      total: 0,
      diasDeEntrenamiento: 0,
      diaMasCargado: null,
      pesoMedio: 0,
    })
    expect(vacia.porDia.every((d) => d.porcentaje === 0)).toBe(true)
  })

  it('entrenar dos días no dispara nada por sí solo', () => {
    // El original avisaba "sobreentrenamiento" a cualquiera que entrenara dos días o menos.
    const dosDias = resumirSemana(
      semana(ejercicio('Lunes', '4', '5', '100'), ejercicio('Jueves', '4', '5', '100')),
      'tonelaje',
    )
    expect(dosDias.diaMasCargado?.porcentaje).toBe(50)
  })
})

describe('comparar con la semana anterior', () => {
  it('da el cambio en kilos y en porcentaje', () => {
    expect(comparar(11000, 10000)).toEqual({ diferencia: 1000, porcentaje: 10 })
    expect(comparar(9000, 10000)).toEqual({ diferencia: -1000, porcentaje: -10 })
  })

  it('no compara si no hay semana anterior o estaba vacía', () => {
    expect(comparar(11000, undefined)).toBeNull()
    expect(comparar(11000, 0)).toBeNull()
  })
})

describe('superaElTope', () => {
  it('avisa solo cuando la subida pasa el tope', () => {
    expect(superaElTope({ diferencia: 1500, porcentaje: 15 }, '10')).toBe(true)
    expect(superaElTope({ diferencia: 1000, porcentaje: 10 }, '10')).toBe(false)
    expect(superaElTope({ diferencia: -3000, porcentaje: -30 }, '10')).toBe(false)
  })

  it('sin tope escrito o sin comparación nunca avisa', () => {
    expect(superaElTope({ diferencia: 9000, porcentaje: 90 }, '')).toBe(false)
    expect(superaElTope(null, '10')).toBe(false)
  })
})
