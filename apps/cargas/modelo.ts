import { nuevoId } from '../../shared/id'
import { esListaDe, esObjeto, esUnoDe, tieneTextos } from '../../shared/validar'

/** El plan de fuerza de un atleta: varias semanas, cada una con sus ejercicios. */

export const DIAS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const
export type Dia = (typeof DIAS)[number]

export interface Ejercicio {
  id: string
  dia: Dia
  nombre: string
  // Texto y no número: es lo que hay escrito en el campo, que puede estar vacío.
  series: string
  reps: string
  /** Peso por repetición. Vacío en ejercicios sin carga (saltos, autocargas). */
  kg: string
}

export interface Semana {
  id: string
  nombre: string
  ejercicios: Ejercicio[]
}

/** tonelaje: kilos movidos (series × reps × kg). repeticiones: series × reps, sirve también sin peso. */
export type Medida = 'tonelaje' | 'repeticiones'
const MEDIDAS: readonly Medida[] = ['tonelaje', 'repeticiones']

export interface Plan {
  atleta: string
  semanas: Semana[]
  /** El id de la semana que se está viendo. */
  activa: string
  medida: Medida
  /** Subida máxima frente a la semana anterior, en %, antes de avisar. Vacío = sin aviso. */
  tope: string
}

export const CLAVE_GUARDADO = 'herramientas:cargas:v1'

export function ejercicioVacio(dia: Dia = 'Lunes'): Ejercicio {
  return { id: nuevoId(), dia, nombre: '', series: '', reps: '', kg: '' }
}

export function semanaVacia(nombre: string): Semana {
  return { id: nuevoId(), nombre, ejercicios: [ejercicioVacio()] }
}

export function planInicial(): Plan {
  const semana = semanaVacia('Semana 1')
  return { atleta: '', semanas: [semana], activa: semana.id, medida: 'tonelaje', tope: '' }
}

/**
 * La semana siguiente arranca como copia de la activa: casi nunca se planea de cero, se
 * ajusta lo de la semana pasada. Los ids son nuevos para que editar una no toque la otra.
 */
export function agregarSemana(plan: Plan): Plan {
  const base = plan.semanas.find((semana) => semana.id === plan.activa) ?? plan.semanas.at(-1)
  const nueva: Semana = {
    id: nuevoId(),
    nombre: `Semana ${plan.semanas.length + 1}`,
    ejercicios: (base?.ejercicios ?? [ejercicioVacio()]).map((ejercicio) => ({
      ...ejercicio,
      id: nuevoId(),
    })),
  }
  return { ...plan, semanas: [...plan.semanas, nueva], activa: nueva.id }
}

/** Quita una semana (nunca la última que queda) y deja activa la vecina. */
export function quitarSemana(plan: Plan, id: string): Plan {
  if (plan.semanas.length <= 1) return plan
  const indice = plan.semanas.findIndex((semana) => semana.id === id)
  if (indice === -1) return plan

  const semanas = plan.semanas.filter((semana) => semana.id !== id)
  const vecina = semanas[Math.max(0, indice - 1)]
  return { ...plan, semanas, activa: plan.activa === id && vecina ? vecina.id : plan.activa }
}

const esEjercicio = (dato: unknown) =>
  tieneTextos(dato, ['id', 'nombre', 'series', 'reps', 'kg']) &&
  esObjeto(dato) &&
  esUnoDe(dato.dia, DIAS)

const esSemana = (dato: unknown) =>
  tieneTextos(dato, ['id', 'nombre']) && esObjeto(dato) && esListaDe(dato.ejercicios, esEjercicio)

export function esPlan(dato: unknown): dato is Plan {
  if (!esObjeto(dato) || !tieneTextos(dato, ['atleta', 'activa', 'tope'])) return false
  if (!esUnoDe(dato.medida, MEDIDAS) || !esListaDe(dato.semanas, esSemana, 1)) return false
  // La semana activa tiene que existir; si no, la pantalla no tendría qué mostrar.
  return (dato.semanas as Semana[]).some((semana) => semana.id === dato.activa)
}
