import { Building2 } from 'lucide-react'
import type { Perfil } from './perfil'
import { Campo, Tarjeta } from './ui'

interface Props {
  perfil: Perfil
  alCambiar: (perfil: Perfil) => void
}

/** Los datos de quien cotiza o propone. Se llenan una vez y sirven en varias herramientas. */
export function TarjetaPerfil({ perfil, alCambiar }: Props) {
  return (
    <Tarjeta titulo="Tu empresa" icono={<Building2 size={15} aria-hidden />}>
      <Campo
        etiqueta="Nombre"
        value={perfil.nombre}
        onChange={(e) => alCambiar({ ...perfil, nombre: e.target.value })}
        placeholder="Nombre de tu empresa o el tuyo"
        autoComplete="organization"
      />
      <Campo
        etiqueta="Correo"
        type="email"
        value={perfil.correo}
        onChange={(e) => alCambiar({ ...perfil, correo: e.target.value })}
        placeholder="contacto@tuempresa.com"
        autoComplete="email"
      />
      <Campo
        etiqueta="Teléfono"
        type="tel"
        value={perfil.telefono}
        onChange={(e) => alCambiar({ ...perfil, telefono: e.target.value })}
        placeholder="Opcional"
        autoComplete="tel"
      />
    </Tarjeta>
  )
}
