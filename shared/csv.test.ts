import { describe, expect, it } from 'vitest'
import { aCsv } from './csv'

const sinMarca = (csv: string) => csv.replace('﻿', '')

describe('aCsv', () => {
  it('separa columnas con punto y coma y filas con salto de línea', () => {
    expect(
      sinMarca(
        aCsv([
          ['Fecha', 'Marca'],
          ['2026-10-07', 'PR'],
        ]),
      ),
    ).toBe('Fecha;Marca\r\n2026-10-07;PR')
  })

  it('empieza con la marca de UTF-8 para que Excel muestre las tildes', () => {
    expect(aCsv([['Título']]).startsWith('﻿')).toBe(true)
  })

  it('escribe los números con coma decimal', () => {
    expect(sinMarca(aCsv([[2.06, 1500]]))).toBe('2,06;1500')
  })

  it('encierra entre comillas las celdas con separador, comillas o saltos de línea', () => {
    expect(sinMarca(aCsv([['uno; dos', 'dijo "hola"', 'línea 1\nlínea 2']]))).toBe(
      '"uno; dos";"dijo ""hola""";"línea 1\nlínea 2"',
    )
  })
})
