/**
 * De "la cámara ve este gesto" a "hay que hacer esta acción". Es una función pura para
 * poder probar el comportamiento en el tiempo sin cámara ni modelo.
 *
 * El reconocedor mira la mano unas 15 veces por segundo. Si cada lectura disparara una
 * acción, levantar el índice pasaría veinte diapositivas. Por eso un gesto solo cuenta
 * cuando se sostiene un momento, y no vuelve a contar hasta que la mano lo suelta.
 */

/** Los gestos que reconoce el modelo de Google, con sus nombres originales. */
export type Gesto =
  | 'None'
  | 'Closed_Fist'
  | 'Open_Palm'
  | 'Pointing_Up'
  | 'Thumb_Down'
  | 'Thumb_Up'
  | 'Victory'
  | 'ILoveYou'

export const NOMBRE_DEL_GESTO: Record<Gesto, string> = {
  None: 'Ninguno',
  Closed_Fist: 'Puño cerrado',
  Open_Palm: 'Palma abierta',
  Pointing_Up: 'Índice arriba',
  Thumb_Down: 'Pulgar abajo',
  Thumb_Up: 'Pulgar arriba',
  Victory: 'Dos dedos en V',
  ILoveYou: 'Te quiero',
}

export interface Regla<Accion extends string> {
  gesto: Gesto
  accion: Accion
  /** Lo que ve la persona en la guía: "Siguiente diapositiva". */
  descripcion: string
  /** Si se mantiene el gesto, la acción se repite (subir volumen). Por defecto se hace una vez. */
  repetir?: boolean
  /** Milisegundos que hay que sostenerlo. Más largo para acciones que no se pueden deshacer. */
  sostener?: number
}

export interface Tiempos {
  /** Cuánto hay que sostener un gesto para que cuente. */
  sostener: number
  /** Cada cuánto se repite una acción con `repetir`. */
  repetirCada: number
  /** Cuánto puede "perderse" la mano sin que se reinicie la cuenta. Cubre un parpadeo del detector. */
  tolerancia: number
}

export const TIEMPOS: Tiempos = { sostener: 450, repetirCada: 500, tolerancia: 200 }

export interface Estado {
  /** El gesto que se viene sosteniendo. */
  gesto: Gesto
  /** Desde cuándo se sostiene. */
  desde: number
  /** La última vez que el detector lo vio. */
  visto: number
  /** Si ya se hizo su acción en esta sostenida. */
  disparado: boolean
  /** Cuándo se hizo la acción por última vez (para las que se repiten). */
  ultimoDisparo: number
}

export const ESTADO_INICIAL: Estado = {
  gesto: 'None',
  desde: 0,
  visto: 0,
  disparado: false,
  ultimoDisparo: 0,
}

export interface Paso<Accion extends string> {
  estado: Estado
  /** La acción que toca hacer ahora, o null. */
  accion: Accion | null
  /** De 0 a 1: cuánto falta para que el gesto actual cuente. Para mostrar el avance. */
  avance: number
}

/** Procesa una lectura del reconocedor. `ahora` va en milisegundos. */
export function avanzar<Accion extends string>(
  estado: Estado,
  gesto: Gesto,
  ahora: number,
  reglas: ReadonlyArray<Regla<Accion>>,
  tiempos: Tiempos = TIEMPOS,
): Paso<Accion> {
  // La mano se perdió un instante pero venía sosteniendo un gesto: se espera sin reiniciar.
  if (gesto === 'None' && estado.gesto !== 'None' && ahora - estado.visto <= tiempos.tolerancia) {
    return { estado, accion: null, avance: avanceDe(estado, ahora, reglas, tiempos) }
  }

  if (gesto !== estado.gesto) {
    const nuevo: Estado = {
      gesto,
      desde: ahora,
      visto: ahora,
      disparado: false,
      ultimoDisparo: estado.ultimoDisparo,
    }
    return { estado: nuevo, accion: null, avance: 0 }
  }

  const actual: Estado = { ...estado, visto: ahora }
  const regla = reglas.find((r) => r.gesto === gesto)
  if (!regla) return { estado: actual, accion: null, avance: 0 }

  const necesario = regla.sostener ?? tiempos.sostener
  if (!actual.disparado && ahora - actual.desde >= necesario) {
    return {
      estado: { ...actual, disparado: true, ultimoDisparo: ahora },
      accion: regla.accion,
      avance: 1,
    }
  }
  if (actual.disparado && regla.repetir && ahora - actual.ultimoDisparo >= tiempos.repetirCada) {
    return { estado: { ...actual, ultimoDisparo: ahora }, accion: regla.accion, avance: 1 }
  }
  return { estado: actual, accion: null, avance: avanceDe(actual, ahora, reglas, tiempos) }
}

function avanceDe<Accion extends string>(
  estado: Estado,
  ahora: number,
  reglas: ReadonlyArray<Regla<Accion>>,
  tiempos: Tiempos,
): number {
  const regla = reglas.find((r) => r.gesto === estado.gesto)
  if (!regla) return 0
  if (estado.disparado) return 1
  return Math.min(1, (ahora - estado.desde) / (regla.sostener ?? tiempos.sostener))
}
