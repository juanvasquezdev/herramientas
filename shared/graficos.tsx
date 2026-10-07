import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { escalaLineal, marcasDelEje } from './escala'
import './graficos.css'

/**
 * Gráficos hechos a mano en SVG. No se usa una librería porque solo hacen falta tres
 * formas y así la página de cada herramienta pesa unos pocos KB.
 *
 * Reglas que cumplen todos: marcas delgadas, rejilla apenas visible, el valor exacto sale
 * al pasar el cursor o al enfocar con teclado, y debajo hay una tabla con los mismos datos
 * para quien no puede o no quiere leer el gráfico.
 */

const ALTO_EJE_X = 24
const MARGEN_SUPERIOR = 18
const MARGEN_DERECHO = 12

/** Mide el ancho real del contenedor para dibujar en píxeles y que el texto no se encoja. */
function useAncho<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [ancho, setAncho] = useState(600)

  // Antes de pintar, para que el gráfico no aparezca un instante con el ancho equivocado.
  useLayoutEffect(() => {
    if (ref.current?.clientWidth) setAncho(ref.current.clientWidth)
  }, [])

  useEffect(() => {
    const elemento = ref.current
    if (!elemento) return
    const observador = new ResizeObserver((entradas) => {
      const medida = entradas[0]?.contentRect.width
      if (medida) setAncho(Math.round(medida))
    })
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  return [ref, ancho] as const
}

interface Globo {
  x: number
  y: number
  valor: string
  etiqueta: string
}

function GloboDeValor({ globo, ancho }: { globo: Globo | null; ancho: number }) {
  if (!globo) return null
  // Cerca del borde derecho el globo se abre hacia la izquierda para no salirse.
  const haciaIzquierda = globo.x > ancho - 130
  return (
    <div
      className="gr-globo"
      style={{
        left: globo.x,
        top: globo.y,
        transform: `translate(${haciaIzquierda ? 'calc(-100% - 10px)' : '10px'}, -50%)`,
      }}
      aria-hidden
    >
      <strong>{globo.valor}</strong>
      <span>{globo.etiqueta}</span>
    </div>
  )
}

function anchoDeEtiquetas(marcas: number[], formato: (valor: number) => string): number {
  const masLarga = Math.max(...marcas.map((marca) => formato(marca).length))
  return masLarga * 6.4 + 12
}

interface TablaProps {
  columnas: [string, string]
  filas: Array<[string, string]>
}

function TablaDeDatos({ columnas, filas }: TablaProps) {
  return (
    <details className="gr-detalle">
      <summary>Ver los datos en tabla</summary>
      <table className="gr-tabla">
        <thead>
          <tr>
            <th scope="col">{columnas[0]}</th>
            <th scope="col">{columnas[1]}</th>
          </tr>
        </thead>
        <tbody>
          {filas.map(([nombre, valor]) => (
            <tr key={nombre}>
              <td>{nombre}</td>
              <td>{valor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}

/* ---------- Columnas ---------- */

export interface Columna {
  /** Texto corto del eje: "Lun", "Sem 3". */
  etiqueta: string
  /** Texto completo para el globo y la tabla: "Lunes". Si falta se usa la etiqueta. */
  nombre?: string
  valor: number
  /** Si alguna columna va resaltada, las demás se apagan a gris. */
  resaltada?: boolean
}

interface GraficoColumnasProps {
  /** Describe el gráfico para lectores de pantalla y titula la tabla. */
  titulo: string
  columnas: Columna[]
  formato: (valor: number) => string
  /** Nombre de la medida para la tabla: "Tonelaje". */
  medida: string
  alto?: number
  /** Para los documentos que se imprimen, donde no hay un contenedor visible que medir. */
  anchoFijo?: number
}

/** Comparar cantidades entre pocas categorías: carga por día, tonelaje por semana. */
export function GraficoColumnas({
  titulo,
  columnas,
  formato,
  medida,
  alto = 170,
  anchoFijo,
}: GraficoColumnasProps) {
  const [ref, anchoMedido] = useAncho<HTMLDivElement>()
  const ancho = anchoFijo ?? anchoMedido
  const [globo, setGlobo] = useState<Globo | null>(null)

  const maximo = Math.max(...columnas.map((columna) => columna.valor), 0)
  const marcas = marcasDelEje(0, maximo || 1, 3)
  const margenIzquierdo = anchoDeEtiquetas(marcas, formato)
  const base = MARGEN_SUPERIOR + alto
  const y = escalaLineal(0, marcas.at(-1) ?? 1, base, MARGEN_SUPERIOR)

  const anchoUtil = Math.max(ancho - margenIzquierdo - MARGEN_DERECHO, 10)
  const banda = anchoUtil / Math.max(columnas.length, 1)
  const grosor = Math.min(24, banda * 0.6)
  const hayResaltada = columnas.some((columna) => columna.resaltada)
  const indiceMaximo = columnas.findIndex((columna) => columna.valor === maximo)

  return (
    <figure className="gr-figura">
      <div ref={ref} className="gr-lienzo">
        <svg width={ancho} height={base + ALTO_EJE_X} role="img" aria-label={titulo}>
          {marcas.map((marca) => (
            <g key={marca}>
              <line
                x1={margenIzquierdo}
                x2={ancho - MARGEN_DERECHO}
                y1={y(marca)}
                y2={y(marca)}
                className={marca === 0 ? 'gr-eje' : 'gr-rejilla'}
              />
              <text
                x={margenIzquierdo - 8}
                y={y(marca)}
                className="gr-marca"
                textAnchor="end"
                dy="0.32em"
              >
                {formato(marca)}
              </text>
            </g>
          ))}

          {columnas.map((columna, indice) => {
            const centro = margenIzquierdo + banda * indice + banda / 2
            const tope = y(columna.valor)
            const altura = base - tope
            const radio = Math.min(4, grosor / 2, altura)
            const apagada = hayResaltada && !columna.resaltada
            const conValor = hayResaltada
              ? columna.resaltada
              : indice === indiceMaximo && maximo > 0
            const nombre = columna.nombre ?? columna.etiqueta
            const mostrar = () =>
              setGlobo({
                x: centro,
                y: Math.min(tope, base - 12),
                valor: formato(columna.valor),
                etiqueta: nombre,
              })

            return (
              // biome-ignore lint/a11y/noInteractiveElementToNoninteractiveRole: cada columna recibe foco para leer su valor con teclado; en SVG eso se anuncia como imagen con nombre
              <g
                // biome-ignore lint/suspicious/noArrayIndexKey: la gráfica se pinta entera cada vez y las columnas no guardan estado propio
                key={`${columna.etiqueta}-${indice}`}
                tabIndex={0}
                role="img"
                aria-label={`${nombre}: ${formato(columna.valor)}`}
                className="gr-marca-interactiva"
                onPointerEnter={mostrar}
                onPointerLeave={() => setGlobo(null)}
                onFocus={mostrar}
                onBlur={() => setGlobo(null)}
              >
                {/* Zona de toque: toda la banda, no solo la barra delgada. */}
                <rect
                  x={centro - banda / 2}
                  y={MARGEN_SUPERIOR}
                  width={banda}
                  height={alto}
                  fill="transparent"
                />
                {altura > 0 && (
                  <path
                    d={`M${centro - grosor / 2},${base} V${tope + radio} Q${centro - grosor / 2},${tope} ${centro - grosor / 2 + radio},${tope} H${centro + grosor / 2 - radio} Q${centro + grosor / 2},${tope} ${centro + grosor / 2},${tope + radio} V${base} Z`}
                    className={apagada ? 'gr-columna gr-apagada' : 'gr-columna'}
                  />
                )}
                {conValor && (
                  <text x={centro} y={tope - 6} className="gr-valor" textAnchor="middle">
                    {formato(columna.valor)}
                  </text>
                )}
                <text x={centro} y={base + 16} className="gr-marca" textAnchor="middle">
                  {columna.etiqueta}
                </text>
              </g>
            )
          })}
        </svg>
        <GloboDeValor globo={globo} ancho={ancho} />
      </div>
      <TablaDeDatos
        columnas={[titulo, medida]}
        filas={columnas.map((columna) => [
          columna.nombre ?? columna.etiqueta,
          formato(columna.valor),
        ])}
      />
    </figure>
  )
}

/* ---------- Línea ---------- */

export interface Punto {
  /** Posición en el eje horizontal. Para fechas, los milisegundos de la fecha. */
  x: number
  /** Cómo se lee esa posición: "7 de octubre de 2026". */
  etiqueta: string
  valor: number
  /** El punto del que trata la historia (la mejor marca). Sale más grande y con su valor. */
  destacado?: boolean
}

interface GraficoLineaProps {
  titulo: string
  puntos: Punto[]
  formato: (valor: number) => string
  medida: string
  alto?: number
  /** Para los documentos que se imprimen, donde no hay un contenedor visible que medir. */
  anchoFijo?: number
}

/** Cómo cambia un valor en el tiempo. Los puntos se separan según su fecha real. */
export function GraficoLinea({
  titulo,
  puntos,
  formato,
  medida,
  alto = 170,
  anchoFijo,
}: GraficoLineaProps) {
  const [ref, anchoMedido] = useAncho<HTMLDivElement>()
  const ancho = anchoFijo ?? anchoMedido
  const [activo, setActivo] = useState<number | null>(null)

  const valores = puntos.map((punto) => punto.valor)
  const marcas = marcasDelEje(Math.min(...valores), Math.max(...valores), 3)
  const margenIzquierdo = anchoDeEtiquetas(marcas, formato)
  const base = MARGEN_SUPERIOR + alto
  const derecha = ancho - MARGEN_DERECHO - 8
  const y = escalaLineal(marcas[0] ?? 0, marcas.at(-1) ?? 1, base, MARGEN_SUPERIOR)
  const x = escalaLineal(puntos[0]?.x ?? 0, puntos.at(-1)?.x ?? 1, margenIzquierdo + 8, derecha)

  const trazo = puntos
    .map((punto, indice) => `${indice === 0 ? 'M' : 'L'}${x(punto.x)},${y(punto.valor)}`)
    .join(' ')
  const primero = puntos[0]
  const ultimo = puntos.at(-1)
  const puntoActivo = activo === null ? undefined : puntos[activo]

  // El cursor no tiene que caer sobre el punto: se toma el más cercano en horizontal.
  const buscarCercano = (clientX: number, caja: DOMRect) => {
    const posicion = clientX - caja.left
    let mejor = 0
    let distancia = Number.POSITIVE_INFINITY
    puntos.forEach((punto, indice) => {
      const d = Math.abs(x(punto.x) - posicion)
      if (d < distancia) {
        distancia = d
        mejor = indice
      }
    })
    setActivo(mejor)
  }

  return (
    <figure className="gr-figura">
      <div ref={ref} className="gr-lienzo">
        <svg
          width={ancho}
          height={base + ALTO_EJE_X}
          role="img"
          aria-label={titulo}
          onPointerMove={(evento) =>
            buscarCercano(evento.clientX, evento.currentTarget.getBoundingClientRect())
          }
          onPointerLeave={() => setActivo(null)}
        >
          {marcas.map((marca) => (
            <g key={marca}>
              <line
                x1={margenIzquierdo}
                x2={ancho - MARGEN_DERECHO}
                y1={y(marca)}
                y2={y(marca)}
                className="gr-rejilla"
              />
              <text
                x={margenIzquierdo - 8}
                y={y(marca)}
                className="gr-marca"
                textAnchor="end"
                dy="0.32em"
              >
                {formato(marca)}
              </text>
            </g>
          ))}

          {puntoActivo && (
            <line
              x1={x(puntoActivo.x)}
              x2={x(puntoActivo.x)}
              y1={MARGEN_SUPERIOR}
              y2={base}
              className="gr-eje"
            />
          )}

          <path d={trazo} className="gr-linea" />

          {puntos.map((punto, indice) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: puede haber dos puntos en la misma fecha; no guardan estado propio
            <g key={`${punto.x}-${indice}`}>
              <circle
                cx={x(punto.x)}
                cy={y(punto.valor)}
                r={punto.destacado ? 6.5 : 5}
                className={punto.destacado ? 'gr-punto gr-punto-destacado' : 'gr-punto'}
              />
              {punto.destacado && (
                <text
                  x={x(punto.x)}
                  y={y(punto.valor) - 11}
                  className="gr-valor"
                  textAnchor={
                    x(punto.x) > derecha - 30
                      ? 'end'
                      : x(punto.x) < margenIzquierdo + 30
                        ? 'start'
                        : 'middle'
                  }
                >
                  {formato(punto.valor)}
                </text>
              )}
              {/* Zona de foco para teclado, más grande que el punto. */}
              {/* biome-ignore lint/a11y/noInteractiveElementToNoninteractiveRole: cada punto recibe foco para leer su valor con teclado; en SVG eso se anuncia como imagen con nombre */}
              <circle
                cx={x(punto.x)}
                cy={y(punto.valor)}
                r={12}
                fill="transparent"
                tabIndex={0}
                role="img"
                aria-label={`${punto.etiqueta}: ${formato(punto.valor)}`}
                className="gr-marca-interactiva"
                onFocus={() => setActivo(indice)}
                onBlur={() => setActivo(null)}
              />
            </g>
          ))}

          {primero && (
            <text x={x(primero.x)} y={base + 16} className="gr-marca" textAnchor="start">
              {primero.etiqueta}
            </text>
          )}
          {ultimo && puntos.length > 1 && (
            <text x={x(ultimo.x)} y={base + 16} className="gr-marca" textAnchor="end">
              {ultimo.etiqueta}
            </text>
          )}
        </svg>
        <GloboDeValor
          globo={
            puntoActivo
              ? {
                  x: x(puntoActivo.x),
                  y: y(puntoActivo.valor),
                  valor: formato(puntoActivo.valor),
                  etiqueta: puntoActivo.etiqueta,
                }
              : null
          }
          ancho={ancho}
        />
      </div>
      <TablaDeDatos
        columnas={['Fecha', medida]}
        filas={puntos.map((punto, indice) => [
          `${indice + 1}. ${punto.etiqueta}`,
          formato(punto.valor),
        ])}
      />
    </figure>
  )
}

/* ---------- Partes de un total ---------- */

export interface Parte {
  nombre: string
  valor: number
  /** Posición de color fija (1 a 4). Sigue a la parte, no a su tamaño. */
  serie: 1 | 2 | 3 | 4
}

interface BarraDePartesProps {
  titulo: string
  partes: Parte[]
  formato: (valor: number) => string
}

/**
 * De qué está hecho un total: una barra partida y, debajo, cada parte con su valor y su
 * porcentaje. La lista hace de leyenda, así nadie depende solo del color.
 */
export function BarraDePartes({ titulo, partes, formato }: BarraDePartesProps) {
  const visibles = partes.filter((parte) => parte.valor > 0)
  const total = visibles.reduce((suma, parte) => suma + parte.valor, 0)
  if (total <= 0) return null

  return (
    <figure className="gr-figura">
      <div className="gr-partes" role="img" aria-label={titulo}>
        {visibles.map((parte) => (
          <span
            key={parte.nombre}
            className={`gr-parte gr-serie-${parte.serie}`}
            style={{ flexGrow: parte.valor }}
            title={`${parte.nombre}: ${formato(parte.valor)}`}
          />
        ))}
      </div>
      <ul className="gr-leyenda">
        {visibles.map((parte) => (
          <li key={parte.nombre}>
            <span className={`gr-muestra gr-serie-${parte.serie}`} aria-hidden />
            <span className="gr-leyenda-nombre">{parte.nombre}</span>
            <strong>{formato(parte.valor)}</strong>
            <span className="gr-leyenda-porcentaje">
              {Math.round((parte.valor / total) * 100)} %
            </span>
          </li>
        ))}
      </ul>
    </figure>
  )
}

/* ---------- Barras horizontales ---------- */

export interface Fila {
  nombre: string
  valor: number
  /** Lo que se muestra al final de la barra. Si falta, el valor con el formato. */
  texto?: ReactNode
  resaltada?: boolean
}

interface BarrasProps {
  filas: Fila[]
  formato: (valor: number) => string
}

/** Comparar categorías con nombre largo: una fila por categoría y el valor al final. */
export function Barras({ filas, formato }: BarrasProps) {
  const maximo = Math.max(...filas.map((fila) => fila.valor), 0)
  const hayResaltada = filas.some((fila) => fila.resaltada)

  return (
    <ul className="gr-barras">
      {filas.map((fila) => (
        <li key={fila.nombre}>
          <span className="gr-barras-nombre">{fila.nombre}</span>
          <span className="gr-pista">
            <span
              className={hayResaltada && !fila.resaltada ? 'gr-barra gr-apagada' : 'gr-barra'}
              style={{ width: maximo > 0 ? `${(fila.valor / maximo) * 100}%` : 0 }}
            />
          </span>
          <span className="gr-barras-valor">{fila.texto ?? formato(fila.valor)}</span>
        </li>
      ))}
    </ul>
  )
}
