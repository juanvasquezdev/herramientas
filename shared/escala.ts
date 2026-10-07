/** Cuentas que usan los gráficos. Están aparte para poder probarlas sin dibujar nada. */

/**
 * Marcas "redondas" para un eje que cubra de `min` a `max`: 0, 500, 1.000 en vez de
 * 0, 437, 874. Devuelve entre 2 y unas 6 marcas; la primera es <= min y la última >= max.
 */
export function marcasDelEje(min: number, max: number, deseadas = 4): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1]
  if (min === max) {
    // Con un solo valor no hay rango: se abre un poco para que el punto no quede en el borde.
    const margen = min === 0 ? 1 : Math.abs(min) * 0.1
    return marcasDelEje(min - margen, max + margen, deseadas)
  }

  const bruto = (max - min) / deseadas
  const potencia = 10 ** Math.floor(Math.log10(bruto))
  const fraccion = bruto / potencia
  const paso = (fraccion < 1.5 ? 1 : fraccion < 3 ? 2 : fraccion < 7 ? 5 : 10) * potencia

  const inicio = Math.floor(min / paso) * paso
  const fin = Math.ceil(max / paso) * paso
  const cantidad = Math.round((fin - inicio) / paso)
  // Se redondea cada marca para que 0.1 * 3 no aparezca como 0.30000000000000004.
  const decimales = Math.max(0, -Math.floor(Math.log10(paso)))
  return Array.from({ length: cantidad + 1 }, (_, i) =>
    Number((inicio + i * paso).toFixed(decimales)),
  )
}

/** Convierte un valor del dato en una posición en píxeles. */
export function escalaLineal(
  desde: number,
  hasta: number,
  pxDesde: number,
  pxHasta: number,
): (valor: number) => number {
  const rango = hasta - desde
  if (rango === 0) return () => (pxDesde + pxHasta) / 2
  return (valor) => pxDesde + ((valor - desde) / rango) * (pxHasta - pxDesde)
}
