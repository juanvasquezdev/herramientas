import { describe, expect, it } from 'vitest'
import { anguloEn, inclinacion, medir, type PuntoPose } from './angulos'

describe('anguloEn', () => {
  it('mide un ángulo recto', () => {
    expect(anguloEn({ x: 0, y: 10 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBeCloseTo(90, 5)
  })

  it('mide 180° cuando los tres puntos están en línea', () => {
    expect(anguloEn({ x: 0, y: 0 }, { x: 0, y: 5 }, { x: 0, y: 10 })).toBeCloseTo(180, 5)
  })

  it('mide 0° cuando los dos segmentos van hacia el mismo lado', () => {
    expect(anguloEn({ x: 5, y: 0 }, { x: 0, y: 0 }, { x: 9, y: 0 })).toBeCloseTo(0, 5)
  })

  it('da lo mismo sin importar el orden de los extremos', () => {
    const a = { x: 3, y: 7 }
    const b = { x: 1, y: 1 }
    const c = { x: 8, y: 2 }
    expect(anguloEn(a, b, c)).toBeCloseTo(anguloEn(c, b, a), 10)
  })

  it('devuelve NaN si un extremo coincide con el vértice', () => {
    expect(Number.isNaN(anguloEn({ x: 1, y: 1 }, { x: 1, y: 1 }, { x: 5, y: 5 }))).toBe(true)
  })
})

describe('inclinacion', () => {
  it('da 0° para un segmento vertical', () => {
    expect(inclinacion({ x: 5, y: 10 }, { x: 5, y: 0 })).toBeCloseTo(0, 5)
  })

  it('da 45° sin importar hacia qué lado', () => {
    expect(inclinacion({ x: 0, y: 10 }, { x: 10, y: 0 })).toBeCloseTo(45, 5)
    expect(inclinacion({ x: 10, y: 10 }, { x: 0, y: 0 })).toBeCloseTo(45, 5)
  })

  it('da 90° para un segmento horizontal', () => {
    expect(inclinacion({ x: 0, y: 5 }, { x: 10, y: 5 })).toBeCloseTo(90, 5)
  })
})

/** Una pose de 33 puntos con todos en el centro, y encima los que se indiquen. */
function pose(puntos: Record<number, [x: number, y: number, visibilidad?: number]>): PuntoPose[] {
  const base: PuntoPose[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 0.9 }))
  for (const [indice, [x, y, visibility = 0.9]] of Object.entries(puntos)) {
    base[Number(indice)] = { x, y, visibility }
  }
  return base
}

/** Atleta de pie, derecho, de perfil: todo alineado en vertical. */
const dePie = pose({
  11: [0.5, 0.2], // hombro izquierdo
  12: [0.5, 0.2], // hombro derecho
  23: [0.5, 0.5], // cadera izquierda
  24: [0.5, 0.5], // cadera derecha
  25: [0.5, 0.7], // rodilla izquierda
  26: [0.5, 0.7], // rodilla derecha
  27: [0.5, 0.9], // tobillo izquierdo
  28: [0.5, 0.9], // tobillo derecho
  31: [0.56, 0.9], // punta izquierda
  32: [0.56, 0.9], // punta derecha
})

describe('medir', () => {
  it('de pie y derecho: rodilla y cadera en 180°, tronco en 0°, tobillo en 90°', () => {
    const medidas = medir(dePie, 'izquierda', 1000, 1000)
    expect(medidas?.rodillaApoyo).toBeCloseTo(180, 3)
    expect(medidas?.caderaApoyo).toBeCloseTo(180, 3)
    expect(medidas?.tronco).toBeCloseTo(0, 3)
    expect(medidas?.tobilloApoyo).toBeCloseTo(90, 3)
    expect(medidas?.confiable).toBe(true)
  })

  it('usa la pierna que se le pide como pierna de despegue', () => {
    // Solo la rodilla derecha está doblada en ángulo recto.
    const conRodillaDoblada = pose({
      ...Object.fromEntries(dePie.map((p, i) => [i, [p.x, p.y]])),
      28: [0.7, 0.7],
    })

    expect(medir(conRodillaDoblada, 'derecha', 1000, 1000)?.rodillaApoyo).toBeCloseTo(90, 3)
    expect(medir(conRodillaDoblada, 'izquierda', 1000, 1000)?.rodillaApoyo).toBeCloseTo(180, 3)
    expect(medir(conRodillaDoblada, 'izquierda', 1000, 1000)?.rodillaLibre).toBeCloseTo(90, 3)
  })

  it('tiene en cuenta que el video no es cuadrado', () => {
    // Misma pose en fracciones; en un video apaisado la rodilla doblada ya no mide 90°.
    const doblada = pose({
      ...Object.fromEntries(dePie.map((p, i) => [i, [p.x, p.y]])),
      28: [0.7, 0.7],
    })
    const cuadrado = medir(doblada, 'derecha', 1000, 1000)?.rodillaApoyo
    const apaisado = medir(doblada, 'derecha', 1920, 1080)?.rodillaApoyo

    expect(cuadrado).toBeCloseTo(90, 3)
    expect(apaisado).toBeCloseTo(90, 3) // sigue siendo recto: un segmento es vertical y el otro horizontal
    // Con el tronco inclinado sí cambia: 0,1 de ancho y 0,3 de alto no son lo mismo en píxeles.
    const inclinado = pose({
      ...Object.fromEntries(dePie.map((p, i) => [i, [p.x, p.y]])),
      11: [0.6, 0.2],
      12: [0.6, 0.2],
    })
    expect(medir(inclinado, 'derecha', 1000, 1000)?.tronco).toBeCloseTo(18.43, 1)
    expect(medir(inclinado, 'derecha', 1920, 1080)?.tronco).toBeCloseTo(30.65, 1)
  })

  it('avisa cuando un punto usado casi no se ve', () => {
    const tobilloTapado = pose({
      ...Object.fromEntries(dePie.map((p, i) => [i, [p.x, p.y]])),
      27: [0.5, 0.9, 0.2],
    })
    expect(medir(tobilloTapado, 'izquierda', 1000, 1000)?.confiable).toBe(false)
  })

  it('devuelve null si la pose viene incompleta', () => {
    expect(medir([], 'izquierda', 1000, 1000)).toBeNull()
    expect(medir(dePie.slice(0, 20), 'izquierda', 1000, 1000)).toBeNull()
  })
})
