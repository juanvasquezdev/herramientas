import { Plus, RotateCcw, Trash2 } from 'lucide-react'
import { formatearDinero } from '../../shared/dinero'
import { BarraDePartes, type Parte } from '../../shared/graficos'
import { cambiarEnLista, quitarDeLista } from '../../shared/lista'
import { formatearNumero } from '../../shared/numero'
import { Respaldo } from '../../shared/Respaldo'
import {
  Aviso,
  Boton,
  Campo,
  Encabezado,
  Indicador,
  Indicadores,
  Pagina,
  Segmentos,
  Tarjeta,
} from '../../shared/ui'
import { useGuardadoLocal } from '../../shared/useGuardadoLocal'
import { calcular, type Resultado } from './calculo'
import {
  type Analisis,
  analisisInicial,
  CLAVE_GUARDADO,
  type Costo,
  costoVacio,
  esAnalisis,
  type Modo,
} from './modelo'
import estilos from './rentabilidad.module.css'

const MODOS: ReadonlyArray<{ valor: Modo; texto: string }> = [
  { valor: 'margen', texto: 'Quiero este margen' },
  { valor: 'precio', texto: 'Ya tengo un precio' },
]

export default function Rentabilidad() {
  const [analisis, setAnalisis] = useGuardadoLocal<Analisis>(
    CLAVE_GUARDADO,
    analisisInicial,
    esAnalisis,
  )
  const resultado = calcular(analisis)
  const cambiar = (cambios: Partial<Analisis>) => setAnalisis((prev) => ({ ...prev, ...cambios }))

  const limpiar = () => {
    if (window.confirm('Se borra todo lo escrito en esta calculadora. ¿Empezar de cero?')) {
      setAnalisis(analisisInicial())
    }
  }

  return (
    <Pagina>
      <Encabezado
        titulo="Precio y rentabilidad"
        descripcion="Encuentra el precio que cubre tus costos y deja el margen que quieres, o revisa cuánto te queda con el precio que ya tienes."
      >
        <Boton onClick={limpiar}>
          <RotateCcw size={16} aria-hidden /> Empezar de cero
        </Boton>
      </Encabezado>

      <Campo
        etiqueta="Producto o servicio"
        value={analisis.producto}
        onChange={(e) => cambiar({ producto: e.target.value })}
        placeholder="Ej.: torta de chocolate, corte de cabello"
      />

      <div className="ui-columnas">
        <ListaDeCostos
          titulo="Costos por unidad"
          ayuda="Lo que gastas cada vez que haces o vendes una."
          ejemplo="Ej.: ingredientes, empaque, envío"
          costos={analisis.variables}
          alCambiar={(variables) => cambiar({ variables })}
          total={`Por unidad: ${formatearDinero(resultado.costoVariable)}`}
        />
        <ListaDeCostos
          titulo="Costos fijos al mes"
          ayuda="Lo que pagas vendas mucho o poco."
          ejemplo="Ej.: arriendo, servicios, internet"
          costos={analisis.fijos}
          alCambiar={(fijos) => cambiar({ fijos })}
          total={`Al mes: ${formatearDinero(resultado.costosFijos)}`}
        />
      </div>

      <Tarjeta>
        <div className={estilos.supuestos}>
          <Campo
            etiqueta="Unidades que vendes al mes"
            type="number"
            min="0"
            inputMode="numeric"
            value={analisis.unidades}
            onChange={(e) => cambiar({ unidades: e.target.value })}
          />
          <Campo
            etiqueta="Comisión por venta (%)"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={analisis.comision}
            onChange={(e) => cambiar({ comision: e.target.value })}
            ayuda="Pasarela de pagos, datáfono o plataforma. 0 si vendes en efectivo."
          />
        </div>

        <div className={estilos.modo}>
          <Segmentos
            etiqueta="Qué quieres calcular"
            nombre="rentabilidad-modo"
            opciones={MODOS}
            valor={analisis.modo}
            alCambiar={(modo) => cambiar({ modo })}
          />
          {analisis.modo === 'margen' ? (
            <Campo
              etiqueta="Margen que quieres (%)"
              type="number"
              min="0"
              max="99"
              step="any"
              inputMode="decimal"
              value={analisis.margen}
              onChange={(e) => cambiar({ margen: e.target.value })}
              ayuda="De cada $100 que cobras, cuántos te quedan."
            />
          ) : (
            <Campo
              etiqueta="Precio al que vendes"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={analisis.precio}
              onChange={(e) => cambiar({ precio: e.target.value })}
              placeholder="0"
            />
          )}
        </div>
      </Tarjeta>

      <Avisos analisis={analisis} resultado={resultado} />

      {/* aria-live: quien usa lector de pantalla oye el resultado cuando cambia un dato. */}
      <div aria-live="polite">
        <Indicadores>
          {analisis.modo === 'margen' ? (
            <Indicador
              principal
              etiqueta="Precio de venta sugerido"
              valor={formatearDinero(resultado.precio)}
              detalle={`Costo por unidad: ${formatearDinero(resultado.costoPorUnidad)}`}
            />
          ) : (
            <Indicador
              principal
              etiqueta="Margen real"
              valor={`${formatearNumero(resultado.margen, 1)} %`}
              tono={resultado.margen < 0 ? 'mal' : 'neutro'}
              detalle={`Costo por unidad: ${formatearDinero(resultado.costoPorUnidad)}`}
            />
          )}
          <Indicador
            etiqueta="Ganancia por unidad"
            valor={formatearDinero(resultado.gananciaPorUnidad)}
            tono={resultado.gananciaPorUnidad < 0 ? 'mal' : 'neutro'}
          />
          <Indicador
            etiqueta="Punto de equilibrio"
            valor={
              resultado.equilibrioUnidades === null
                ? 'No se alcanza'
                : `${formatearNumero(resultado.equilibrioUnidades, 0)} unidades`
            }
            detalle="Lo mínimo que debes vender al mes para no perder."
            tono={resultado.equilibrioUnidades === null ? 'mal' : 'neutro'}
          />
          <Indicador
            etiqueta="Ganancia al mes"
            valor={formatearDinero(resultado.gananciaMensual)}
            tono={
              resultado.gananciaMensual < 0
                ? 'mal'
                : resultado.gananciaMensual > 0
                  ? 'bien'
                  : 'neutro'
            }
            detalle={`Vendiendo ${analisis.unidades || 0} unidades.`}
          />
        </Indicadores>
      </div>

      {resultado.precio > 0 && resultado.gananciaPorUnidad >= 0 && (
        <Tarjeta titulo="En qué se va cada venta">
          <BarraDePartes
            titulo="Cómo se reparte el precio de una unidad"
            partes={partesDelPrecio(resultado)}
            formato={formatearDinero}
          />
        </Tarjeta>
      )}

      <Respaldo
        herramienta="rentabilidad"
        datos={analisis}
        esValido={esAnalisis}
        alCargar={setAnalisis}
      />
    </Pagina>
  )
}

