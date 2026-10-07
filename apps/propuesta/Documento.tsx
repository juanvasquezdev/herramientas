import { formatearDinero } from '../../shared/dinero'
import { Membrete } from '../../shared/documento'
import { formatearFecha } from '../../shared/fecha'
import { aPositivo, formatearNumero } from '../../shared/numero'
import type { Perfil } from '../../shared/perfil'
import type { Propuesta } from './modelo'

interface Props {
  perfil: Perfil
  propuesta: Propuesta
  total: number
  /** El valor de cada pago, en el mismo orden que propuesta.pagos. */
  valores: number[]
}

/** La propuesta como sale en el papel o en el PDF. En pantalla está oculta. */
export function Documento({ perfil, propuesta, total, valores }: Props) {
  const { cliente } = propuesta
  const emisor = perfil.nombre || 'Tu empresa'
  const contacto = [perfil.correo, perfil.telefono].filter(Boolean).join(' · ')
  const entregables = propuesta.entregables.filter((e) => e.descripcion.trim() || e.plazo.trim())

  return (
    <article className="doc">
      <Membrete
        marca={emisor}
        detalle={contacto}
        tipo="PROPUESTA DE SERVICIOS"
        renglones={[
          propuesta.numero,
          `Fecha: ${formatearFecha(propuesta.fecha)}`,
          propuesta.validez && `Válida por ${propuesta.validez} días`,
        ]}
      />

      <section className="doc-bloque">
        <p className="doc-suave">Para</p>
        <p className="doc-fuerte">{cliente.nombre || '—'}</p>
        {cliente.empresa && <p>{cliente.empresa}</p>}
      </section>

      {propuesta.proyecto && <p className="doc-fuerte">{propuesta.proyecto}</p>}

      <h2 className="doc-seccion">Alcance</h2>
      <p className="doc-parrafo">{propuesta.alcance || '—'}</p>

      {entregables.length > 0 && (
        <>
          <h2 className="doc-seccion">Entregables</h2>
          <table className="doc-tabla">
            <thead>
              <tr>
                <th scope="col">Entregable</th>
                <th scope="col" className="doc-num">
                  Plazo
                </th>
              </tr>
            </thead>
            <tbody>
              {entregables.map((entregable) => (
                <tr key={entregable.id}>
                  <td>{entregable.descripcion || '—'}</td>
                  <td className="doc-num">{entregable.plazo || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h2 className="doc-seccion">Valor y forma de pago</h2>
      <table className="doc-tabla">
        <thead>
          <tr>
            <th scope="col">Pago</th>
            <th scope="col" className="doc-num">
              %
            </th>
            <th scope="col" className="doc-num">
              Valor
            </th>
          </tr>
        </thead>
        <tbody>
          {propuesta.pagos.map((pago, indice) => (
            <tr key={pago.id}>
              <td>{pago.concepto || '—'}</td>
              <td className="doc-num">{formatearNumero(aPositivo(pago.porcentaje))} %</td>
              <td className="doc-num">{formatearDinero(valores[indice] ?? 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="doc-totales">
        <div className="doc-gran-total">
          <dt>Valor total</dt>
          <dd>{formatearDinero(total)}</dd>
        </div>
      </dl>

      {propuesta.condiciones.trim() && (
        <>
          <h2 className="doc-seccion">Condiciones</h2>
          <p className="doc-parrafo">{propuesta.condiciones}</p>
        </>
      )}

      <div className="doc-firmas">
        <div className="doc-firma">
          <p className="doc-fuerte">{emisor}</p>
          <p className="doc-suave">Firma y fecha</p>
        </div>
        <div className="doc-firma">
          <p className="doc-fuerte">{cliente.nombre || 'Cliente'}</p>
          <p className="doc-suave">Acepto la propuesta. Firma y fecha</p>
        </div>
      </div>
    </article>
  )
}
