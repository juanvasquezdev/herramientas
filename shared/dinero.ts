const formato = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const formatoCorto = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })

/** El signo va antes del peso: -$1.700,00 y no $-1.700,00. */
function conSigno(valor: number, formato: Intl.NumberFormat): string {
  const texto = formato.format(Math.abs(valor))
  // Un valor que se redondea a cero (-0,001) no lleva signo.
  const esNegativo = valor < 0 && /[1-9]/.test(texto)
  return `${esNegativo ? '-' : ''}$${texto}`
}

/** 1190000 -> "$1.190.000,00" */
export function formatearDinero(valor: number): string {
  return conSigno(valor, formato)
}

/** 1190000.4 -> "$1.190.000". Para tableros donde los centavos estorban. */
export function formatearDineroCorto(valor: number): string {
  return conSigno(valor, formatoCorto)
}
