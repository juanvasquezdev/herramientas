/**
 * Piezas para revisar la forma de un dato que llega de afuera (lo leído del navegador o
 * de un archivo de copia). Con ellas cada herramienta arma su propio "¿esto es válido?".
 */

export function esObjeto(dato: unknown): dato is Record<string, unknown> {
  return typeof dato === 'object' && dato !== null && !Array.isArray(dato)
}

/** ¿Es un objeto y todos esos campos son texto? */
export function tieneTextos(dato: unknown, campos: readonly string[]): boolean {
  return esObjeto(dato) && campos.every((campo) => typeof dato[campo] === 'string')
}

/** ¿Es una lista con al menos `minimo` elementos y todos pasan la revisión? */
export function esListaDe(
  dato: unknown,
  revisar: (elemento: unknown) => boolean,
  minimo = 0,
): boolean {
  return Array.isArray(dato) && dato.length >= minimo && dato.every(revisar)
}

/** ¿El valor es uno de los permitidos? Sirve para campos como estado o categoría. */
export function esUnoDe<T extends string>(dato: unknown, opciones: readonly T[]): dato is T {
  return typeof dato === 'string' && (opciones as readonly string[]).includes(dato)
}
