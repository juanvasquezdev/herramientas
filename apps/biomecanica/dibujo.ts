import type { Lado, Medidas, PuntoPose } from './angulos'

/** Dibuja en el lienzo el cuadro del video con el esqueleto y los ángulos encima. */

const COLOR_APOYO = '#eb6834' // la pierna de despegue, que es de lo que trata el análisis
const COLOR_CUERPO = '#ffffff'
const COLOR_BORDE = 'rgba(0, 0, 0, 0.55)'

const LADO = {
  izquierda: {
    hombro: 11,
    codo: 13,
    muneca: 15,
    cadera: 23,
    rodilla: 25,
    tobillo: 27,
    talon: 29,
    punta: 31,
  },
  derecha: {
    hombro: 12,
    codo: 14,
    muneca: 16,
    cadera: 24,
    rodilla: 26,
    tobillo: 28,
    talon: 30,
    punta: 32,
  },
} as const

type Par = readonly [number, number]

function segmentosDePierna(lado: Lado): Par[] {
  const p = LADO[lado]
  return [
    [p.cadera, p.rodilla],
    [p.rodilla, p.tobillo],
    [p.tobillo, p.talon],
    [p.talon, p.punta],
    [p.tobillo, p.punta],
  ]
}

function segmentosDelTorso(): Par[] {
  const i = LADO.izquierda
  const d = LADO.derecha
  return [
    [i.hombro, d.hombro],
    [i.cadera, d.cadera],
    [i.hombro, i.cadera],
    [d.hombro, d.cadera],
    [i.hombro, i.codo],
    [i.codo, i.muneca],
    [d.hombro, d.codo],
    [d.codo, d.muneca],
  ]
}

export function dibujarCuadro(
  ctx: CanvasRenderingContext2D,
  imagen: CanvasImageSource,
  ancho: number,
  alto: number,
  pose: readonly PuntoPose[] | null,
  pierna: Lado,
  medidas: Medidas | null,
): void {
  ctx.clearRect(0, 0, ancho, alto)
  ctx.drawImage(imagen, 0, 0, ancho, alto)
  if (!pose) return

  // Todo se dibuja en proporción al lienzo para que se vea igual en un video pequeño o en 4K.
  const escala = Math.max(ancho, alto) / 640
  const en = (indice: number) => {
    const p = pose[indice]
    return p ? { x: p.x * ancho, y: p.y * alto } : null
  }

  const trazar = (pares: Par[], color: string, grosor: number) => {
    ctx.lineCap = 'round'
    // Primero un borde oscuro y encima la línea: así se ve sobre pista clara u oscura.
    for (const [estilo, extra] of [
      [COLOR_BORDE, 2 * escala],
      [color, 0],
    ] as const) {
      ctx.strokeStyle = estilo
      ctx.lineWidth = grosor * escala + extra
      for (const [a, b] of pares) {
        const desde = en(a)
        const hasta = en(b)
        if (!desde || !hasta) continue
        ctx.beginPath()
        ctx.moveTo(desde.x, desde.y)
        ctx.lineTo(hasta.x, hasta.y)
        ctx.stroke()
      }
    }
  }

  const libre = pierna === 'izquierda' ? 'derecha' : 'izquierda'
  trazar(segmentosDelTorso(), COLOR_CUERPO, 2)
  trazar(segmentosDePierna(libre), COLOR_CUERPO, 2.5)
  trazar(segmentosDePierna(pierna), COLOR_APOYO, 3.5)

  const articulaciones = [
    LADO[pierna].cadera,
    LADO[pierna].rodilla,
    LADO[pierna].tobillo,
    LADO[libre].rodilla,
  ]
  for (const indice of articulaciones) {
    const p = en(indice)
    if (!p) continue
    ctx.beginPath()
    ctx.arc(p.x, p.y, 4.5 * escala, 0, Math.PI * 2)
    ctx.fillStyle = indice === LADO[libre].rodilla ? COLOR_CUERPO : COLOR_APOYO
    ctx.fill()
    ctx.lineWidth = 1.5 * escala
    ctx.strokeStyle = COLOR_BORDE
    ctx.stroke()
  }

  if (!medidas) return
  const rotular = (indice: number, grados: number) => {
    const p = en(indice)
    if (!p) return
    const texto = `${Math.round(grados)}°`
    ctx.font = `600 ${13 * escala}px system-ui, sans-serif`
    const anchoTexto = ctx.measureText(texto).width
    const margen = 5 * escala
    const altoCaja = 20 * escala
    // La etiqueta va a la derecha del punto, o a la izquierda si se saldría de la imagen.
    const aLaDerecha = p.x + 12 * escala + anchoTexto + 2 * margen < ancho
    const x = aLaDerecha ? p.x + 12 * escala : p.x - 12 * escala - anchoTexto - 2 * margen
    const y = Math.min(Math.max(p.y - altoCaja / 2, 0), alto - altoCaja)

    ctx.fillStyle = 'rgba(20, 20, 20, 0.85)'
    ctx.beginPath()
    ctx.roundRect(x, y, anchoTexto + 2 * margen, altoCaja, 4 * escala)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.textBaseline = 'middle'
    ctx.fillText(texto, x + margen, y + altoCaja / 2 + escala * 0.5)
  }

  rotular(LADO[pierna].rodilla, medidas.rodillaApoyo)
  rotular(LADO[pierna].cadera, medidas.caderaApoyo)
  rotular(LADO[pierna].tobillo, medidas.tobilloApoyo)
  rotular(LADO[libre].rodilla, medidas.rodillaLibre)
}
