import { type Almacen, leer } from '../../shared/almacen'
import { siguienteNumero } from '../../shared/consecutivo'
import { hoyISO } from '../../shared/fecha'
import { nuevoId } from '../../shared/id'
import { esListaDe, esObjeto, tieneTextos } from '../../shared/validar'

/**
 * La forma de una cotización y cómo se crea, se reinicia y se valida.
 * Las cuentas de plata están aparte, en calculo.ts.
 *
 * Los datos de "tu empresa" no van aquí: viven en shared/perfil.ts porque también los
 * usa la propuesta.
 */

export interface Item {
  id: string
  descripcion: string
  // Texto y no número: es lo que la persona escribió en el campo, que puede estar vacío.
  cantidad: string
  precio: string
}

export interface Cliente {
  nombre: string
  empresa: string
  email: string
}

export interface Cotizacion {
  cliente: Cliente
  numero: string
  fecha: string
  validez: string
  items: Item[]
  impuesto: string
  notas: string
}

// v2: los datos de la empresa salieron de la cotización y pasaron al perfil compartido.
export const CLAVE_GUARDADO = 'herramientas:cotizador:v2'
const CLAVE_V1 = 'herramientas:cotizador:v1'

export function itemVacio(): Item {
  return { id: nuevoId(), descripcion: '', cantidad: '1', precio: '' }
}

export function cotizacionInicial(hoy: string = hoyISO()): Cotizacion {
  return {
    cliente: { nombre: '', empresa: '', email: '' },
    numero: 'COT-0001',
    fecha: hoy,
    validez: '15',
    items: [itemVacio()],
    impuesto: '19',
    notas:
      'Precios sujetos a cambio sin previo aviso. Pago: 50 % de anticipo y 50 % contra entrega.',
  }
}

/**
 * Empieza una cotización nueva a partir de la anterior: se quedan el impuesto, la validez
 * y las notas (casi nunca cambian), y se limpian el cliente y los ítems.
 */
export function nuevaCotizacion(anterior: Cotizacion, hoy: string = hoyISO()): Cotizacion {
  return {
    ...anterior,
    cliente: { nombre: '', empresa: '', email: '' },
    numero: siguienteNumero(anterior.numero, 'COT-0001'),
    fecha: hoy,
    items: [itemVacio()],
  }
}

/**
 * Revisa que lo leído del navegador tenga la forma de una cotización.
 * Si alguien lo editó a mano o quedó de una versión vieja, se descarta y se arranca limpio.
 */
export function esCotizacion(dato: unknown): dato is Cotizacion {
  if (!esObjeto(dato)) return false
  if (!tieneTextos(dato, ['numero', 'fecha', 'validez', 'impuesto', 'notas'])) return false
  if (!tieneTextos(dato.cliente, ['nombre', 'empresa', 'email'])) return false

  return esListaDe(
    dato.items,
    (item) => tieneTextos(item, ['id', 'descripcion', 'cantidad', 'precio']),
    1,
  )
}

/**
 * La cotización con la que arranca quien todavía no tiene nada en la versión nueva: si
 * dejó una a medias en la versión anterior se conserva, sin los datos de la empresa.
 */
export function cotizacionDeArranque(almacen: Almacen | null, hoy: string = hoyISO()): Cotizacion {
  const vieja = leer<unknown>(almacen, CLAVE_V1, null)
  if (!esCotizacion(vieja)) return cotizacionInicial(hoy)

  const { cliente, numero, fecha, validez, items, impuesto, notas } = vieja
  return { cliente, numero, fecha, validez, items, impuesto, notas }
}
