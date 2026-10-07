import { describe, expect, it } from 'vitest'
import type { Medidas } from './angulos'
import {
  cuadroEn,
  resumirTramo,
  segundosReales,
  suavizar,
  tiempoDeContacto,
  tiempoDelCuadro,
} from './tiempos'

describe('cuadroEn y tiempoDelCuadro', () => {
  it('ubica un instante en su cuadro', () => {
    expect(cuadroEn(0, 30)).toBe(0)
    expect(cuadroEn(0.04, 30)).toBe(1)
    expect(cuadroEn(1, 30)).toBe(30)
  })

  it('no se equivoca por el error de coma flotante', () => {
    // 0,1 * 30 = 2,9999999999999996 en JavaScript.
    expect(cuadroEn(0.1, 30)).toBe(3)
  })

  it('ir a un cuadro y preguntar en cuál se está devuelve el mismo', () => {
    for (const fps of [24, 25, 30, 60, 120, 240]) {
      for (const cuadro of [0, 1, 7, 99, 1000]) {
        expect(cuadroEn(tiempoDelCuadro(cuadro, fps), fps)).toBe(cuadro)
      }
    }
  })

  it('nunca da un cuadro negativo', () => {
    expect(cuadroEn(-0.5, 30)).toBe(0)
  })
})

describe('segundosReales', () => {
  it('en un video normal son cuadros entre cuadros por segundo', () => {
    expect(segundosReales(15, 30, 1)).toBe(0.5)
  })

  it('en cámara lenta el mismo tramo de video es menos tiempo real', () => {
    // 40 cuadros de un video de 30 fps grabado a 240 (8 veces más lento) = 40/240 s
    expect(segundosReales(40, 30, 8)).toBeCloseTo(0.1667, 4)
  })
})

describe('tiempoDeContacto', () => {
  it('cuenta los cuadros entre las dos marcas', () => {
    expect(tiempoDeContacto(100, 105, 30, 1)).toEqual({ segundos: 0.167, margen: 0.033 })
  })

  it('con más cuadros por segundo el margen de error baja', () => {
    expect(tiempoDeContacto(100, 140, 30, 8)).toEqual({ segundos: 0.167, margen: 0.004 })
  })

  it('devuelve null si las marcas están al revés o en el mismo cuadro', () => {
    expect(tiempoDeContacto(105, 100, 30, 1)).toBeNull()
    expect(tiempoDeContacto(100, 100, 30, 1)).toBeNull()
  })

  it('devuelve null con datos imposibles', () => {
    expect(tiempoDeContacto(100, 105, 0, 1)).toBeNull()
    expect(tiempoDeContacto(100, 105, 30, 0)).toBeNull()
  })
})

describe('resumirTramo', () => {
  const con = (rodillaApoyo: number): Medidas => ({
    rodillaApoyo,
    caderaApoyo: 170,
    tobilloApoyo: 100,
    rodillaLibre: 90,
    tronco: 10,
    confiable: true,
  })
  const muestras = [168, 152, 141, 149, 172].map((rodilla, i) => ({
    tiempo: i * 0.04,
    medidas: con(rodilla),
  }))

  it('encuentra el momento de máxima flexión de la rodilla', () => {
    expect(resumirTramo(muestras)?.flexionMaxima).toEqual({ angulo: 141, tiempo: 0.08 })
  })

  it('mide cuánto se dobló y cuánto se extendió', () => {
    const resumen = resumirTramo(muestras)
    expect(resumen?.amortiguacion).toBe(27)
    expect(resumen?.extension).toBe(31)
  })

  it('devuelve null con menos de dos muestras', () => {
    expect(resumirTramo([])).toBeNull()
    expect(resumirTramo(muestras.slice(0, 1))).toBeNull()
  })
})

describe('suavizar', () => {
  it('deja igual una serie corta', () => {
    expect(suavizar([168, 152, 141, 149, 172])).toEqual([168, 152, 141, 149, 172])
  })

  it('en una serie larga promedia cada valor con sus vecinos y respeta los extremos', () => {
    const serie = [170, 170, 170, 176, 170, 170, 170, 170, 170]
    const suave = suavizar(serie)
    expect(suave[0]).toBe(170)
    expect(suave.at(-1)).toBe(170)
    // El salto aislado de 6° queda repartido en 2° sobre tres cuadros.
    expect(suave.slice(2, 5)).toEqual([172, 172, 172])
  })

  it('no modifica la serie original', () => {
    const serie = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    suavizar(serie)
    expect(serie).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })
})
