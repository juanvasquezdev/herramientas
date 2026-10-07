/**
 * Arma un CSV que Excel en español abre bien con doble clic: columnas separadas por punto
 * y coma y, al inicio, la marca que le dice a Excel que el texto viene en UTF-8 (sin ella
 * las tildes salen dañadas).
 */
export function aCsv(filas: ReadonlyArray<ReadonlyArray<string | number>>): string {
  const cuerpo = filas.map((fila) => fila.map(celda).join(';')).join('\r\n')
  return `﻿${cuerpo}`
}

function celda(valor: string | number): string {
  // Los números van con coma decimal, que es como los espera Excel en Colombia.
  const texto = typeof valor === 'number' ? String(valor).replace('.', ',') : valor
  // Comillas, saltos de línea o el separador obligan a encerrar la celda entre comillas.
  return /[";\r\n]/.test(texto) ? `"${texto.replaceAll('"', '""')}"` : texto
}
