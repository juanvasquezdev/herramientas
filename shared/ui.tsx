import { AlertTriangle, CircleAlert, Info } from 'lucide-react'
import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  useId,
} from 'react'

/** Une nombres de clase y descarta los vacíos. */
export function unir(...clases: Array<string | false | undefined>): string {
  return clases.filter(Boolean).join(' ')
}

/* ---------- Estructura de la página ---------- */

interface PaginaProps {
  /** "ancha" para herramientas con tablas de muchas columnas o video. */
  ancho?: 'normal' | 'ancha'
  className?: string
  children: ReactNode
}

/** El contenedor de cada herramienta. No sale en la impresión: para eso está el documento. */
export function Pagina({ ancho = 'normal', className, children }: PaginaProps) {
  return (
    <div
      className={unir(
        'ui-pagina',
        ancho === 'ancha' && 'ui-pagina-ancha',
        'no-impresion',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface EncabezadoProps {
  titulo: string
  descripcion: string
  /** Botones de la derecha (exportar, nueva, etc.). */
  children?: ReactNode
}

export function Encabezado({ titulo, descripcion, children }: EncabezadoProps) {
  return (
    <header className="ui-encabezado">
      <div>
        <h1 className="ui-titulo">{titulo}</h1>
        <p className="ui-descripcion">{descripcion}</p>
      </div>
      {children && <div className="ui-acciones">{children}</div>}
    </header>
  )
}

interface TarjetaProps {
  titulo?: string
  icono?: ReactNode
  /** Algo pequeño a la derecha del título: un botón o un dato. */
  accion?: ReactNode
  className?: string
  children: ReactNode
}

/** Caja blanca con borde. Es el contenedor base de todas las herramientas. */
export function Tarjeta({ titulo, icono, accion, className, children }: TarjetaProps) {
  return (
    <section className={unir('ui-tarjeta', className)}>
      {titulo && (
        <div className="ui-tarjeta-cabecera">
          <h2 className="ui-tarjeta-titulo">
            {icono}
            {titulo}
          </h2>
          {accion}
        </div>
      )}
      {children}
    </section>
  )
}

/* ---------- Campos ---------- */

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string
  /** Texto corto debajo del campo. */
  ayuda?: string
}

/**
 * Un input con su etiqueta visible. El <label> lo envuelve, así no hace falta id.
 * La ayuda va fuera del label y se enlaza con aria-describedby: así el lector de pantalla
 * dice primero el nombre corto del campo y después la explicación.
 */
export function Campo({ etiqueta, ayuda, className, ...props }: CampoProps) {
  const idAyuda = useId()
  return (
    <div className={unir('ui-campo', className)}>
      <label>
        <span className="ui-etiqueta">{etiqueta}</span>
        <input className="ui-entrada" aria-describedby={ayuda ? idAyuda : undefined} {...props} />
      </label>
      {ayuda && (
        <span id={idAyuda} className="ui-ayuda">
          {ayuda}
        </span>
      )}
    </div>
  )
}

interface CampoAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  etiqueta: string
}

export function CampoArea({ etiqueta, className, ...props }: CampoAreaProps) {
  return (
    <label className={unir('ui-campo', className)}>
      <span className="ui-etiqueta">{etiqueta}</span>
      <textarea className="ui-entrada" {...props} />
    </label>
  )
}

interface CampoSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta: string
  children: ReactNode
}

export function CampoSelect({ etiqueta, className, children, ...props }: CampoSelectProps) {
  return (
    <label className={unir('ui-campo', className)}>
      <span className="ui-etiqueta">{etiqueta}</span>
      <select className="ui-entrada" {...props}>
        {children}
      </select>
    </label>
  )
}

interface SegmentosProps<T extends string> {
  /** Lo que lee un lector de pantalla para todo el grupo. */
  etiqueta: string
  opciones: ReadonlyArray<{ valor: T; texto: string }>
  valor: T
  alCambiar: (valor: T) => void
  /** Debe ser único en la página: agrupa los radios. */
  nombre: string
}

/** Elegir una entre pocas opciones. Por dentro son radios, así funciona con teclado. */
export function Segmentos<T extends string>({
  etiqueta,
  opciones,
  valor,
  alCambiar,
  nombre,
}: SegmentosProps<T>) {
  return (
    <fieldset className="ui-segmentos">
      <legend className="ui-oculto">{etiqueta}</legend>
      {opciones.map((opcion) => (
        <label key={opcion.valor} className="ui-segmento">
          <input
            type="radio"
            name={nombre}
            value={opcion.valor}
            checked={valor === opcion.valor}
            onChange={() => alCambiar(opcion.valor)}
          />
          <span>{opcion.texto}</span>
        </label>
      ))}
    </fieldset>
  )
}

/* ---------- Botones ---------- */

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * primario: la acción principal de la pantalla. secundario: las demás.
   * punteado: agregar una fila. icono: quitar (rojo). plano: ícono neutro.
   */
  variante?: 'primario' | 'secundario' | 'punteado' | 'icono' | 'plano'
}

export function Boton({
  variante = 'secundario',
  className,
  type = 'button',
  ...props
}: BotonProps) {
  return (
    <button
      type={type}
      className={unir('ui-boton', `ui-boton-${variante}`, className)}
      {...props}
    />
  )
}

/* ---------- Datos y avisos ---------- */

interface IndicadorProps {
  etiqueta: string
  valor: ReactNode
  /** Una línea de contexto debajo del valor. */
  detalle?: ReactNode
  tono?: 'neutro' | 'bien' | 'mal'
  /** Para el dato principal de la pantalla: sale más grande. */
  principal?: boolean
}

/** Un número con su nombre. Para los resultados que la persona vino a buscar. */
export function Indicador({
  etiqueta,
  valor,
  detalle,
  tono = 'neutro',
  principal,
}: IndicadorProps) {
  return (
    <div className={unir('ui-indicador', `ui-tono-${tono}`, principal && 'ui-indicador-principal')}>
      <span className="ui-indicador-etiqueta">{etiqueta}</span>
      <span className="ui-indicador-valor">{valor}</span>
      {detalle && <span className="ui-indicador-detalle">{detalle}</span>}
    </div>
  )
}

/** Fila de indicadores que se acomoda sola según el ancho. */
export function Indicadores({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={unir('ui-indicadores', className)}>{children}</div>
}

interface AvisoProps {
  tono?: 'info' | 'alerta' | 'error'
  children: ReactNode
}

const ICONO_AVISO = { info: Info, alerta: AlertTriangle, error: CircleAlert }

/** Mensaje destacado. Lleva ícono además del color, para no depender solo del color. */
export function Aviso({ tono = 'info', children }: AvisoProps) {
  const Icono = ICONO_AVISO[tono]
  return (
    <div className={unir('ui-aviso', `ui-aviso-${tono}`)} role={tono === 'info' ? 'note' : 'alert'}>
      <Icono size={17} aria-hidden />
      <div>{children}</div>
    </div>
  )
}
