import { Download, FilePlus2, Plus, Trash2, User } from 'lucide-react'
import { almacenDelNavegador } from '../../shared/almacen'
import { formatearDinero } from '../../shared/dinero'
import { imprimirConTitulo } from '../../shared/imprimir'
import { cambiarEnLista, quitarDeLista } from '../../shared/lista'
import { Respaldo } from '../../shared/Respaldo'
import { TarjetaPerfil } from '../../shared/TarjetaPerfil'
import { Boton, Campo, CampoArea, Encabezado, Pagina, Tarjeta } from '../../shared/ui'
import { useGuardadoLocal } from '../../shared/useGuardadoLocal'
import { usePerfil } from '../../shared/usePerfil'
import { calcularTotales, totalItem } from './calculo'
import {
  CLAVE_GUARDADO,
  type Cliente,
  type Cotizacion,
  cotizacionDeArranque,
  esCotizacion,
  type Item,
  itemVacio,
  nuevaCotizacion,
} from './cotizacion'
import estilos from './cotizador.module.css'
import { Documento } from './Documento'

type CampoSimple = 'numero' | 'fecha' | 'validez' | 'impuesto' | 'notas'

export default function Cotizador() {
  const [perfil, setPerfil] = usePerfil()
  // Toda la cotización vive en un solo objeto para guardarla y leerla de una vez.
  const [cotizacion, setCotizacion] = useGuardadoLocal<Cotizacion>(
    CLAVE_GUARDADO,
    () => cotizacionDeArranque(almacenDelNavegador()),
    esCotizacion,
  )
  const { cliente, items } = cotizacion
  const totales = calcularTotales(items, cotizacion.impuesto)

  const cambiar = (campo: CampoSimple, valor: string) =>
    setCotizacion((prev) => ({ ...prev, [campo]: valor }))

  const cambiarCliente = (campo: keyof Cliente, valor: string) =>
    setCotizacion((prev) => ({ ...prev, cliente: { ...prev.cliente, [campo]: valor } }))

  const cambiarItem = (id: string, cambios: Partial<Item>) =>
    setCotizacion((prev) => ({ ...prev, items: cambiarEnLista(prev.items, id, cambios) }))

  const agregarItem = () =>
    setCotizacion((prev) => ({ ...prev, items: [...prev.items, itemVacio()] }))

  // Siempre queda al menos una fila: una cotización sin ítems no tiene sentido.
  const quitarItem = (id: string) =>
    setCotizacion((prev) => ({ ...prev, items: quitarDeLista(prev.items, id) }))

  const empezarNueva = () => {
    const seguro = window.confirm(
      'Se borran el cliente y los ítems de esta cotización. Los datos de tu empresa se conservan. ¿Empezar una nueva?',
    )
    if (seguro) setCotizacion((prev) => nuevaCotizacion(prev))
  }

  const exportar = () => imprimirConTitulo(cotizacion.numero.trim() || 'Cotización')

  return (
    <>
      <Pagina>
        <Encabezado
          titulo="Cotizador"
          descripcion="Llena los datos y exporta la cotización. En la ventana de impresión elige «Guardar como PDF»."
        >
          <Boton onClick={empezarNueva}>
            <FilePlus2 size={16} aria-hidden /> Nueva
          </Boton>
          <Boton variante="primario" onClick={exportar}>
            <Download size={16} aria-hidden /> Exportar PDF
          </Boton>
        </Encabezado>

        <div className="ui-columnas">
          <TarjetaPerfil perfil={perfil} alCambiar={setPerfil} />

          <Tarjeta titulo="Cliente" icono={<User size={15} aria-hidden />}>
            <Campo
              etiqueta="Nombre"
              value={cliente.nombre}
              onChange={(e) => cambiarCliente('nombre', e.target.value)}
              placeholder="A quién va dirigida"
              autoComplete="off"
            />
            <Campo
              etiqueta="Empresa"
              value={cliente.empresa}
              onChange={(e) => cambiarCliente('empresa', e.target.value)}
              placeholder="Opcional"
              autoComplete="off"
            />
            <Campo
              etiqueta="Correo"
              type="email"
              value={cliente.email}
              onChange={(e) => cambiarCliente('email', e.target.value)}
              placeholder="Opcional"
              autoComplete="off"
            />
          </Tarjeta>
        </div>

        <div className="ui-columnas-3">
          <Campo
            etiqueta="Número"
            value={cotizacion.numero}
            onChange={(e) => cambiar('numero', e.target.value)}
          />
          <Campo
            etiqueta="Fecha"
            type="date"
            value={cotizacion.fecha}
            onChange={(e) => cambiar('fecha', e.target.value)}
          />
          <Campo
            etiqueta="Validez (días)"
            type="number"
            min="0"
            inputMode="numeric"
            value={cotizacion.validez}
            onChange={(e) => cambiar('validez', e.target.value)}
          />
        </div>

        <Tarjeta>
          <div className={estilos.cabecera} aria-hidden>
            <span>Descripción</span>
            <span>Cant.</span>
            <span>Precio</span>
            <span className={estilos.derecha}>Total</span>
            <span />
          </div>

          {items.map((item, indice) => (
            <div key={item.id} className={estilos.fila}>
              <input
                className={`ui-entrada ${estilos.descripcion}`}
                value={item.descripcion}
                onChange={(e) => cambiarItem(item.id, { descripcion: e.target.value })}
                placeholder="Servicio o producto"
                aria-label={`Descripción del ítem ${indice + 1}`}
              />
              {/* En celular la cabecera de la tabla se oculta y cada número muestra su rótulo. */}
              <div className={estilos.cantidad}>
                <span className={estilos.rotulo} aria-hidden>
                  Cant.
                </span>
                <input
                  className="ui-entrada"
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={item.cantidad}
                  onChange={(e) => cambiarItem(item.id, { cantidad: e.target.value })}
                  aria-label={`Cantidad del ítem ${indice + 1}`}
                />
              </div>
              <div className={estilos.precio}>
                <span className={estilos.rotulo} aria-hidden>
                  Precio
                </span>
                <input
                  className="ui-entrada"
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={item.precio}
                  onChange={(e) => cambiarItem(item.id, { precio: e.target.value })}
                  placeholder="0"
                  aria-label={`Precio del ítem ${indice + 1}`}
                />
              </div>
              <output className={estilos.totalFila}>{formatearDinero(totalItem(item))}</output>
              <Boton
                variante="icono"
                className={estilos.quitar}
                onClick={() => quitarItem(item.id)}
                disabled={items.length === 1}
                aria-label={`Quitar el ítem ${indice + 1}`}
              >
                <Trash2 size={16} aria-hidden />
              </Boton>
            </div>
          ))}

          <Boton variante="punteado" onClick={agregarItem}>
            <Plus size={14} aria-hidden /> Agregar ítem
          </Boton>

          <dl className={estilos.totales}>
            <div>
              <dt>Subtotal</dt>
              <dd>{formatearDinero(totales.subtotal)}</dd>
            </div>
            <div>
              <dt>
                <label htmlFor="cotizador-impuesto">Impuesto (%)</label>
              </dt>
              <dd>
                <input
                  id="cotizador-impuesto"
                  className={`ui-entrada ${estilos.impuesto}`}
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={cotizacion.impuesto}
                  onChange={(e) => cambiar('impuesto', e.target.value)}
                />
              </dd>
            </div>
            <div>
              <dt>Valor del impuesto</dt>
              <dd>{formatearDinero(totales.impuesto)}</dd>
            </div>
            <div className={estilos.granTotal}>
              <dt>Total</dt>
              <dd>{formatearDinero(totales.total)}</dd>
            </div>
          </dl>
        </Tarjeta>

        <Tarjeta>
          <CampoArea
            etiqueta="Notas y condiciones"
            value={cotizacion.notas}
            onChange={(e) => cambiar('notas', e.target.value)}
          />
        </Tarjeta>

        <Respaldo
          herramienta="cotizador"
          datos={cotizacion}
          esValido={esCotizacion}
          alCargar={setCotizacion}
        />
      </Pagina>

      <div className="solo-impresion">
        <Documento perfil={perfil} cotizacion={cotizacion} totales={totales} />
      </div>
    </>
  )
}
