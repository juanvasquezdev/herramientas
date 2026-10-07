import { almacenDelNavegador } from './almacen'
import { CLAVE_PERFIL, esPerfil, perfilDeArranque } from './perfil'
import { useGuardadoLocal } from './useGuardadoLocal'

/** Los datos de "tu empresa", compartidos entre el cotizador y la propuesta. */
export function usePerfil() {
  return useGuardadoLocal(CLAVE_PERFIL, () => perfilDeArranque(almacenDelNavegador()), esPerfil)
}
