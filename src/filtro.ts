import { type Categoria, NOMBRE_DE_CATEGORIA } from './herramientas'

/** Lo que se puede escoger arriba de la lista: una categoría o todas. */
export type FiltroCategoria = Categoria | 'todas'

interface Buscable {
  nombre: string
  resumen: string
  categoria: Categoria
}

/** Sin tildes y en minúscula: "rentabílidad" y "RENTABILIDAD" encuentran lo mismo. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

/**
 * Filtra por categoría y por texto. Cada palabra escrita tiene que aparecer en el nombre,
 * el resumen o la categoría, en cualquier orden: "pdf marcas" encuentra el registro de marcas.
 */
export function filtrar<T extends Buscable>(
  lista: readonly T[],
  texto: string,
  categoria: FiltroCategoria,
): T[] {
  const palabras = normalizar(texto).split(/\s+/).filter(Boolean)
  return lista.filter((h) => {
    if (categoria !== 'todas' && h.categoria !== categoria) return false
    const donde = normalizar(`${h.nombre} ${h.resumen} ${NOMBRE_DE_CATEGORIA[h.categoria]}`)
    return palabras.every((p) => donde.includes(p))
  })
}

/** Cuántas hay en cada categoría, para mostrarlo al lado de cada filtro. */
export function contarPorCategoria(lista: readonly Buscable[]): Record<FiltroCategoria, number> {
  const cuenta: Record<FiltroCategoria, number> = {
    todas: lista.length,
    negocio: 0,
    deporte: 0,
    contenido: 0,
    experimentos: 0,
  }
  for (const h of lista) cuenta[h.categoria] += 1
  return cuenta
}

/** Lee la categoría de la dirección; si no es una conocida, se muestran todas. */
export function leerCategoria(valor: string | null): FiltroCategoria {
  return valor !== null && Object.hasOwn(NOMBRE_DE_CATEGORIA, valor)
    ? (valor as Categoria)
    : 'todas'
}
