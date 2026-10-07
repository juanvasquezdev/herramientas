/**
 * Fecha de hoy como AAAA-MM-DD, en la hora local del equipo.
 *
 * No uso toISOString() porque devuelve la fecha en UTC: en Colombia, después de las
 * 7 de la noche ya marca el día siguiente.
 */
export function hoyISO(ahora: Date = new Date()): string {
  const anio = ahora.getFullYear()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

/** "2026-10-07" -> "7 de octubre de 2026". Si el texto no es una fecha, lo devuelve igual. */
export function formatearFecha(iso: string): string {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!partes) return iso

  const [, anio, mes, dia] = partes
  // Se arma con números y no con new Date(iso), que la interpreta en UTC y corre el día.
  const fecha = new Date(Number(anio), Number(mes) - 1, Number(dia))
  return fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}
