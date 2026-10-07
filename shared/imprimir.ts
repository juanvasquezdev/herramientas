/**
 * Abre la ventana de impresión del navegador (ahí mismo se elige "Guardar como PDF").
 *
 * El navegador usa el título de la página como nombre del archivo, así que se cambia
 * por un momento y se devuelve cuando la ventana se cierra.
 *
 * Qué se imprime lo deciden las clases .solo-impresion y .no-impresion de ui.css.
 */
export function imprimirConTitulo(titulo: string): void {
  const anterior = document.title
  document.title = titulo
  window.addEventListener(
    'afterprint',
    () => {
      document.title = anterior
    },
    { once: true },
  )
  window.print()
}
