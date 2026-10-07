import type { Regla } from './regla'

/** Qué hace cada gesto en cada modo. Es lo que se muestra en la guía y lo que se ejecuta. */

export type Modo = 'reproductor' | 'diapositivas' | 'dibujo'

export const MODOS: ReadonlyArray<{ valor: Modo; texto: string }> = [
  { valor: 'reproductor', texto: 'Música y video' },
  { valor: 'diapositivas', texto: 'Diapositivas' },
  { valor: 'dibujo', texto: 'Dibujo' },
]

export type AccionReproductor = 'alternar' | 'siguiente' | 'anterior' | 'subir' | 'bajar'
export type AccionDiapositivas = 'siguiente' | 'anterior'
export type AccionDibujo = 'color' | 'borrar'
export type Accion = AccionReproductor | AccionDiapositivas | AccionDibujo

export const REGLAS: Record<Modo, ReadonlyArray<Regla<Accion>>> = {
  reproductor: [
    { gesto: 'Open_Palm', accion: 'alternar', descripcion: 'Reproducir o pausar' },
    { gesto: 'Pointing_Up', accion: 'siguiente', descripcion: 'Siguiente' },
    { gesto: 'Victory', accion: 'anterior', descripcion: 'Anterior' },
    { gesto: 'Thumb_Up', accion: 'subir', descripcion: 'Subir el volumen', repetir: true },
    { gesto: 'Thumb_Down', accion: 'bajar', descripcion: 'Bajar el volumen', repetir: true },
  ],
  diapositivas: [
    { gesto: 'Pointing_Up', accion: 'siguiente', descripcion: 'Siguiente diapositiva' },
    { gesto: 'Victory', accion: 'anterior', descripcion: 'Diapositiva anterior' },
  ],
  dibujo: [
    { gesto: 'Victory', accion: 'color', descripcion: 'Cambiar de color' },
    // Borrar no se puede deshacer: pide sostener el puño más tiempo.
    {
      gesto: 'Closed_Fist',
      accion: 'borrar',
      descripcion: 'Borrar todo (sostén 1 segundo)',
      sostener: 1000,
    },
  ],
}

/** Gestos que en el modo dibujo no disparan una acción sino que actúan todo el tiempo. */
export const GUIA_EXTRA_DE_DIBUJO = [
  { gesto: 'Pointing_Up', descripcion: 'Dibujar con la punta del dedo' },
  { gesto: 'Open_Palm', descripcion: 'Mover sin dibujar' },
] as const

/** Lo que cada modo le ofrece a la pantalla principal para recibir órdenes. */
export interface ControlDeModo {
  hacer(accion: Accion): void
  /** Solo el dibujo lo usa: dónde está la punta del índice y si está dibujando. */
  mover?(x: number, y: number, dibujando: boolean): void
}
