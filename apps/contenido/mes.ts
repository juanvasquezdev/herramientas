/** Cuentas de calendario. Un mes se escribe "2026-10" y un día "2026-10-07". */

function partes(mes: string): [anio: number, indiceMes: number] {
  const [anio, numero] = mes.split('-').map(Number)
  return [anio ?? 1970, (numero ?? 1) - 1]
}

function dosCifras(valor: number): string {
  return String(valor).padStart(2, '0')
}

/** El mes que queda `saltos` meses adelante (o atrás si es negativo). */
export function moverMes(mes: string, saltos: number): string {
  const [anio, indice] = partes(mes)
  const fecha = new Date(anio, indice + saltos, 1)
  return `${fecha.getFullYear()}-${dosCifras(fecha.getMonth() + 1)}`
}

/** "2026-10" -> "octubre de 2026" */
export function nombreDelMes(mes: string): string {
  const [anio, indice] = partes(mes)
  return new Date(anio, indice, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
}

/**
 * Las semanas del mes para dibujar el calendario: cada semana tiene 7 casillas, de lunes
 * a domingo. Las casillas que caen fuera del mes van en null.
 */
export function semanasDelMes(mes: string): Array<Array<string | null>> {
  const [anio, indice] = partes(mes)
  const diasDelMes = new Date(anio, indice + 1, 0).getDate()
  // getDay() cuenta desde el domingo (0). Se corre para que el lunes sea la primera columna.
  const vaciasAlInicio = (new Date(anio, indice, 1).getDay() + 6) % 7

  const casillas: Array<string | null> = [
    ...Array.from({ length: vaciasAlInicio }, () => null),
    ...Array.from({ length: diasDelMes }, (_, dia) => `${mes}-${dosCifras(dia + 1)}`),
  ]
  while (casillas.length % 7 !== 0) casillas.push(null)

  const semanas: Array<Array<string | null>> = []
  for (let i = 0; i < casillas.length; i += 7) semanas.push(casillas.slice(i, i + 7))
  return semanas
}

/** El día en que cae una publicación nueva: hoy si se está viendo este mes; si no, el día 1. */
export function fechaParaNueva(mesVisible: string, hoy: string): string {
  return hoy.startsWith(`${mesVisible}-`) ? hoy : `${mesVisible}-01`
}
