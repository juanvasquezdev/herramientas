/** Hace que el navegador descargue un archivo con ese contenido. */
export function descargarTexto(nombre: string, contenido: string, tipo: string): void {
  descargarBlob(nombre, new Blob([contenido], { type: tipo }))
}

export function descargarBlob(nombre: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  enlace.click()
  // Se libera después de un momento: algunos navegadores cancelan la descarga si es de inmediato.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Texto seguro para un nombre de archivo: "Página web / Ana" -> "pagina-web-ana". */
export function paraNombreDeArchivo(texto: string, respaldo = 'archivo'): string {
  const limpio = texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return limpio || respaldo
}
