import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

/** Une nombres de clase y descarta los vacíos. */
function unir(...clases: Array<string | false | undefined>): string {
  return clases.filter(Boolean).join(' ')
}

interface TarjetaProps {
  titulo?: string
  icono?: ReactNode
  className?: string
  children: ReactNode
}

/** Caja blanca con borde. Es el contenedor base de todas las herramientas. */
export function Tarjeta({ titulo, icono, className, children }: TarjetaProps) {
  return (
    <section className={unir('ui-tarjeta', className)}>
      {titulo && (
        <h2 className="ui-tarjeta-titulo">
          {icono}
          {titulo}
        </h2>
      )}
      {children}
    </section>
  )
}

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string
}

/** Un input con su etiqueta visible. El <label> lo envuelve, así no hace falta id. */
export function Campo({ etiqueta, className, ...props }: CampoProps) {
  return (
    <label className={unir('ui-campo', className)}>
      <span className="ui-etiqueta">{etiqueta}</span>
      <input className="ui-entrada" {...props} />
    </label>
  )
}

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'punteado' | 'icono'
}

export function Boton({ variante = 'secundario', className, type = 'button', ...props }: BotonProps) {
  return (
    <button type={type} className={unir('ui-boton', `ui-boton-${variante}`, className)} {...props} />
  )
}
