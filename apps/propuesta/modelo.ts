import { siguienteNumero } from '../../shared/consecutivo'
import { hoyISO } from '../../shared/fecha'
import { nuevoId } from '../../shared/id'
import { esListaDe, esObjeto, tieneTextos } from '../../shared/validar'

/**
 * La forma de una propuesta de servicios. Los datos de quien la envía no van aquí:
 * salen del perfil compartido (shared/perfil.ts), el mismo que usa el cotizador.
 */

export interface Entregable {
  id: string
  descripcion: string
  plazo: string
}

export interface Pago {
  id: string
  concepto: string
  porcentaje: string
}

export interface Propuesta {
  cliente: { nombre: string; empresa: string }
  numero: string
  fecha: string
  validez: string
  proyecto: string
  alcance: string
  entregables: Entregable[]
  presupuesto: string
  pagos: Pago[]
  condiciones: string
}

export const CLAVE_GUARDADO = 'herramientas:propuesta:v1'
const NUMERO_INICIAL = 'PRO-0001'

export function entregableVacio(): Entregable {
  return { id: nuevoId(), descripcion: '', plazo: '' }
}

export function pagoVacio(): Pago {
  return { id: nuevoId(), concepto: '', porcentaje: '' }
}

export function propuestaInicial(hoy: string = hoyISO()): Propuesta {
  return {
    cliente: { nombre: '', empresa: '' },
    numero: NUMERO_INICIAL,
    fecha: hoy,
    validez: '15',
    proyecto: '',
    alcance: '',
    entregables: [entregableVacio()],
    presupuesto: '',
    pagos: [
      { id: nuevoId(), concepto: 'Anticipo para iniciar', porcentaje: '50' },
      { id: nuevoId(), concepto: 'Contra entrega', porcentaje: '50' },
    ],
    condiciones: [
      'El trabajo que no esté en el alcance se cotiza por separado.',
      'Cada entregable incluye hasta dos rondas de ajustes.',
      'Los plazos corren desde que se recibe el anticipo y el material necesario.',
      'Los archivos finales se entregan cuando el pago esté completo.',
    ].join('\n'),
  }
}

/**
 * Empieza una propuesta nueva: se quedan la forma de pago, las condiciones y la validez
 * (casi siempre son las mismas) y se limpia lo que es de cada cliente.
 */
export function nuevaPropuesta(anterior: Propuesta, hoy: string = hoyISO()): Propuesta {
  return {
    ...anterior,
    cliente: { nombre: '', empresa: '' },
    numero: siguienteNumero(anterior.numero, NUMERO_INICIAL),
    fecha: hoy,
    proyecto: '',
    alcance: '',
    entregables: [entregableVacio()],
    presupuesto: '',
  }
}

export function esPropuesta(dato: unknown): dato is Propuesta {
  if (!esObjeto(dato)) return false
  if (
    !tieneTextos(dato, [
      'numero',
      'fecha',
      'validez',
      'proyecto',
      'alcance',
      'presupuesto',
      'condiciones',
    ])
  ) {
    return false
  }
  return (
    tieneTextos(dato.cliente, ['nombre', 'empresa']) &&
    esListaDe(dato.entregables, (e) => tieneTextos(e, ['id', 'descripcion', 'plazo']), 1) &&
    esListaDe(dato.pagos, (p) => tieneTextos(p, ['id', 'concepto', 'porcentaje']), 1)
  )
}
