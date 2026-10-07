import { FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'
import { descargarTexto, paraNombreDeArchivo } from '../../shared/archivo'
import { aCsv } from '../../shared/csv'
import { GraficoLinea } from '../../shared/graficos'
import { redondear } from '../../shared/numero'
import { Boton, Indicador, Indicadores, Tarjeta } from '../../shared/ui'
import { ANGULOS, type ClaveAngulo, type Medidas } from './angulos'
import estilos from './biomecanica.module.css'
import type { Angulos, Referencia } from './modelo'
import { type Contacto, type Muestra, resumirTramo, rodillaEnElTramo } from './tiempos'

interface Props {
  enApoyo: Medidas | null
  enDespegue: Medidas | null
  contacto: Contacto | null
  /** Lo medido cuadro por cuadro entre el apoyo y el despegue. Vacío si no se ha analizado. */
  muestras: Muestra[]
  referencia: Referencia | null
  nombreDelVideo: string
  alGuardarReferencia: (referencia: Referencia | null) => void
}

/** Siempre con tres decimales: 0,200 s y no 0,2 s, para que se lea como un tiempo medido. */
const segundos = (valor: number) =>
  `${valor.toLocaleString('es-CO', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} s`
const grados = (valor: number) => `${Math.round(valor)}°`

function soloAngulos(medidas: Medidas): Angulos {
  const { confiable: _confiable, ...angulos } = medidas
  return angulos
}

/** "(+4°)" frente al salto de referencia. Vacío si no hay diferencia que mostrar. */
function frenteA(valor: number, referencia: number | undefined): string {
  if (referencia === undefined) return ''
  const diferencia = Math.round(valor) - Math.round(referencia)
  if (diferencia === 0) return 'igual que la referencia'
  return `${diferencia > 0 ? '+' : '−'}${Math.abs(diferencia)}° frente a la referencia`
}

/** Lo que sale de las dos marcas y del análisis del contacto. */
export function Resultados({
  enApoyo,
  enDespegue,
  contacto,
  muestras,
  referencia,
  nombreDelVideo,
  alGuardarReferencia,
}: Props) {
  const [nombre, setNombre] = useState('')
  const tramo = resumirTramo(muestras)
  const rodilla = rodillaEnElTramo(muestras)

  if (!enApoyo && !enDespegue) return null

  const exportarCsv = () => {
    const encabezado = [
      'Tiempo desde el apoyo (s)',
      ...ANGULOS.map((angulo) => `${angulo.nombre} (°)`),
    ]
    const filas = muestras.map((muestra) => [
      redondear(muestra.tiempo, 3),
      ...ANGULOS.map(({ clave }) => redondear(muestra.medidas[clave], 1)),
    ])
    descargarTexto(
      `${paraNombreDeArchivo(nombreDelVideo, 'salto')}-contacto.csv`,
      aCsv([encabezado, ...filas]),
      'text/csv',
    )
  }

  const guardar = () => {
    if (!enApoyo || !enDespegue) return
    alGuardarReferencia({
      nombre: nombre.trim() || nombreDelVideo,
      apoyo: soloAngulos(enApoyo),
      despegue: soloAngulos(enDespegue),
      contacto: contacto?.segundos ?? null,
    })
    setNombre('')
  }

  const celda = (medidas: Medidas | null, clave: ClaveAngulo, deReferencia: Angulos | undefined) =>
    medidas ? (
      <>
        {grados(medidas[clave])}
        {deReferencia && <small>{frenteA(medidas[clave], deReferencia[clave])}</small>}
      </>
    ) : (
      '—'
    )

  return (
    <>
      {(contacto || tramo) && (
        <div aria-live="polite">
          <Indicadores>
            {contacto && (
              <Indicador
                principal
                etiqueta="Tiempo de contacto"
                valor={segundos(contacto.segundos)}
                detalle={
                  <>
                    Puede variar ± {segundos(contacto.margen)}: un cuadro del video.
                    {referencia?.contacto != null &&
                      ` Referencia: ${segundos(referencia.contacto)}.`}
                  </>
                }
              />
            )}
            {tramo && (
              <>
                <Indicador
                  etiqueta="Flexión máxima de la rodilla"
                  valor={grados(tramo.flexionMaxima.angulo)}
                  detalle={`A los ${segundos(tramo.flexionMaxima.tiempo)} del apoyo.`}
                />
                <Indicador
                  etiqueta="Cuánto se dobló"
                  valor={grados(tramo.amortiguacion)}
                  detalle="Del apoyo a la flexión máxima."
                />
                <Indicador
                  etiqueta="Cuánto se extendió"
                  valor={grados(tramo.extension)}
                  detalle="De la flexión máxima al despegue."
                />
              </>
            )}
          </Indicadores>
        </div>
      )}

      {muestras.length > 1 && (
        <Tarjeta
          titulo="Rodilla de despegue durante el contacto"
          accion={
            <Boton onClick={exportarCsv}>
              <FileSpreadsheet size={16} aria-hidden /> Datos (CSV)
            </Boton>
          }
        >
          <GraficoLinea
            titulo="Ángulo de la rodilla de despegue desde el apoyo hasta el despegue"
            medida="Ángulo"
            formato={grados}
            puntos={muestras.map((muestra, i) => ({
              x: muestra.tiempo,
              etiqueta: segundos(muestra.tiempo),
              valor: Math.round(rodilla[i] ?? muestra.medidas.rodillaApoyo),
              destacado: tramo !== null && muestra.tiempo === tramo.flexionMaxima.tiempo,
            }))}
          />
          <p className={estilos.pista}>
            El detector puede equivocarse unos grados de un cuadro a otro. Fíjate en la forma de la
            curva y en diferencias grandes, no en dos o tres grados.
          </p>
        </Tarjeta>
      )}

      <Tarjeta titulo="Apoyo y despegue">
        <div className={estilos.tablaContenedor}>
          <table className={estilos.tabla}>
            <thead>
              <tr>
                <th scope="col">Ángulo</th>
                <th scope="col">En el apoyo</th>
                <th scope="col">En el despegue</th>
                <th scope="col">Cambio</th>
              </tr>
            </thead>
            <tbody>
              {ANGULOS.map(({ clave, nombre: nombreAngulo }) => (
                <tr key={clave}>
                  <th scope="row">{nombreAngulo}</th>
                  <td>{celda(enApoyo, clave, referencia?.apoyo)}</td>
                  <td>{celda(enDespegue, clave, referencia?.despegue)}</td>
                  <td>
                    {enApoyo && enDespegue
                      ? `${Math.round(enDespegue[clave]) - Math.round(enApoyo[clave]) >= 0 ? '+' : '−'}${Math.abs(Math.round(enDespegue[clave]) - Math.round(enApoyo[clave]))}°`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={estilos.referencia}>
          {referencia ? (
            <p>
              Comparando con <strong>{referencia.nombre}</strong>.{' '}
              <button type="button" className="ui-enlace" onClick={() => alGuardarReferencia(null)}>
                Quitar la referencia
              </button>
            </p>
          ) : (
            <p>Guarda tu mejor salto como referencia y los siguientes se comparan contra él.</p>
          )}
          <div className={estilos.guardar}>
            <input
              className="ui-entrada"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={`Ej.: 2,06 del Nacional (${nombreDelVideo})`}
              aria-label="Nombre para el salto de referencia"
            />
            <Boton onClick={guardar} disabled={!enApoyo || !enDespegue}>
              {referencia
                ? 'Reemplazar la referencia con este salto'
                : 'Guardar este salto como referencia'}
            </Boton>
          </div>
        </div>
      </Tarjeta>
    </>
  )
}
