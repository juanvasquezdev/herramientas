import { hoyISO } from '../../shared/fecha'
import { nuevoId } from '../../shared/id'

/**
 * La forma de una cotización y cómo se crea, se reinicia y se valida.
 * Las cuentas de plata están aparte, en calculo.ts.
 */

export interface Item {
  id: string
  descripcion: string
  // Texto y no número: es lo que la persona escribió en el campo, que puede estar vacío.
  cantidad: string
  precio: string
}

export interface Empresa {
  nombre: string
  contacto: string
  telefono: string
}

export interface Cliente {
  nombre: string
  empresa: string
  email: string
}

export interface Cotizacion {
  empresa: Empresa
  cliente: Cliente
  numero: string
  fecha: string
  validez: string
  items: Item[]
  impuesto: string
  notas: string
}

export const CLAVE_GUARDADO = 'herramientas:cotizador:v1'

export function itemVacio(): Item {
  return { id: nuevoId(), descripcion: '', cantidad: '1', precio: '' }
}

export function cotizacionInicial(hoy: string = hoyISO()): Cotizacion {
  return {
    empresa: { nombre: '', contacto: '', telefono: '' },
    cliente: { nombre: '', empresa: '', email: '' },
    numero: 'COT-0001',
    fecha: hoy,
    validez: '15',
    items: [itemVacio()],
    impuesto: '19',
    notas: 'Precios sujetos a cambio sin previo aviso. Pago: 50 % de anticipo y 50 % contra entrega.',
  }
}

/**
 * Sube en uno el consecutivo y respeta los ceros: COT-0001 -> COT-0002, COT-0999 -> COT-1000.
 * Si el número no termina en dígitos, le agrega "-2".
 */
export function siguienteNumero(numero: string): string {
  const limpio = numero.trim()
  if (limpio === '') return 'COT-0001'

  const partes = /^(.*?)(\d+)$/.exec(limpio)
  if (!partes) return `${limpio}-2`

  const [, prefijo = '', digitos = ''] = partes
  const siguiente = String(Number(digitos) + 1).padStart(digitos.length, '0')
  return `${prefijo}${siguiente}`
}

/**
 * Empieza una cotización nueva a partir de la anterior: se quedan los datos de mi empresa,
 * el impuesto, la validez y las notas (casi nunca cambian), y se limpian el cliente y los ítems.
 */
export function nuevaCotizacion(anterior: Cotizacion, hoy: string = hoyISO()): Cotizacion {
  return {
    ...anterior,
    cliente: { nombre: '', empresa: '', email: '' },
    numero: siguienteNumero(anterior.numero),
    fecha: hoy,
    items: [itemVacio()],
  }
}

function esObjeto(dato: unknown): dato is Record<string, unknown> {
  return typeof dato === 'object' && dato !== null
}

function tieneTextos(dato: unknown, campos: string[]): boolean {
  return esObjeto(dato) && campos.every((campo) => typeof dato[campo] === 'string')
}

/**
 * Revisa que lo leído del navegador tenga la forma de una cotización.
 * Si alguien lo editó a mano o quedó de una versión vieja, se descarta y se arranca limpio.
 */
export function esCotizacion(dato: unknown): dato is Cotizacion {
  if (!esObjeto(dato)) return false
  if (!tieneTextos(dato, ['numero', 'fecha', 'validez', 'impuesto', 'notas'])) return false
  if (!tieneTextos(dato.empresa, ['nombre', 'contacto', 'telefono'])) return false
  if (!tieneTextos(dato.cliente, ['nombre', 'empresa', 'email'])) return false

  const items = dato.items
  return (
    Array.isArray(items) &&
    items.length > 0 &&
    items.every((item) => tieneTextos(item, ['id', 'descripcion', 'cantidad', 'precio']))
  )
}
