import { formatearDinero } from '../../shared/dinero'
import { formatearFecha } from '../../shared/fecha'
import { precioUnitario, totalItem, type Totales } from './calculo'
import type { Cotizacion } from './cotizacion'
import estilos from './documento.module.css'

interface Props {
  cotizacion: Cotizacion
  totales: Totales
}

/** La cotización como sale en el papel o en el PDF. En pantalla está oculta. */
export function Documento({ cotizacion, totales }: Props) {
  const { empresa, cliente, items } = cotizacion
  const contacto = [empresa.contacto, empresa.telefono].filter(Boolean).join(' · ')

  return (
    <article className={estilos.documento}>
      <header className={estilos.encabezado}>
        <div>
          <p className={estilos.empresa}>{empresa.nombre || 'Tu empresa'}</p>
          {contacto && <p className={estilos.suave}>{contacto}</p>}
        </div>
        <div className={estilos.derecha}>
          <p className={estilos.tipo}>COTIZACIÓN</p>
          <p className={estilos.suave}>{cotizacion.numero}</p>
          <p className={estilos.suave}>Fecha: {formatearFecha(cotizacion.fecha)}</p>
          {cotizacion.validez && (
            <p className={estilos.suave}>Válida por {cotizacion.validez} días</p>
          )}
        </div>
      </header>

      <section className={estilos.cliente}>
        <p className={estilos.suave}>Cliente</p>
        <p className={estilos.fuerte}>{cliente.nombre || '—'}</p>
        {cliente.empresa && <p>{cliente.empresa}</p>}
        {cliente.email && <p className={estilos.suave}>{cliente.email}</p>}
      </section>

      <table className={estilos.tabla}>
        <thead>
          <tr>
            <th scope="col">Descripción</th>
            <th scope="col" className={estilos.numero}>
              Cant.
            </th>
            <th scope="col" className={estilos.numero}>
              Precio
            </th>
            <th scope="col" className={estilos.numero}>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.descripcion || '—'}</td>
              <td className={estilos.numero}>{item.cantidad || '0'}</td>
              <td className={estilos.numero}>{formatearDinero(precioUnitario(item))}</td>
              <td className={estilos.numero}>{formatearDinero(totalItem(item))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className={estilos.totales}>
        <div>
          <dt>Subtotal</dt>
          <dd>{formatearDinero(totales.subtotal)}</dd>
        </div>
        <div>
          <dt>Impuesto ({cotizacion.impuesto || '0'} %)</dt>
          <dd>{formatearDinero(totales.impuesto)}</dd>
        </div>
        <div className={estilos.granTotal}>
          <dt>Total</dt>
          <dd>{formatearDinero(totales.total)}</dd>
        </div>
      </dl>

      {cotizacion.notas && (
        <p className={estilos.notas}>
          <strong>Notas:</strong> {cotizacion.notas}
        </p>
      )}
    </article>
  )
}
