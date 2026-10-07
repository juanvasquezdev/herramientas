import { describe, expect, it } from 'vitest'
import { esMejor, formatearMarca, leerMarca } from './marca'

describe('leerMarca: distancias, pesos y puntos', () => {
  it('acepta coma o punto decimal', () => {
    expect(leerMarca('2,06', 'm')).toBe(2.06)
    expect(leerMarca('2.06', 'm')).toBe(2.06)
    expect(leerMarca(' 120 ', 'kg')).toBe(120)
  })

  it('rechaza vacío, texto, negativos y cero', () => {
    expect(leerMarca('', 'm')).toBeNull()
    expect(leerMarca('dos metros', 'm')).toBeNull()
    expect(leerMarca('-2', 'm')).toBeNull()
    expect(leerMarca('0', 'm')).toBeNull()
  })

  it('no acepta dos puntos donde no hay tiempo', () => {
    expect(leerMarca('1:52', 'm')).toBeNull()
  })
})

describe('leerMarca: tiempos', () => {
  it('lee segundos sueltos', () => {
    expect(leerMarca('10,52', 's')).toBe(10.52)
  })

  it('lee minutos y segundos', () => {
    expect(leerMarca('1:52,45', 's')).toBeCloseTo(112.45, 5)
    expect(leerMarca('14:05.3', 's')).toBeCloseTo(845.3, 5)
  })

  it('lee horas, minutos y segundos', () => {
    expect(leerMarca('2:05:30', 's')).toBe(7530)
  })

  it('rechaza segundos o minutos de 60 o más cuando hay una unidad mayor delante', () => {
    expect(leerMarca('1:75', 's')).toBeNull()
    expect(leerMarca('1:60:00', 's')).toBeNull()
  })

  it('acepta más de 60 segundos si no hay minutos delante', () => {
    expect(leerMarca('75,2', 's')).toBe(75.2)
  })

  it('rechaza formatos raros', () => {
    expect(leerMarca('1:2:3:4', 's')).toBeNull()
    expect(leerMarca('1:', 's')).toBeNull()
    expect(leerMarca(':30', 's')).toBeNull()
    expect(leerMarca('1.5:30', 's')).toBeNull()
  })
})

describe('formatearMarca', () => {
  it('escribe metros con dos decimales', () => {
    expect(formatearMarca(2.06, 'm')).toBe('2,06 m')
    expect(formatearMarca(7, 'm')).toBe('7,00 m')
  })

  it('escribe kilos, centímetros y puntos sin decimales de relleno', () => {
    expect(formatearMarca(120, 'kg')).toBe('120 kg')
    expect(formatearMarca(122.5, 'kg')).toBe('122,5 kg')
    expect(formatearMarca(65, 'cm')).toBe('65 cm')
    expect(formatearMarca(7250, 'pts')).toBe('7.250 pts')
  })

  it('escribe los tiempos cortos en segundos', () => {
    expect(formatearMarca(10.52, 's')).toBe('10,52 s')
  })

  it('pasa a minutos desde 60 segundos', () => {
    expect(formatearMarca(112.45, 's')).toBe('1:52,45')
    expect(formatearMarca(60, 's')).toBe('1:00,00')
  })

  it('pasa a horas desde 3.600 segundos', () => {
    expect(formatearMarca(7530, 's')).toBe('2:05:30')
  })

  it('no muestra 60 segundos por culpa del redondeo', () => {
    expect(formatearMarca(119.999, 's')).toBe('2:00,00')
  })

  it('lo que se escribe se puede volver a leer', () => {
    expect(leerMarca(formatearMarca(112.45, 's'), 's')).toBeCloseTo(112.45, 5)
    expect(leerMarca('2,06', 'm')).toBe(2.06)
  })
})

describe('esMejor', () => {
  it('en saltos gana la más alta y en carreras la más baja', () => {
    expect(esMejor(2.06, 2.04, 'mayor')).toBe(true)
    expect(esMejor(10.4, 10.52, 'menor')).toBe(true)
    expect(esMejor(10.6, 10.52, 'menor')).toBe(false)
  })
})
