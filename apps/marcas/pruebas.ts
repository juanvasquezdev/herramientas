/**
 * El catálogo de pruebas. Cada una dice en qué se mide y si es mejor una marca más alta
 * (saltos, lanzamientos, fuerza) o más baja (carreras). Sin ese dato no se puede saber
 * cuál es la mejor marca ni si el atleta mejoró.
 */

export type Unidad = 'm' | 'cm' | 'kg' | 's' | 'pts'
export type Sentido = 'mayor' | 'menor'

export interface Prueba {
  id: string
  nombre: string
  grupo: string
  unidad: Unidad
  mejor: Sentido
}

const grupo = (
  nombre: string,
  unidad: Unidad,
  mejor: Sentido,
  pruebas: Array<[id: string, nombre: string]>,
): Prueba[] =>
  pruebas.map(([id, nombrePrueba]) => ({ id, nombre: nombrePrueba, grupo: nombre, unidad, mejor }))

export const PRUEBAS: Prueba[] = [
  ...grupo('Saltos', 'm', 'mayor', [
    ['salto-alto', 'Salto alto'],
    ['garrocha', 'Salto con garrocha'],
    ['salto-largo', 'Salto largo'],
    ['salto-triple', 'Salto triple'],
  ]),
  ...grupo('Lanzamientos', 'm', 'mayor', [
    ['bala', 'Impulsión de bala'],
    ['disco', 'Lanzamiento de disco'],
    ['jabalina', 'Lanzamiento de jabalina'],
    ['martillo', 'Lanzamiento de martillo'],
  ]),
  ...grupo('Velocidad y vallas', 's', 'menor', [
    ['60m', '60 m'],
    ['100m', '100 m'],
    ['200m', '200 m'],
    ['400m', '400 m'],
    ['100m-vallas', '100 m vallas'],
    ['110m-vallas', '110 m vallas'],
    ['400m-vallas', '400 m vallas'],
  ]),
  ...grupo('Medio fondo y fondo', 's', 'menor', [
    ['800m', '800 m'],
    ['1500m', '1.500 m'],
    ['3000m', '3.000 m'],
    ['3000m-obstaculos', '3.000 m obstáculos'],
    ['5000m', '5.000 m'],
    ['10000m', '10.000 m'],
    ['media-maraton', 'Media maratón'],
    ['maraton', 'Maratón'],
    ['marcha-20km', 'Marcha 20 km'],
  ]),
  ...grupo('Pruebas combinadas', 'pts', 'mayor', [
    ['heptatlon', 'Heptatlón'],
    ['decatlon', 'Decatlón'],
  ]),
  ...grupo('Fuerza', 'kg', 'mayor', [
    ['sentadilla', 'Sentadilla'],
    ['cargada', 'Cargada'],
    ['arranque', 'Arranque'],
    ['press-banca', 'Press de banca'],
    ['peso-muerto', 'Peso muerto'],
  ]),
  ...grupo('Tests', 'cm', 'mayor', [['salto-vertical', 'Salto vertical']]),
  ...grupo('Tests', 'm', 'mayor', [['largo-sin-impulso', 'Salto largo sin impulso']]),
  ...grupo('Tests', 's', 'menor', [['30m-lanzados', '30 m lanzados']]),
]

export const PRUEBA_INICIAL = 'salto-alto'

export function buscarPrueba(id: string): Prueba {
  const encontrada = PRUEBAS.find((prueba) => prueba.id === id) ?? PRUEBAS[0]
  // PRUEBAS nunca está vacía, pero TypeScript no lo sabe.
  if (!encontrada) throw new Error('El catálogo de pruebas está vacío')
  return encontrada
}

/** Los nombres de grupo en el orden en que aparecen, sin repetir. */
export const GRUPOS: string[] = [...new Set(PRUEBAS.map((prueba) => prueba.grupo))]
