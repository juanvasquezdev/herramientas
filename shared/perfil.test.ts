import { describe, expect, it } from 'vitest'
import type { Almacen } from './almacen'
import { esPerfil, perfilDeArranque, perfilDelCotizadorViejo, perfilVacio } from './perfil'

function almacenCon(datos: Record<string, string>): Almacen {
  return { getItem: (clave) => datos[clave] ?? null, setItem: () => {} }
}

describe('esPerfil', () => {
  it('acepta un perfil vacío y uno lleno', () => {
    expect(esPerfil(perfilVacio())).toBe(true)
    expect(esPerfil({ nombre: 'Taller', correo: 'hola@taller.co', telefono: '300' })).toBe(true)
  })

  it('rechaza lo que no tiene los tres textos', () => {
    expect(esPerfil(null)).toBe(false)
    expect(esPerfil({ nombre: 'Taller' })).toBe(false)
    expect(esPerfil({ nombre: 'Taller', correo: 1, telefono: '' })).toBe(false)
  })
})

describe('perfilDelCotizadorViejo', () => {
  it('saca el perfil de una cotización de la primera versión', () => {
    const vieja = {
      empresa: { nombre: 'Taller', contacto: 'hola@taller.co', telefono: '300' },
      numero: 'COT-0003',
    }
    expect(perfilDelCotizadorViejo(vieja)).toEqual({
      nombre: 'Taller',
      correo: 'hola@taller.co',
      telefono: '300',
    })
  })

  it('devuelve null si no hay nada que rescatar', () => {
    expect(perfilDelCotizadorViejo(null)).toBeNull()
    expect(perfilDelCotizadorViejo({ numero: 'COT-0001' })).toBeNull()
    expect(perfilDelCotizadorViejo({ empresa: { nombre: 'Taller' } })).toBeNull()
  })
})

describe('perfilDeArranque', () => {
  it('rescata los datos del cotizador viejo si existen', () => {
    const almacen = almacenCon({
      'herramientas:cotizador:v1': JSON.stringify({
        empresa: { nombre: 'Taller', contacto: 'hola@taller.co', telefono: '' },
      }),
    })
    expect(perfilDeArranque(almacen).nombre).toBe('Taller')
  })

  it('arranca vacío si no hay nada guardado o no hay almacén', () => {
    expect(perfilDeArranque(almacenCon({}))).toEqual(perfilVacio())
    expect(perfilDeArranque(null)).toEqual(perfilVacio())
  })
})
