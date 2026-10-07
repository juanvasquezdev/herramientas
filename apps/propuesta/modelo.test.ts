import { describe, expect, it } from 'vitest'
import { esPropuesta, nuevaPropuesta, type Propuesta, propuestaInicial } from './modelo'

describe('nuevaPropuesta', () => {
  const anterior: Propuesta = {
    ...propuestaInicial('2026-10-01'),
    cliente: { nombre: 'Marta', empresa: 'Panadería La Espiga' },
    numero: 'PRO-0004',
    proyecto: 'Página web',
    alcance: 'Una página de una sola sección.',
    presupuesto: '1200000',
    condiciones: 'Mis condiciones de siempre.',
  }
  const nueva = nuevaPropuesta(anterior, '2026-10-07')

  it('limpia lo que es de cada cliente', () => {
    expect(nueva.cliente).toEqual({ nombre: '', empresa: '' })
    expect(nueva.proyecto).toBe('')
    expect(nueva.alcance).toBe('')
    expect(nueva.presupuesto).toBe('')
    expect(nueva.entregables).toHaveLength(1)
  })

  it('conserva la forma de pago y las condiciones', () => {
    expect(nueva.pagos).toEqual(anterior.pagos)
    expect(nueva.condiciones).toBe('Mis condiciones de siempre.')
  })

  it('sube el número y pone la fecha de hoy', () => {
    expect(nueva.numero).toBe('PRO-0005')
    expect(nueva.fecha).toBe('2026-10-07')
  })
})

describe('esPropuesta', () => {
  it('acepta una propuesta recién creada, también después de pasar por JSON', () => {
    expect(esPropuesta(propuestaInicial('2026-10-07'))).toBe(true)
    expect(esPropuesta(JSON.parse(JSON.stringify(propuestaInicial('2026-10-07'))))).toBe(true)
  })

  it('rechaza una propuesta sin cliente o sin pagos', () => {
    const { cliente: _cliente, ...sinCliente } = propuestaInicial('2026-10-07')
    expect(esPropuesta(sinCliente)).toBe(false)
    expect(esPropuesta({ ...propuestaInicial('2026-10-07'), pagos: [] })).toBe(false)
  })

  it('rechaza pagos con el porcentaje como número', () => {
    const rara = {
      ...propuestaInicial('2026-10-07'),
      pagos: [{ id: 'a', concepto: 'Anticipo', porcentaje: 50 }],
    }
    expect(esPropuesta(rara)).toBe(false)
  })

  it('rechaza lo que no es un objeto', () => {
    expect(esPropuesta(null)).toBe(false)
    expect(esPropuesta([])).toBe(false)
  })
})
