import { describe, expect, it } from 'vitest'
import {
  cotizacionInicial,
  esCotizacion,
  nuevaCotizacion,
  siguienteNumero,
  type Cotizacion,
} from './cotizacion'

describe('siguienteNumero', () => {
  it('sube el consecutivo y respeta los ceros', () => {
    expect(siguienteNumero('COT-0001')).toBe('COT-0002')
    expect(siguienteNumero('COT-0099')).toBe('COT-0100')
  })

  it('crece cuando se acaban los dígitos', () => {
    expect(siguienteNumero('COT-9999')).toBe('COT-10000')
  })

  it('funciona con otros formatos que terminan en número', () => {
    expect(siguienteNumero('2026-15')).toBe('2026-16')
    expect(siguienteNumero('7')).toBe('8')
  })

  it('agrega -2 cuando no termina en número', () => {
    expect(siguienteNumero('Propuesta')).toBe('Propuesta-2')
  })

  it('arranca en COT-0001 si está vacío', () => {
    expect(siguienteNumero('   ')).toBe('COT-0001')
  })
})

describe('nuevaCotizacion', () => {
  const anterior: Cotizacion = {
    ...cotizacionInicial('2026-10-01'),
    empresa: { nombre: 'Mi Taller', contacto: 'hola@mitaller.co', telefono: '300 000 0000' },
    cliente: { nombre: 'Ana', empresa: 'Panadería Ana', email: 'ana@correo.co' },
    numero: 'COT-0007',
    impuesto: '0',
    items: [{ id: 'a', descripcion: 'Página web', cantidad: '1', precio: '900000' }],
  }

  const nueva = nuevaCotizacion(anterior, '2026-10-07')

  it('conserva los datos de la empresa y las condiciones', () => {
    expect(nueva.empresa).toEqual(anterior.empresa)
    expect(nueva.impuesto).toBe('0')
    expect(nueva.validez).toBe(anterior.validez)
    expect(nueva.notas).toBe(anterior.notas)
  })

  it('limpia el cliente y deja un solo ítem vacío', () => {
    expect(nueva.cliente).toEqual({ nombre: '', empresa: '', email: '' })
    expect(nueva.items).toHaveLength(1)
    expect(nueva.items[0]).toMatchObject({ descripcion: '', cantidad: '1', precio: '' })
  })

  it('pone el número siguiente y la fecha de hoy', () => {
    expect(nueva.numero).toBe('COT-0008')
    expect(nueva.fecha).toBe('2026-10-07')
  })

  it('no modifica la cotización anterior', () => {
    expect(anterior.numero).toBe('COT-0007')
    expect(anterior.items).toHaveLength(1)
    expect(anterior.cliente.nombre).toBe('Ana')
  })
})

describe('esCotizacion', () => {
  it('acepta una cotización recién creada', () => {
    expect(esCotizacion(cotizacionInicial('2026-10-07'))).toBe(true)
  })

  it('acepta lo que vuelve de pasar por JSON', () => {
    const ida = JSON.stringify(cotizacionInicial('2026-10-07'))
    expect(esCotizacion(JSON.parse(ida))).toBe(true)
  })

  it('rechaza datos que no son un objeto', () => {
    expect(esCotizacion(null)).toBe(false)
    expect(esCotizacion('COT-0001')).toBe(false)
    expect(esCotizacion([])).toBe(false)
  })

  it('rechaza una cotización a la que le falta una parte', () => {
    const { cliente: _cliente, ...sinCliente } = cotizacionInicial('2026-10-07')
    expect(esCotizacion(sinCliente)).toBe(false)
  })

  it('rechaza ítems con la forma vieja (números en vez de texto)', () => {
    const vieja = {
      ...cotizacionInicial('2026-10-07'),
      items: [{ id: 'a', desc: 'Servicio', qty: 1, price: 0 }],
    }
    expect(esCotizacion(vieja)).toBe(false)
  })

  it('rechaza una lista de ítems vacía', () => {
    expect(esCotizacion({ ...cotizacionInicial('2026-10-07'), items: [] })).toBe(false)
  })
})
