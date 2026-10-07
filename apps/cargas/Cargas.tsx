import { CopyPlus, Download, Plus, Trash2 } from 'lucide-react'
import { GraficoColumnas } from '../../shared/graficos'
import { imprimirConTitulo } from '../../shared/imprimir'
import { cambiarEnLista } from '../../shared/lista'
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
  unir,
} from '../../shared/ui'
import { useGuardadoLocal } from '../../shared/useGuardadoLocal'
import { cargaDe, comparar, resumirSemana, superaElTope } from './carga'
import estilos from './cargas.module.css'
import { Documento } from './Documento'
import {
  agregarSemana,
  CLAVE_GUARDADO,
  DIAS,
  type Dia,
  type Ejercicio,
  ejercicioVacio,
  esPlan,
  type Medida,
  type Plan,
  planInicial,
  quitarSemana,
  type Semana,
} from './modelo'

const MEDIDAS: ReadonlyArray<{ valor: Medida; texto: string }> = [
  { valor: 'tonelaje', texto: 'Tonelaje (kg)' },
  { valor: 'repeticiones', texto: 'Repeticiones' },
]

export default function Cargas() {
  const [plan, setPlan] = useGuardadoLocal<Plan>(CLAVE_GUARDADO, planInicial, esPlan)
  const indice = Math.max(
    0,
    plan.semanas.findIndex((semana) => semana.id === plan.activa),
  )
  const semana = plan.semanas[indice]
  // esPlan garantiza que hay al menos una semana; esto es solo para TypeScript.
  if (!semana) return null

  const unidad = plan.medida === 'tonelaje' ? 'kg' : 'reps'
  const formato = (valor: number) => `${formatearNumero(valor, 0)} ${unidad}`
  const resumen = resumirSemana(semana, plan.medida)
  const totales = plan.semanas.map((s) => resumirSemana(s, plan.medida).total)
  const anterior = plan.semanas[indice - 1]
  const comparacion = comparar(resumen.total, anterior ? totales[indice - 1] : undefined)
  const pasada = superaElTope(comparacion, plan.tope)

  const cambiar = (cambios: Partial<Plan>) => setPlan((prev) => ({ ...prev, ...cambios }))
  const cambiarSemana = (cambios: Partial<Semana>) =>
    setPlan((prev) => ({ ...prev, semanas: cambiarEnLista(prev.semanas, semana.id, cambios) }))
  const cambiarEjercicio = (id: string, cambios: Partial<Ejercicio>) =>
    cambiarSemana({ ejercicios: cambiarEnLista(semana.ejercicios, id, cambios) })

  // El ejercicio nuevo cae en el mismo día del último: casi siempre se llena un día completo de corrido.
  const agregarEjercicio = () =>
    cambiarSemana({
      ejercicios: [...semana.ejercicios, ejercicioVacio(semana.ejercicios.at(-1)?.dia)],
    })
  const quitarEjercicio = (id: string) =>
    cambiarSemana({ ejercicios: semana.ejercicios.filter((ejercicio) => ejercicio.id !== id) })

  const borrarSemana = () => {
    if (window.confirm(`Se borra «${semana.nombre}» con todos sus ejercicios. ¿Borrarla?`)) {
      setPlan((prev) => quitarSemana(prev, semana.id))
    }
  }

  return (
    <>
      <Pagina ancho="ancha">
        <Encabezado
          titulo="Planificador de cargas"
          descripcion="Arma la semana de fuerza, mira cuánto carga cada día y compárala con la semana anterior."
        >
          <Boton
            variante="primario"
            onClick={() => imprimirConTitulo(`Plan ${semana.nombre} ${plan.atleta}`.trim())}
            disabled={
              resumen.diasDeEntrenamiento === 0 &&
              semana.ejercicios.every((e) => e.nombre.trim() === '')
            }
          >
            <Download size={16} aria-hidden /> Plan en PDF
          </Boton>
        </Encabezado>

        <div className={estilos.datos}>
          <Campo
            etiqueta="Atleta"
            value={plan.atleta}
            onChange={(e) => cambiar({ atleta: e.target.value })}
            autoComplete="off"
          />
          <Campo
            etiqueta="Avisar si la semana sube más de (%)"
            type="number"
            min="0"
            inputMode="numeric"
            value={plan.tope}
            onChange={(e) => cambiar({ tope: e.target.value })}
            placeholder="Sin aviso"
            ayuda="Lo define cada entrenador según el atleta y el momento de la temporada."
          />
        </div>

        <div className={estilos.barra}>
          <fieldset className={estilos.semanas}>
            <legend className="ui-oculto">Semanas del plan</legend>
            {plan.semanas.map((s) => (
              <button
                key={s.id}
                type="button"
                className={unir(estilos.semana, s.id === semana.id && estilos.semanaActiva)}
                aria-pressed={s.id === semana.id}
                onClick={() => cambiar({ activa: s.id })}
              >
                {s.nombre || 'Sin nombre'}
              </button>
            ))}
            <Boton
              variante="punteado"
              onClick={() => setPlan(agregarSemana)}
              title="La semana nueva empieza como copia de esta"
            >
              <CopyPlus size={14} aria-hidden /> Semana siguiente
            </Boton>
          </fieldset>
          <Segmentos
            etiqueta="Cómo medir la carga"
            nombre="cargas-medida"
            opciones={MEDIDAS}
            valor={plan.medida}
            alCambiar={(medida) => cambiar({ medida })}
          />
        </div>

        {pasada && comparacion && anterior && (
          <Aviso tono="alerta">
            {semana.nombre} sube {comparacion.porcentaje} % frente a {anterior.nombre}. El tope que
            fijaste es {plan.tope} %.
          </Aviso>
        )}

        <div aria-live="polite">
          <Indicadores>
            <Indicador
              principal
              etiqueta={`Total de ${semana.nombre || 'la semana'}`}
              valor={formato(resumen.total)}
            />
            <Indicador
              etiqueta="Frente a la semana anterior"
              valor={
                comparacion
                  ? `${comparacion.porcentaje > 0 ? '+' : ''}${comparacion.porcentaje} %`
                  : '—'
              }
              detalle={
                comparacion && anterior
                  ? `${anterior.nombre}: ${formato(totales[indice - 1] ?? 0)}`
                  : 'No hay semana anterior con carga.'
              }
              tono={pasada ? 'mal' : 'neutro'}
            />
            <Indicador
              etiqueta="Días de entrenamiento"
              valor={`${resumen.diasDeEntrenamiento} de 7`}
              detalle={
                resumen.diaMasCargado
                  ? `El más cargado: ${resumen.diaMasCargado.dia.toLowerCase()}, ${resumen.diaMasCargado.porcentaje} % de la semana.`
                  : undefined
              }
            />
            <Indicador
              etiqueta="Peso medio por repetición"
              valor={resumen.pesoMedio > 0 ? `${formatearNumero(resumen.pesoMedio, 1)} kg` : '—'}
              detalle="En los ejercicios con carga."
            />
          </Indicadores>
        </div>

        <div className={plan.semanas.length > 1 ? 'ui-columnas' : undefined}>
          <Tarjeta titulo="Carga por día">
            <GraficoColumnas
              titulo={`Carga de cada día de ${semana.nombre}`}
              medida={plan.medida === 'tonelaje' ? 'Tonelaje' : 'Repeticiones'}
              formato={formato}
              columnas={resumen.porDia.map((dia) => ({
                etiqueta: dia.dia.slice(0, 3),
                nombre: dia.dia,
                valor: dia.carga,
              }))}
            />
          </Tarjeta>
          {plan.semanas.length > 1 && (
            <Tarjeta titulo="Semana a semana">
              <GraficoColumnas
                titulo="Carga total de cada semana"
                medida={plan.medida === 'tonelaje' ? 'Tonelaje' : 'Repeticiones'}
                formato={formato}
                columnas={plan.semanas.map((s, i) => ({
                  etiqueta: etiquetaCorta(s.nombre, i),
                  nombre: s.nombre || `Semana ${i + 1}`,
                  valor: totales[i] ?? 0,
                  resaltada: s.id === semana.id,
                }))}
              />
            </Tarjeta>
          )}
        </div>

        <Tarjeta
          titulo="Ejercicios"
          accion={
            <div className={estilos.nombreSemana}>
              <input
                className="ui-entrada"
                value={semana.nombre}
                onChange={(e) => cambiarSemana({ nombre: e.target.value })}
                aria-label="Nombre de la semana"
              />
              <Boton
                variante="icono"
                onClick={borrarSemana}
                disabled={plan.semanas.length === 1}
                aria-label={`Borrar ${semana.nombre}`}
              >
                <Trash2 size={16} aria-hidden />
              </Boton>
            </div>
          }
        >
          {semana.ejercicios.length === 0 ? (
            <p className={estilos.vacio}>Esta semana no tiene ejercicios todavía.</p>
          ) : (
            <div className={estilos.cabecera} aria-hidden>
              <span>Día</span>
              <span>Ejercicio</span>
              <span>Series</span>
              <span>Reps</span>
              <span>Kg</span>
              <span className={estilos.derecha}>
                {plan.medida === 'tonelaje' ? 'Tonelaje' : 'Reps totales'}
              </span>
              <span />
            </div>
          )}
          {semana.ejercicios.map((ejercicio, i) => (
            <div key={ejercicio.id} className={estilos.fila}>
              <select
                className={`ui-entrada ${estilos.dia}`}
                value={ejercicio.dia}
                onChange={(e) => cambiarEjercicio(ejercicio.id, { dia: e.target.value as Dia })}
                aria-label={`Día del ejercicio ${i + 1}`}
              >
                {DIAS.map((dia) => (
                  <option key={dia}>{dia}</option>
                ))}
              </select>
              <input
                className={`ui-entrada ${estilos.nombre}`}
                value={ejercicio.nombre}
                onChange={(e) => cambiarEjercicio(ejercicio.id, { nombre: e.target.value })}
                placeholder="Ej.: sentadilla trasera"
                aria-label={`Nombre del ejercicio ${i + 1}`}
              />
              <Numero
                rotulo="Series"
                valor={ejercicio.series}
                alCambiar={(series) => cambiarEjercicio(ejercicio.id, { series })}
                n={i + 1}
              />
              <Numero
                rotulo="Reps"
                valor={ejercicio.reps}
                alCambiar={(reps) => cambiarEjercicio(ejercicio.id, { reps })}
                n={i + 1}
              />
              <Numero
                rotulo="Kg"
                valor={ejercicio.kg}
                alCambiar={(kg) => cambiarEjercicio(ejercicio.id, { kg })}
                n={i + 1}
                decimal
              />
              <output className={estilos.carga}>{formato(cargaDe(ejercicio, plan.medida))}</output>
              <Boton
                variante="icono"
                className={estilos.quitar}
                onClick={() => quitarEjercicio(ejercicio.id)}
                aria-label={`Quitar el ejercicio ${i + 1}`}
              >
                <Trash2 size={16} aria-hidden />
              </Boton>
            </div>
          ))}
          <Boton variante="punteado" onClick={agregarEjercicio}>
            <Plus size={14} aria-hidden /> Agregar ejercicio
          </Boton>
        </Tarjeta>

        <Respaldo herramienta="cargas" datos={plan} esValido={esPlan} alCargar={setPlan} />
      </Pagina>

      <div className="solo-impresion">
        <Documento plan={plan} semana={semana} />
      </div>
    </>
  )
}

/** "Semana 3" -> "S3". Cualquier otro nombre se recorta para que quepa bajo la columna. */
function etiquetaCorta(nombre: string, indice: number): string {
  const numero = /^semana\s+(\d+)$/i.exec(nombre.trim())
  if (numero) return `S${numero[1]}`
  return nombre.trim().slice(0, 6) || `S${indice + 1}`
}

interface NumeroProps {
  rotulo: string
  valor: string
  alCambiar: (valor: string) => void
  /** Número de la fila, para el nombre accesible. */
  n: number
  decimal?: boolean
}

/** Un campo numérico de la tabla. En celular muestra su rótulo porque la cabecera se oculta. */
function Numero({ rotulo, valor, alCambiar, n, decimal }: NumeroProps) {
  return (
    <div className={estilos.numero}>
      <span className={estilos.rotulo} aria-hidden>
        {rotulo}
      </span>
      <input
        className="ui-entrada"
        type="number"
        min="0"
        step={decimal ? 'any' : '1'}
        inputMode={decimal ? 'decimal' : 'numeric'}
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
        placeholder="0"
        aria-label={`${rotulo} del ejercicio ${n}`}
      />
    </div>
  )
}
