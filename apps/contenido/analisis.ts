import { aPositivo, redondear } from '../../shared/numero'
import { ESTADOS, type Estado, type Publicacion } from './modelo'

/** Lo que se calcula a partir de las publicaciones. */

export function delMes(publicaciones: readonly Publicacion[], mes: string): Publicacion[] {
  return publicaciones
    .filter((publicacion) => publicacion.fecha.startsWith(`${mes}-`))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
}

export function contarPorEstado(publicaciones: readonly Publicacion[]): Record<Estado, number> {
  const conteo = Object.fromEntries(ESTADOS.map((estado) => [estado, 0])) as Record<Estado, number>
  for (const publicacion of publicaciones) conteo[publicacion.estado] += 1
  return conteo
}

/** Interacciones por cada 100 vistas. 0 si no hay vistas, en vez de dividir por cero. */
export function tasaDeInteraccion(
  publicacion: Pick<Publicacion, 'vistas' | 'interacciones'>,
): number {
  const vistas = aPositivo(publicacion.vistas)
  return vistas > 0 ? redondear((aPositivo(publicacion.interacciones) / vistas) * 100, 1) : 0
}

export interface Rendimiento {
  nombre: string
  publicaciones: number
  vistasPromedio: number
  /** Interacciones totales del grupo por cada 100 vistas totales. */
  interaccion: number
}

export type Agrupar = 'pilar' | 'formato' | 'plataforma'

/**
 * Cómo le fue a cada pilar, formato o plataforma, del que más vistas promedia al que menos.
 * Solo cuentan las publicaciones ya publicadas y con vistas escritas: una idea sin
 * publicar no dice nada sobre qué funciona.
 */
export function rendimientoPor(
  publicaciones: readonly Publicacion[],
  campo: Agrupar,
): Rendimiento[] {
  const grupos = new Map<string, { cantidad: number; vistas: number; interacciones: number }>()

  for (const publicacion of publicaciones) {
    const vistas = aPositivo(publicacion.vistas)
    if (publicacion.estado !== 'Publicado' || vistas === 0) continue

    const grupo = grupos.get(publicacion[campo]) ?? { cantidad: 0, vistas: 0, interacciones: 0 }
    grupo.cantidad += 1
    grupo.vistas += vistas
    grupo.interacciones += aPositivo(publicacion.interacciones)
    grupos.set(publicacion[campo], grupo)
  }

  return [...grupos.entries()]
    .map(([nombre, grupo]) => ({
      nombre,
      publicaciones: grupo.cantidad,
      vistasPromedio: redondear(grupo.vistas / grupo.cantidad, 0),
      interaccion: redondear((grupo.interacciones / grupo.vistas) * 100, 1),
    }))
    .sort((a, b) => b.vistasPromedio - a.vistasPromedio)
}