/** El color de cada parte es fijo: no cambia aunque una desaparezca o se vuelva la más grande. */
function partesDelPrecio(resultado: Resultado): Parte[] {
  return [
    { nombre: 'Costos por unidad', valor: resultado.costoVariable, serie: 1 },
    { nombre: 'Costos fijos', valor: resultado.fijoPorUnidad, serie: 2 },
    { nombre: 'Comisión', valor: resultado.comisionPorUnidad, serie: 3 },
    { nombre: 'Ganancia', valor: resultado.gananciaPorUnidad, serie: 4 },
  ]
}

function Avisos({ analisis, resultado }: { analisis: Analisis; resultado: Resultado }) {
  const unidades = Number(analisis.unidades) || 0
  const equilibrio = resultado.equilibrioUnidades

  if (resultado.margenImposible) {
    return (
      <Aviso tono="error">
        El margen y la comisión suman 100 % o más. No existe un precio que los cubra: baja alguno de
        los dos.
      </Aviso>
    )
  }
  if (resultado.fijosSinRepartir) {
    return (
      <Aviso tono="alerta">
        Sin unidades al mes no se pueden repartir los costos fijos. El resultado de abajo solo cubre
        los costos por unidad.
      </Aviso>
    )
  }
  if (analisis.modo === 'precio' && resultado.precio > 0 && resultado.gananciaPorUnidad < 0) {
    return (
      <Aviso tono="error">
        A este precio pierdes {formatearDinero(Math.abs(resultado.gananciaPorUnidad))} en cada
        unidad que vendes.
      </Aviso>
    )
  }
  if (equilibrio !== null && equilibrio > unidades && unidades > 0) {
    return (
      <Aviso tono="alerta">
        Para no perder necesitas vender {formatearNumero(equilibrio, 0)} unidades al mes y estimas{' '}
        {analisis.unidades}.
      </Aviso>
    )
  }
  return null
}

interface ListaDeCostosProps {
  titulo: string
  ayuda: string
  ejemplo: string
  costos: Costo[]
  alCambiar: (costos: Costo[]) => void
  total: string
}

function ListaDeCostos({ titulo, ayuda, ejemplo, costos, alCambiar, total }: ListaDeCostosProps) {
  return (
    <Tarjeta titulo={titulo}>
      <p className={estilos.ayuda}>{ayuda}</p>
      {costos.map((costo, indice) => (
        <div key={costo.id} className={estilos.costo}>
          <input
            className="ui-entrada"
            value={costo.nombre}
            onChange={(e) =>
              alCambiar(cambiarEnLista(costos, costo.id, { nombre: e.target.value }))
            }
            placeholder={indice === 0 ? ejemplo : 'Otro costo'}
            aria-label={`${titulo}: nombre del costo ${indice + 1}`}
          />
          <input
            className="ui-entrada"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={costo.monto}
            onChange={(e) => alCambiar(cambiarEnLista(costos, costo.id, { monto: e.target.value }))}
            placeholder="0"
            aria-label={`${titulo}: valor del costo ${indice + 1}`}
          />
          <Boton
            variante="icono"
            onClick={() => alCambiar(quitarDeLista(costos, costo.id))}
            disabled={costos.length === 1}
            aria-label={`${titulo}: quitar el costo ${indice + 1}`}
          >
            <Trash2 size={16} aria-hidden />
          </Boton>
        </div>
      ))}
      <Boton variante="punteado" onClick={() => alCambiar([...costos, costoVacio()])}>
        <Plus size={14} aria-hidden /> Agregar costo
      </Boton>
      <p className={estilos.total}>{total}</p>
    </Tarjeta>
  )
}
