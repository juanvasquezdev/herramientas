import './documento.css'

interface Props {
  /** Quién emite el documento: la empresa o el atleta. Va grande a la izquierda. */
  marca: string
  /** Una línea bajo la marca: correo y teléfono, o disciplina y entrenador. */
  detalle?: string
  /** COTIZACIÓN, PROPUESTA DE SERVICIOS, REPORTE... */
  tipo: string
  /** Renglones bajo el tipo: número, fecha, validez. Los vacíos se omiten. */
  renglones: Array<string | false | undefined>
}

/** El encabezado que comparten todos los documentos que se imprimen. */
export function Membrete({ marca, detalle, tipo, renglones }: Props) {
  return (
    <header className="doc-encabezado">
      <div>
        <p className="doc-marca">{marca}</p>
        {detalle && <p className="doc-suave">{detalle}</p>}
      </div>
      <div className="doc-derecha">
        <p className="doc-tipo">{tipo}</p>
        {renglones.filter(Boolean).map((renglon) => (
          <p key={String(renglon)} className="doc-suave">
            {renglon}
          </p>
        ))}
      </div>
    </header>
  )
}
