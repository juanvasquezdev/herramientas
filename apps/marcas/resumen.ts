import { formatearFechaCorta } from '../../shared/fecha'
import { formatearNumero, redondear } from '../../shared/numero'
import { esMejor, formatearMarca, leerMarca } from './marca'
import type { Registro } from './modelo'
import type { Prueba } from './pruebas'

/** Una marca ya leída y lista para comparar. */
export interface Marca {
  id: string
  fecha: string
  valor: number
  lugar: string
}

export interface Resumen {
  /** Las marcas válidas de la prueba, de la más antigua a la más reciente. */
  marcas: Marca[]
  mejor: Marca | null
  ultima: Marca | null
  /** La mejor del año de la marca más reciente. */
  mejorDelAnio: Marca | null
  /**
   * Cuánto cambió de la primera a la última. `mejoro` ya tiene en cuenta si en la prueba
   * gana la marca más alta o la más baja. null si hay menos de dos marcas.
   */
  cambio: { diferencia: number; porcentaje: number; mejoro: boolean; igual: boolean } | null
}

/** Las marcas de una prueba que se pueden leer, ordenadas por fecha. */
export function marcasDe(registros: readonly Registro[], prueba: Prueba): Marca[] {
  const marcas: Marca[] = []
  for (const registro of registros) {
    if (registro.prueba !== prueba.id) continue
    const valor = leerMarca(registro.marca, prueba.unidad)
    // Sin fecha no se puede ubicar en el tiempo; sin valor no hay marca.
    if (valor === null || !/^\d{4}-\d{2}-\d{2}$/.test(registro.fecha)) continue
    marcas.push({ id: registro.id, fecha: registro.fecha, valor, lugar: registro.lugar })
  }
  // Las fechas AAAA-MM-DD se ordenan bien como texto. sort() es estable: dos marcas del
  // mismo día quedan en el orden en que se escribieron.
  return marcas.sort((a, b) => a.fecha.localeCompare(b.fecha))
}

function laMejor(marcas: readonly Marca[], prueba: Prueba): Marca | null {
  let mejor: Marca | null = null
  for (const marca of marcas) {
    // Con >/< estrictos, si hay empate se queda la primera: quien la hizo antes.
    if (mejor === null || esMejor(marca.valor, mejor.valor, prueba.mejor)) mejor = marca
  }
  return mejor
}

export function resumir(registros: readonly Registro[], prueba: Prueba): Resumen {
  const marcas = marcasDe(registros, prueba)
  const primera = marcas[0] ?? null
  const ultima = marcas.at(-1) ?? null

  let cambio: Resumen['cambio'] = null
  if (primera && ultima && marcas.length > 1) {
    const diferencia = redondear(ultima.valor - primera.valor, 3)
    cambio = {
      diferencia,
      porcentaje: redondear((Math.abs(diferencia) / primera.valor) * 100, 1),
      mejoro: esMejor(ultima.valor, primera.valor, prueba.mejor),
      igual: diferencia === 0,
    }
  }

  const anio = ultima?.fecha.slice(0, 4)
  return {
    marcas,
    mejor: laMejor(marcas, prueba),
    ultima,
    mejorDelAnio: laMejor(
      marcas.filter((marca) => marca.fecha.startsWith(`${anio}-`)),
      prueba,
    ),
    cambio,
  }
}

/** Cuántas marcas válidas hay por prueba. Para mostrarlo en el selector. */
export function contarPorPrueba(registros: readonly Registro[]): Map<string, number> {
  const conteo = new Map<string, number>()
  for (const registro of registros) {
    if (registro.marca.trim() === '') continue
    conteo.set(registro.prueba, (conteo.get(registro.prueba) ?? 0) + 1)
  }
  return conteo
}

/** Cuánto cambió de la primera marca a la última, diciendo con palabras si es mejora o no. */
export function textoDeCambio(
  resumen: Resumen,
  prueba: Prueba,
): { valor: string; detalle: string } | null {
  const { cambio } = resumen
  const primera = resumen.marcas[0]
  if (!cambio || !primera) return null

  const signo = cambio.diferencia > 0 ? '+' : cambio.diferencia < 0 ? '−' : ''
  const magnitud = Math.abs(cambio.diferencia)
  const valor =
    prueba.unidad === 's'
      ? `${signo}${formatearNumero(magnitud, 2)} s`
      : `${signo}${formatearMarca(magnitud, prueba.unidad)}`
  const desde = formatearFechaCorta(primera.fecha)
  if (cambio.igual) return { valor, detalle: `Igual que el ${desde}` }
  // "Retrocedió" y no "bajó": en una carrera, bajar el tiempo es justo lo bueno.
  const palabra = cambio.mejoro ? 'Mejoró' : 'Retrocedió'
  return { valor, detalle: `${palabra} ${formatearNumero(cambio.porcentaje, 1)} % desde ${desde}` }
}
