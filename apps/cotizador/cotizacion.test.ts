import { describe, expect, it } from 'vitest'
import type { Almacen } from '../../shared/almacen'
import {
  type Cotizacion,
  cotizacionDeArranque,
  cotizacionInicial,
  esCotizacion,
  nuevaCotizacion,
} from './cotizacion'

describe('nuevaCotizacion', () => {
  const anterior: Cotizacion = {
    ...cotizacionInicial('2026-10-01'),
    cliente: { nombre: 'Ana', empresa: 'Panadería Ana', email: 'ana@correo.co' },
    numero: 'COT-0007',
    impuesto: '0',
    items: [{ id: 'a', descripcion: 'Página web', cantidad: '1', precio: '900000' }],
  }

  const nueva = nuevaCotizacion(anterior, '2026-10-07')

  it('conserva las condiciones', () => {
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

  it('rechaza ítems con otra forma (números en vez de texto)', () => {
    const rara = {
      ...cotizacionInicial('2026-10-07'),
      items: [{ id: 'a', desc: 'Servicio', qty: 1, price: 0 }],
    }
    expect(esCotizacion(rara)).toBe(false)
  })

  it('rechaza una lista de ítems vacía', () => {
    expect(esCotizacion({ ...cotizacionInicial('2026-10-07'), items: [] })).toBe(false)
  })
})

describe('cotizacionDeArranque', () => {
  const almacenCon = (datos: Record<string, string>): Almacen => ({
    getItem: (clave) => datos[clave] ?? null,
    setItem: () => {},
  })

  it('conserva la cotización de la versión anterior, sin los datos de la empresa', () => {
    const vieja = {
      ...cotizacionInicial('2026-10-01'),
      empresa: { nombre: 'Taller', contacto: 'hola@taller.co', telefono: '' },
      numero: 'COT-0012',
    }
    const almacen = almacenCon({ 'herramientas:cotizador:v1': JSON.stringify(vieja) })

    const resultado = cotizacionDeArranque(almacen, '2026-10-07')

    expect(resultado.numero).toBe('COT-0012')
    expect(resultado).not.toHaveProperty('empresa')
    expect(esCotizacion(resultado)).toBe(true)
  })

  it('arranca limpia si no había nada o lo que había no sirve', () => {
    expect(cotizacionDeArranque(almacenCon({}), '2026-10-07').numero).toBe('COT-0001')
    expect(
      cotizacionDeArranque(almacenCon({ 'herramientas:cotizador:v1': '{"x":1}' }), '2026-10-07')
        .fecha,
    ).toBe('2026-10-07')
    expect(cotizacionDeArranque(null, '2026-10-07').numero).toBe('COT-0001')
  })
})
