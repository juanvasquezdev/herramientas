import { Membrete } from '../../shared/documento'
import { aMilisegundos, formatearFecha, formatearFechaCorta, hoyISO } from '../../shared/fecha'
import { GraficoLinea } from '../../shared/graficos'
import { formatearMarca } from './marca'
import type { Bitacora } from './modelo'
import type { Prueba } from './pruebas'
import { type Resumen, textoDeCambio } from './resumen'

interface Props {
  bitacora: Bitacora
  prueba: Prueba
  resumen: Resumen
}

/** El reporte de una prueba como sale en el papel o en el PDF. */
export function Documento({ bitacora, prueba, resumen }: Props) {
  const formato = (valor: number) => formatearMarca(valor, prueba.unidad)
  const cambio = textoDeCambio(resumen, prueba)

  return (
    <article className="doc">
      <Membrete
        marca={bitacora.atleta || 'Atleta'}
        detalle={[prueba.nombre, bitacora.entrenador && `Entrenador: ${bitacora.entrenador}`]
          .filter(Boolean)
          .join(' · ')}
        tipo="REPORTE DE MARCAS"
        renglones={[`Generado el ${formatearFecha(hoyISO())}`, `${resumen.marcas.length} marcas`]}
      />

      {resumen.mejor && resumen.ultima && (
        <div className="doc-cifras">
          <div className="doc-cifra">
            <strong>{formato(resumen.mejor.valor)}</strong>
            <span>Mejor marca</span>
          </div>
          <div className="doc-cifra">
            <strong>{formato(resumen.ultima.valor)}</strong>
            <span>Última marca</span>
          </div>
          {cambio && (
            <div className="doc-cifra">
              <strong>{cambio.valor}</strong>
              <span>{cambio.detalle}</span>
            </div>
          )}
        </div>
      )}

      {resumen.marcas.length > 1 && (
        <GraficoLinea
          titulo={`Marcas de ${prueba.nombre} en el tiempo`}
          medida="Marca"
          formato={formato}
          anchoFijo={640}
          alto={150}
          puntos={resumen.marcas.map((marca) => ({
            x: aMilisegundos(marca.fecha),
            etiqueta: formatearFechaCorta(marca.fecha),
            valor: marca.valor,
            destacado: marca.id === resumen.mejor?.id,
          }))}
        />
      )}

      <table className="doc-tabla">
        <thead>
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col" className="doc-num">
              Marca
            </th>
            <th scope="col">Competencia, lugar o nota</th>
          </tr>
        </thead>
        <tbody>
          {resumen.marcas.map((marca) => (
            <tr key={marca.id}>
              <td>{formatearFechaCorta(marca.fecha)}</td>
              <td className="doc-num">
                {marca.id === resumen.mejor?.id ? (
                  <strong>{formato(marca.valor)} (mejor)</strong>
                ) : (
                  formato(marca.valor)
                )}
              </td>
              <td>{marca.lugar || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  )
}
