/**
 * Sube en uno el consecutivo de un documento y respeta los ceros:
 * COT-0001 -> COT-0002, COT-0999 -> COT-1000.
 * Si el número no termina en dígitos le agrega "-2", y si está vacío usa `inicial`.
 */
export function siguienteNumero(numero: string, inicial: string): string {
  const limpio = numero.trim()
  if (limpio === '') return inicial

  const partes = /^(.*?)(\d+)$/.exec(limpio)
  if (!partes) return `${limpio}-2`

  const [, prefijo = '', digitos = ''] = partes
  const siguiente = String(Number(digitos) + 1).padStart(digitos.length, '0')
  return `${prefijo}${siguiente}`
}
