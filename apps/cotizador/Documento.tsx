import { formatearDinero } from '../../shared/dinero'
import { Membrete } from '../../shared/documento'
import { formatearFecha } from '../../shared/fecha'
import type { Perfil } from '../../shared/perfil'
import { precioUnitario, type Totales, totalItem } from './calculo'
import type { Cotizacion } from './cotizacion'

interface Props {
  perfil: Perfil
  cotizacion: Cotizacion
  totales: Totales
}

/** La cotización como sale en el papel o en el PDF. En pantalla está oculta. */
export function Documento({ perfil, cotizacion, totales }: Props) {
  const { cliente, items } = cotizacion
  const contacto = [perfil.correo, perfil.telefono].filter(Boolean).join(' · ')

  return (
    <article className="doc">
      <Membrete
        marca={perfil.nombre || 'Tu empresa'}
        detalle={contacto}
        tipo="COTIZACIÓN"
        renglones={[
          cotizacion.numero,
          `Fecha: ${formatearFecha(cotizacion.fecha)}`,
          cotizacion.validez && `Válida por ${cotizacion.validez} días`,
        ]}
      />

      <section className="doc-bloque">
        <p className="doc-suave">Cliente</p>
        <p className="doc-fuerte">{cliente.nombre || '—'}</p>
        {cliente.empresa && <p>{cliente.empresa}</p>}
        {cliente.email && <p className="doc-suave">{cliente.email}</p>}
      </section>

      <table className="doc-tabla">
        <thead>
          <tr>
            <th scope="col">Descripción</th>
            <th scope="col" className="doc-num">
              Cant.
            </th>
            <th scope="col" className="doc-num">
              Precio
            </th>
            <th scope="col" className="doc-num">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.descripcion || '—'}</td>
              <td className="doc-num">{item.cantidad || '0'}</td>
              <td className="doc-num">{formatearDinero(precioUnitario(item))}</td>
              <td className="doc-num">{formatearDinero(totalItem(item))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="doc-totales">
        <div>
          <dt>Subtotal</dt>
          <dd>{formatearDinero(totales.subtotal)}</dd>
        </div>
        <div>
          <dt>Impuesto ({cotizacion.impuesto || '0'} %)</dt>
          <dd>{formatearDinero(totales.impuesto)}</dd>
        </div>
        <div className="doc-gran-total">
          <dt>Total</dt>
          <dd>{formatearDinero(totales.total)}</dd>
        </div>
      </dl>

      {cotizacion.notas && (
        <p className="doc-notas">
          <strong>Notas:</strong> {cotizacion.notas}
        </p>
      )}
    </article>
  )
}
