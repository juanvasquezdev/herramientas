import { describe, expect, it } from 'vitest'
import { avanzar, ESTADO_INICIAL, type Estado, type Gesto, type Regla, TIEMPOS } from './regla'

type Accion = 'siguiente' | 'subir' | 'borrar'
const reglas: Regla<Accion>[] = [
  { gesto: 'Pointing_Up', accion: 'siguiente', descripcion: 'Siguiente' },
  { gesto: 'Thumb_Up', accion: 'subir', descripcion: 'Subir volumen', repetir: true },
  { gesto: 'Closed_Fist', accion: 'borrar', descripcion: 'Borrar', sostener: 1000 },
]

/** Pasa una serie de lecturas [milisegundo, gesto] y devuelve las acciones que salieron. */
function reproducir(lecturas: Array<[number, Gesto]>): Array<[number, Accion]> {
  let estado: Estado = ESTADO_INICIAL
  const acciones: Array<[number, Accion]> = []
  for (const [ahora, gesto] of lecturas) {
    const paso = avanzar(estado, gesto, ahora, reglas)
    estado = paso.estado
    if (paso.accion) acciones.push([ahora, paso.accion])
  }
  return acciones
}

/** Lecturas cada 66 ms (unas 15 por segundo) del mismo gesto entre dos instantes. */
function sostenido(gesto: Gesto, desde: number, hasta: number): Array<[number, Gesto]> {
  const lecturas: Array<[number, Gesto]> = []
  for (let t = desde; t <= hasta; t += 66) lecturas.push([t, gesto])
  return lecturas
}

describe('avanzar', () => {
  it('un gesto que apenas pasa por la cámara no hace nada', () => {
    expect(reproducir(sostenido('Pointing_Up', 0, 300))).toEqual([])
  })

  it('un gesto sostenido hace su acción una sola vez, por más que se mantenga', () => {
    const acciones = reproducir(sostenido('Pointing_Up', 0, 3000))
    expect(acciones).toHaveLength(1)
    expect(acciones[0]?.[1]).toBe('siguiente')
    expect(acciones[0]?.[0]).toBeGreaterThanOrEqual(TIEMPOS.sostener)
  })

  it('para repetir la acción hay que soltar el gesto y volver a hacerlo', () => {
    const acciones = reproducir([
      ...sostenido('Pointing_Up', 0, 800),
      ...sostenido('None', 866, 1400),
      ...sostenido('Pointing_Up', 1466, 2300),
    ])
    expect(acciones.map(([, accion]) => accion)).toEqual(['siguiente', 'siguiente'])
  })

  it('las acciones con repetir se repiten mientras se sostiene el gesto', () => {
    const acciones = reproducir(sostenido('Thumb_Up', 0, 2000))
    // Primera a los ~450 ms y después cada ~500 ms: 462, 990, 1518.
    expect(acciones.map(([, accion]) => accion)).toEqual(['subir', 'subir', 'subir'])
  })

  it('respeta el tiempo propio de una regla', () => {
    expect(reproducir(sostenido('Closed_Fist', 0, 900))).toEqual([])
    expect(reproducir(sostenido('Closed_Fist', 0, 1200))).toHaveLength(1)
  })

  it('un parpadeo del detector no reinicia la cuenta', () => {
    const acciones = reproducir([
      ...sostenido('Pointing_Up', 0, 264),
      [330, 'None'], // la mano se "pierde" una lectura
      ...sostenido('Pointing_Up', 396, 600),
    ])
    expect(acciones.map(([, accion]) => accion)).toEqual(['siguiente'])
  })

  it('si la mano se va de verdad, la cuenta sí se reinicia', () => {
    const acciones = reproducir([
      ...sostenido('Pointing_Up', 0, 264),
      ...sostenido('None', 330, 800),
      ...sostenido('Pointing_Up', 866, 1100),
    ])
    expect(acciones).toEqual([])
  })

  it('cambiar de un gesto a otro empieza la cuenta de nuevo', () => {
    const acciones = reproducir([
      ...sostenido('Pointing_Up', 0, 330),
      ...sostenido('Thumb_Up', 396, 700),
    ])
    expect(acciones).toEqual([])
  })

  it('un gesto sin regla no hace nada', () => {
    expect(reproducir(sostenido('Victory', 0, 3000))).toEqual([])
  })

  it('informa el avance de la sostenida entre 0 y 1', () => {
    const inicio = avanzar(ESTADO_INICIAL, 'Pointing_Up', 1000, reglas)
    expect(inicio.avance).toBe(0)
    const mitad = avanzar(inicio.estado, 'Pointing_Up', 1225, reglas)
    expect(mitad.avance).toBeCloseTo(0.5, 2)
    const fin = avanzar(mitad.estado, 'Pointing_Up', 1500, reglas)
    expect(fin.avance).toBe(1)
    expect(fin.accion).toBe('siguiente')
  })
})
