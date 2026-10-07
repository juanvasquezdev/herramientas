import { Download, FilePlus2, Plus, Trash2, User } from 'lucide-react'
import { paraNombreDeArchivo } from '../../shared/archivo'
import { formatearDinero } from '../../shared/dinero'
import { imprimirConTitulo } from '../../shared/imprimir'
import { cambiarEnLista, quitarDeLista } from '../../shared/lista'
import { aPositivo, formatearNumero } from '../../shared/numero'
import { Respaldo } from '../../shared/Respaldo'
import { TarjetaPerfil } from '../../shared/TarjetaPerfil'
import { Aviso, Boton, Campo, CampoArea, Encabezado, Pagina, Tarjeta } from '../../shared/ui'
import { useGuardadoLocal } from '../../shared/useGuardadoLocal'
import { usePerfil } from '../../shared/usePerfil'
import { repartirPagos, sumaDePorcentajes } from './calculo'
import { Documento } from './Documento'
import {
  CLAVE_GUARDADO,
  type Propuesta as DatosPropuesta,
  type Entregable,
  entregableVacio,
  esPropuesta,
  nuevaPropuesta,
  type Pago,
  pagoVacio,
  propuestaInicial,
} from './modelo'
import estilos from './propuesta.module.css'

export default function Propuesta() {
  const [perfil, setPerfil] = usePerfil()
  const [propuesta, setPropuesta] = useGuardadoLocal<DatosPropuesta>(
    CLAVE_GUARDADO,
    propuestaInicial,
    esPropuesta,
  )
  const { cliente, entregables, pagos } = propuesta

  const total = aPositivo(propuesta.presupuesto)
  const valores = repartirPagos(total, pagos)
  const suma = sumaDePorcentajes(pagos)

  const cambiar = (cambios: Partial<DatosPropuesta>) =>
    setPropuesta((prev) => ({ ...prev, ...cambios }))
  const cambiarEntregable = (id: string, cambios: Partial<Entregable>) =>
    cambiar({ entregables: cambiarEnLista(entregables, id, cambios) })
  const cambiarPago = (id: string, cambios: Partial<Pago>) =>
    cambiar({ pagos: cambiarEnLista(pagos, id, cambios) })

  const empezarNueva = () => {
    const seguro = window.confirm(
      'Se borran el cliente, el proyecto y los entregables. La forma de pago y las condiciones se conservan. ¿Empezar una nueva?',
    )
    if (seguro) setPropuesta((prev) => nuevaPropuesta(prev))
  }

  const exportar = () =>
    imprimirConTitulo(
      `${propuesta.numero.trim() || 'Propuesta'} ${paraNombreDeArchivo(propuesta.proyecto, '')}`.trim(),
    )

  return (
    <>
      <Pagina>
        <Encabezado
          titulo="Propuesta de servicios"
          descripcion="Alcance, entregables, valor y forma de pago en un documento listo para enviar y firmar."
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
              onChange={(e) => cambiar({ cliente: { ...cliente, nombre: e.target.value } })}
              placeholder="A quién va dirigida"
              autoComplete="off"
            />
            <Campo
              etiqueta="Empresa"
              value={cliente.empresa}
              onChange={(e) => cambiar({ cliente: { ...cliente, empresa: e.target.value } })}
              placeholder="Opcional"
              autoComplete="off"
            />
          </Tarjeta>
        </div>

        <div className="ui-columnas-3">
          <Campo
            etiqueta="Número"
            value={propuesta.numero}
            onChange={(e) => cambiar({ numero: e.target.value })}
          />
          <Campo
            etiqueta="Fecha"
            type="date"
            value={propuesta.fecha}
            onChange={(e) => cambiar({ fecha: e.target.value })}
          />
          <Campo
            etiqueta="Validez (días)"
            type="number"
            min="0"
            inputMode="numeric"
            value={propuesta.validez}
            onChange={(e) => cambiar({ validez: e.target.value })}
          />
        </div>

        <Tarjeta titulo="Proyecto">
          <Campo
            etiqueta="Nombre del proyecto"
            value={propuesta.proyecto}
            onChange={(e) => cambiar({ proyecto: e.target.value })}
            placeholder="Ej.: página web para la panadería"
          />
          <CampoArea
            etiqueta="Alcance"
            value={propuesta.alcance}
            onChange={(e) => cambiar({ alcance: e.target.value })}
            placeholder="Qué vas a hacer y, si ayuda, qué no está incluido."
            rows={4}
          />
        </Tarjeta>

        <Tarjeta titulo="Entregables y plazos">
          {entregables.map((entregable, indice) => (
            <div key={entregable.id} className={estilos.entregable}>
              <input
                className="ui-entrada"
                value={entregable.descripcion}
                onChange={(e) => cambiarEntregable(entregable.id, { descripcion: e.target.value })}
                placeholder="Ej.: diseño de la página de inicio"
                aria-label={`Entregable ${indice + 1}`}
              />
              <input
                className="ui-entrada"
                value={entregable.plazo}
                onChange={(e) => cambiarEntregable(entregable.id, { plazo: e.target.value })}
                placeholder="Ej.: 5 días"
                aria-label={`Plazo del entregable ${indice + 1}`}
              />
              <Boton
                variante="icono"
                onClick={() => cambiar({ entregables: quitarDeLista(entregables, entregable.id) })}
                disabled={entregables.length === 1}
                aria-label={`Quitar el entregable ${indice + 1}`}
              >
                <Trash2 size={16} aria-hidden />
              </Boton>
            </div>
          ))}
          <Boton
            variante="punteado"
            onClick={() => cambiar({ entregables: [...entregables, entregableVacio()] })}
          >
            <Plus size={14} aria-hidden /> Agregar entregable
          </Boton>
        </Tarjeta>

        <Tarjeta titulo="Valor y forma de pago">
          <Campo
            className={estilos.presupuesto}
            etiqueta="Valor total"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={propuesta.presupuesto}
            onChange={(e) => cambiar({ presupuesto: e.target.value })}
            placeholder="0"
          />

          <div className={estilos.cabeceraPagos} aria-hidden>
            <span>Pago</span>
            <span>%</span>
            <span className={estilos.derecha}>Valor</span>
            <span />
          </div>
          {pagos.map((pago, indice) => (
            <div key={pago.id} className={estilos.pago}>
              <input
                className="ui-entrada"
                value={pago.concepto}
                onChange={(e) => cambiarPago(pago.id, { concepto: e.target.value })}
                placeholder="Ej.: al aprobar el diseño"
                aria-label={`Concepto del pago ${indice + 1}`}
              />
              <input
                className="ui-entrada"
                type="number"
                min="0"
                max="100"
                step="any"
                inputMode="decimal"
                value={pago.porcentaje}
                onChange={(e) => cambiarPago(pago.id, { porcentaje: e.target.value })}
                placeholder="0"
                aria-label={`Porcentaje del pago ${indice + 1}`}
              />
              <output className={estilos.valor}>{formatearDinero(valores[indice] ?? 0)}</output>
              <Boton
                variante="icono"
                onClick={() => cambiar({ pagos: quitarDeLista(pagos, pago.id) })}
                disabled={pagos.length === 1}
                aria-label={`Quitar el pago ${indice + 1}`}
              >
                <Trash2 size={16} aria-hidden />
              </Boton>
            </div>
          ))}
          <Boton variante="punteado" onClick={() => cambiar({ pagos: [...pagos, pagoVacio()] })}>
            <Plus size={14} aria-hidden /> Agregar pago
          </Boton>

          {suma !== 100 && (
            <div className={estilos.aviso}>
              <Aviso tono="alerta">
                Los pagos suman {formatearNumero(suma)} %. Deben sumar 100 % para que cubran el
                valor total.
              </Aviso>
            </div>
          )}
        </Tarjeta>

        <Tarjeta titulo="Condiciones">
          <CampoArea
            etiqueta="Una por renglón"
            value={propuesta.condiciones}
            onChange={(e) => cambiar({ condiciones: e.target.value })}
            rows={5}
          />
          <p className={estilos.nota}>
            Esta propuesta sirve para dejar claro lo acordado. Si el trabajo es grande o hay mucho
            en juego, haz revisar el texto por un abogado antes de firmar.
          </p>
        </Tarjeta>

        <Respaldo
          herramienta="propuesta"
          datos={propuesta}
          esValido={esPropuesta}
          alCargar={setPropuesta}
        />
      </Pagina>

      <div className="solo-impresion">
        <Documento perfil={perfil} propuesta={propuesta} total={total} valores={valores} />
      </div>
    </>
  )
}
