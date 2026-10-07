import { Building2, Download, FilePlus2, Plus, Trash2, User } from 'lucide-react'
import { formatearDinero } from '../../shared/dinero'
import { imprimirConTitulo } from '../../shared/imprimir'
import { Boton, Campo, Tarjeta } from '../../shared/ui'
import { useGuardadoLocal } from '../../shared/useGuardadoLocal'
import { calcularTotales, totalItem } from './calculo'
import {
  CLAVE_GUARDADO,
  cotizacionInicial,
  esCotizacion,
  itemVacio,
  nuevaCotizacion,
  type Cliente,
  type Cotizacion,
  type Empresa,
  type Item,
} from './cotizacion'
import { Documento } from './Documento'
import estilos from './cotizador.module.css'

type CampoSimple = 'numero' | 'fecha' | 'validez' | 'impuesto' | 'notas'
type CampoItem = 'descripcion' | 'cantidad' | 'precio'

export default function Cotizador() {
  // Toda la cotización vive en un solo objeto para guardarla y leerla de una vez.
  const [cotizacion, setCotizacion] = useGuardadoLocal<Cotizacion>(
    CLAVE_GUARDADO,
    cotizacionInicial,
    esCotizacion,
  )
  const { empresa, cliente, items } = cotizacion
  const totales = calcularTotales(items, cotizacion.impuesto)

  const cambiar = (campo: CampoSimple, valor: string) =>
    setCotizacion((prev) => ({ ...prev, [campo]: valor }))

  const cambiarEmpresa = (campo: keyof Empresa, valor: string) =>
    setCotizacion((prev) => ({ ...prev, empresa: { ...prev.empresa, [campo]: valor } }))

  const cambiarCliente = (campo: keyof Cliente, valor: string) =>
    setCotizacion((prev) => ({ ...prev, cliente: { ...prev.cliente, [campo]: valor } }))

  const cambiarItem = (id: Item['id'], campo: CampoItem, valor: string) =>
    setCotizacion((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [campo]: valor } : item)),
    }))

  const agregarItem = () =>
    setCotizacion((prev) => ({ ...prev, items: [...prev.items, itemVacio()] }))

  // Siempre queda al menos una fila: una cotización sin ítems no tiene sentido.
  const quitarItem = (id: Item['id']) =>
    setCotizacion((prev) =>
      prev.items.length > 1 ? { ...prev, items: prev.items.filter((item) => item.id !== id) } : prev,
    )

  const empezarNueva = () => {
    const seguro = window.confirm(
      'Se borran el cliente y los ítems de esta cotización. Los datos de tu empresa se conservan. ¿Empezar una nueva?',
    )
    if (seguro) setCotizacion((prev) => nuevaCotizacion(prev))
  }

  const exportar = () => imprimirConTitulo(cotizacion.numero.trim() || 'Cotización')

  return (
    <>
      <div className={`${estilos.pagina} no-impresion`}>
        <header className={estilos.encabezado}>
          <div>
            <h1 className={estilos.titulo}>Cotizador</h1>
            <p className={estilos.subtitulo}>
              Llena los datos y exporta la cotización. En la ventana de impresión elige «Guardar
              como PDF».
            </p>
          </div>
          <div className={estilos.acciones}>
            <Boton onClick={empezarNueva}>
              <FilePlus2 size={16} aria-hidden /> Nueva
            </Boton>
            <Boton variante="primario" onClick={exportar}>
              <Download size={16} aria-hidden /> Exportar PDF
            </Boton>
          </div>
        </header>

        <div className={estilos.partes}>
          <Tarjeta titulo="Tu empresa" icono={<Building2 size={15} aria-hidden />}>
            <Campo
              etiqueta="Nombre"
              value={empresa.nombre}
              onChange={(e) => cambiarEmpresa('nombre', e.target.value)}
              placeholder="Nombre de tu empresa o el tuyo"
              autoComplete="organization"
            />
            <Campo
              etiqueta="Correo"
              type="email"
              value={empresa.contacto}
              onChange={(e) => cambiarEmpresa('contacto', e.target.value)}
              placeholder="contacto@tuempresa.com"
              autoComplete="email"
            />
            <Campo
              etiqueta="Teléfono"
              type="tel"
              value={empresa.telefono}
              onChange={(e) => cambiarEmpresa('telefono', e.target.value)}
              placeholder="Opcional"
              autoComplete="tel"
            />
          </Tarjeta>

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

        <div className={estilos.datos}>
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

        <Tarjeta className={estilos.items}>
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
                onChange={(e) => cambiarItem(item.id, 'descripcion', e.target.value)}
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
                  onChange={(e) => cambiarItem(item.id, 'cantidad', e.target.value)}
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
                  onChange={(e) => cambiarItem(item.id, 'precio', e.target.value)}
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
          <label className="ui-campo">
            <span className="ui-etiqueta">Notas y condiciones</span>
            <textarea
              className="ui-entrada"
              value={cotizacion.notas}
              onChange={(e) => cambiar('notas', e.target.value)}
            />
          </label>
        </Tarjeta>

        <p className={estilos.aviso}>
          Todo queda guardado en este navegador. Nada se envía a ningún servidor.
        </p>
      </div>

      <div className="solo-impresion">
        <Documento cotizacion={cotizacion} totales={totales} />
      </div>
    </>
  )
}
