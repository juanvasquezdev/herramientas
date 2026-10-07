import { ChevronLeft, ChevronRight, FileSpreadsheet, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { descargarTexto, paraNombreDeArchivo } from '../../shared/archivo'
import { aCsv } from '../../shared/csv'
import { formatearFecha, hoyISO } from '../../shared/fecha'
import { Barras } from '../../shared/graficos'
import { cambiarEnLista } from '../../shared/lista'
import { formatearNumero } from '../../shared/numero'
import { Respaldo } from '../../shared/Respaldo'
import {
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
import {
  type Agrupar,
  contarPorEstado,
  delMes,
  rendimientoPor,
  tasaDeInteraccion,
} from './analisis'
import estilos from './contenido.module.css'
import { fechaParaNueva, moverMes, nombreDelMes, semanasDelMes } from './mes'
import {
  type Calendario,
  CLAVE_GUARDADO,
  calendarioInicial,
  ESTADOS,
  type Estado,
  esCalendario,
  FORMATOS,
  PILARES,
  PLATAFORMAS,
  type Publicacion,
  publicacionVacia,
} from './modelo'

const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const AGRUPAR: ReadonlyArray<{ valor: Agrupar; texto: string }> = [
  { valor: 'pilar', texto: 'Por tema' },
  { valor: 'formato', texto: 'Por formato' },
  { valor: 'plataforma', texto: 'Por plataforma' },
]

/** La clase de color de cada estado. El color siempre va acompañado del nombre. */
const CLASE_ESTADO: Record<Estado, string | undefined> = {
  Idea: estilos.idea,
  Grabado: estilos.grabado,
  Editado: estilos.editado,
  Publicado: estilos.publicado,
}

export default function Contenido() {
  const [calendario, setCalendario] = useGuardadoLocal<Calendario>(
    CLAVE_GUARDADO,
    calendarioInicial,
    esCalendario,
  )
  const [agrupar, setAgrupar] = useState<Agrupar>('pilar')
  const hoy = hoyISO()
  const { mes, publicaciones } = calendario

  const visibles = delMes(publicaciones, mes)
  const conteo = contarPorEstado(visibles)
  const rendimiento = rendimientoPor(publicaciones, agrupar)

  const cambiar = (cambios: Partial<Calendario>) =>
    setCalendario((prev) => ({ ...prev, ...cambios }))
  const cambiarPublicacion = (id: string, cambios: Partial<Publicacion>) =>
    setCalendario((prev) => ({
      ...prev,
      publicaciones: cambiarEnLista(prev.publicaciones, id, cambios),
    }))
  const quitar = (id: string) =>
    setCalendario((prev) => ({
      ...prev,
      publicaciones: prev.publicaciones.filter((p) => p.id !== id),
    }))

  const agregarEn = (fecha: string) => {
    const nueva = publicacionVacia(fecha)
    setCalendario((prev) => ({ ...prev, publicaciones: [...prev.publicaciones, nueva] }))
    // Se espera a que React pinte la fila nueva y se lleva el cursor a su título.
    requestAnimationFrame(() => irA(nueva.id))
  }

  const exportarCsv = () => {
    const encabezado = [
      'Fecha',
      'Título',
      'Tema',
      'Formato',
      'Plataforma',
      'Estado',
      'Vistas',
      'Interacciones',
      'Interacción %',
    ]
    const filas = [...publicaciones]
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .map((p) => [
        p.fecha,
        p.titulo,
        p.pilar,
        p.formato,
        p.plataforma,
        p.estado,
        p.vistas,
        p.interacciones,
        p.estado === 'Publicado' ? tasaDeInteraccion(p) : '',
      ])
    descargarTexto(
      `contenido-${paraNombreDeArchivo(calendario.cuenta, 'cuenta')}.csv`,
      aCsv([encabezado, ...filas]),
      'text/csv',
    )
  }

  return (
    <Pagina ancho="ancha">
      <Encabezado
        titulo="Calendario de contenido"
        descripcion="Planea qué publicas y cuándo, sigue cada pieza hasta que salga y mira qué te funciona mejor."
      >
        <Boton onClick={exportarCsv} disabled={publicaciones.length === 0}>
          <FileSpreadsheet size={16} aria-hidden /> Excel (CSV)
        </Boton>
      </Encabezado>

      <Campo
        className={estilos.cuenta}
        etiqueta="Cuenta o marca"
        value={calendario.cuenta}
        onChange={(e) => cambiar({ cuenta: e.target.value })}
        placeholder="Ej.: @tucuenta"
        autoComplete="off"
      />

      <div aria-live="polite">
        <Indicadores>
          <Indicador
            etiqueta={`Planeadas en ${nombreDelMes(mes).split(' de ')[0]}`}
            valor={visibles.length}
          />
          <Indicador
            etiqueta="Publicadas"
            valor={conteo.Publicado}
            tono={conteo.Publicado > 0 ? 'bien' : 'neutro'}
          />
          <Indicador
            etiqueta="En producción"
            valor={conteo.Grabado + conteo.Editado}
            detalle="Grabadas o editadas."
          />
          <Indicador etiqueta="Ideas sin empezar" valor={conteo.Idea} />
        </Indicadores>
      </div>

      <Tarjeta>
        <div className={estilos.navegacion}>
          <h2 className={estilos.mes}>{nombreDelMes(mes)}</h2>
          <div className={estilos.flechas}>
            <Boton
              variante="plano"
              onClick={() => cambiar({ mes: moverMes(mes, -1) })}
              aria-label="Mes anterior"
            >
              <ChevronLeft size={18} aria-hidden />
            </Boton>
            <Boton
              onClick={() => cambiar({ mes: hoy.slice(0, 7) })}
              disabled={mes === hoy.slice(0, 7)}
            >
              Hoy
            </Boton>
            <Boton
              variante="plano"
              onClick={() => cambiar({ mes: moverMes(mes, 1) })}
              aria-label="Mes siguiente"
            >
              <ChevronRight size={18} aria-hidden />
            </Boton>
          </div>
        </div>

        <div className={estilos.rejilla}>
          {DIAS_CORTOS.map((dia) => (
            <div key={dia} className={estilos.diaSemana} aria-hidden>
              {dia}
            </div>
          ))}
          {semanasDelMes(mes)
            .flat()
            .map((fecha, casilla) =>
              fecha === null ? (
                // biome-ignore lint/suspicious/noArrayIndexKey: las casillas vacías no tienen otro dato que las distinga
                <div key={`vacia-${casilla}`} className={estilos.fuera} />
              ) : (
                <div key={fecha} className={unir(estilos.dia, fecha === hoy && estilos.hoy)}>
                  <div className={estilos.diaCabecera}>
                    <span className={estilos.numero}>{Number(fecha.slice(8))}</span>
                    <button
                      type="button"
                      className={estilos.mas}
                      onClick={() => agregarEn(fecha)}
                      aria-label={`Agregar publicación el ${formatearFecha(fecha)}`}
                    >
                      <Plus size={13} aria-hidden />
                    </button>
                  </div>
                  {visibles
                    .filter((publicacion) => publicacion.fecha === fecha)
                    .map((publicacion) => (
                      <button
                        key={publicacion.id}
                        type="button"
                        className={estilos.ficha}
                        onClick={() => irA(publicacion.id)}
                        title={`${publicacion.titulo || 'Sin título'} · ${publicacion.estado}`}
                      >
                        <span
                          className={unir(estilos.punto, CLASE_ESTADO[publicacion.estado])}
                          aria-hidden
                        />
                        <span className={estilos.fichaTexto}>
                          {publicacion.titulo || 'Sin título'}
                        </span>
                        <span className="ui-oculto">, {publicacion.estado}</span>
                      </button>
                    ))}
                </div>
              ),
            )}
        </div>

        <ul className={estilos.leyenda}>
          {ESTADOS.map((estado) => (
            <li key={estado}>
              <span className={unir(estilos.punto, CLASE_ESTADO[estado])} aria-hidden />
              {estado}
            </li>
          ))}
        </ul>
      </Tarjeta>

      <Tarjeta titulo={`Publicaciones de ${nombreDelMes(mes)}`}>
        {visibles.length === 0 ? (
          <p className={estilos.vacio}>
            No hay nada planeado este mes. Agrega una aquí o con el «+» de un día del calendario.
          </p>
        ) : (
          <div className={estilos.cabecera} aria-hidden>
            <span>Fecha</span>
            <span>Título o idea</span>
            <span>Tema</span>
            <span>Formato</span>
            <span>Plataforma</span>
            <span>Estado</span>
            <span />
          </div>
        )}

        {visibles.map((publicacion, i) => (
          <div key={publicacion.id} className={estilos.fila}>
            <input
              className={`ui-entrada ${estilos.fecha}`}
              type="date"
              value={publicacion.fecha}
              onChange={(e) => cambiarPublicacion(publicacion.id, { fecha: e.target.value })}
              aria-label={`Fecha de la publicación ${i + 1}`}
            />
            <input
              id={`titulo-${publicacion.id}`}
              className={`ui-entrada ${estilos.titulo}`}
              value={publicacion.titulo}
              onChange={(e) => cambiarPublicacion(publicacion.id, { titulo: e.target.value })}
              placeholder="Ej.: rutina de calentamiento"
              aria-label={`Título de la publicación ${i + 1}`}
            />
            <Lista
              clase={estilos.tema}
              nombre="Tema"
              n={i + 1}
              opciones={PILARES}
              valor={publicacion.pilar}
              alCambiar={(pilar) => cambiarPublicacion(publicacion.id, { pilar })}
            />
            <Lista
              clase={estilos.formato}
              nombre="Formato"
              n={i + 1}
              opciones={FORMATOS}
              valor={publicacion.formato}
              alCambiar={(formato) => cambiarPublicacion(publicacion.id, { formato })}
            />
            <Lista
              clase={estilos.plataforma}
              nombre="Plataforma"
              n={i + 1}
              opciones={PLATAFORMAS}
              valor={publicacion.plataforma}
              alCambiar={(plataforma) => cambiarPublicacion(publicacion.id, { plataforma })}
            />
            <div className={estilos.estado}>
              <span className={unir(estilos.punto, CLASE_ESTADO[publicacion.estado])} aria-hidden />
              <Lista
                nombre="Estado"
                n={i + 1}
                opciones={ESTADOS}
                valor={publicacion.estado}
                alCambiar={(estado) => cambiarPublicacion(publicacion.id, { estado })}
              />
            </div>
            <Boton
              variante="icono"
              className={estilos.quitar}
              onClick={() => quitar(publicacion.id)}
              aria-label={`Quitar la publicación ${i + 1}`}
            >
              <Trash2 size={16} aria-hidden />
            </Boton>

            {publicacion.estado === 'Publicado' && (
              <div className={estilos.resultados}>
                <label>
                  <span>Vistas</span>
                  <input
                    className="ui-entrada"
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={publicacion.vistas}
                    onChange={(e) => cambiarPublicacion(publicacion.id, { vistas: e.target.value })}
                    placeholder="0"
                  />
                </label>
                <label>
                  <span>Interacciones</span>
                  <input
                    className="ui-entrada"
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={publicacion.interacciones}
                    onChange={(e) =>
                      cambiarPublicacion(publicacion.id, { interacciones: e.target.value })
                    }
                    placeholder="Me gusta, comentarios, guardados y compartidos"
                  />
                </label>
                <output>
                  {tasaDeInteraccion(publicacion) > 0 &&
                    `${formatearNumero(tasaDeInteraccion(publicacion), 1)} % de interacción`}
                </output>
              </div>
            )}
          </div>
        ))}

        <Boton variante="punteado" onClick={() => agregarEn(fechaParaNueva(mes, hoy))}>
          <Plus size={14} aria-hidden /> Agregar publicación
        </Boton>
      </Tarjeta>

      <Tarjeta
        titulo="Qué te funciona mejor"
        accion={
          <Segmentos
            etiqueta="Agrupar los resultados"
            nombre="contenido-agrupar"
            opciones={AGRUPAR}
            valor={agrupar}
            alCambiar={setAgrupar}
          />
        }
      >
        {rendimiento.length === 0 ? (
          <p className={estilos.vacio}>
            Cuando marques una publicación como «Publicado» y le escribas las vistas, aquí aparece
            el promedio por tema, formato o plataforma.
          </p>
        ) : (
          <>
            <p className={estilos.nota}>
              Vistas promedio por publicación, con todo lo publicado hasta hoy.
            </p>
            <Barras
              formato={(valor) => formatearNumero(valor, 0)}
              filas={rendimiento.map((grupo) => ({
                nombre: grupo.nombre,
                valor: grupo.vistasPromedio,
                texto: (
                  <>
                    <strong>{formatearNumero(grupo.vistasPromedio, 0)}</strong>
                    <small>
                      {grupo.publicaciones}{' '}
                      {grupo.publicaciones === 1 ? 'publicación' : 'publicaciones'} ·{' '}
                      {formatearNumero(grupo.interaccion, 1)} % interacción
                    </small>
                  </>
                ),
              }))}
            />
            <p className={estilos.nota}>
              Con pocas publicaciones por grupo esto es una pista, no una conclusión.
            </p>
          </>
        )}
      </Tarjeta>

      <Respaldo
        herramienta="contenido"
        datos={calendario}
        esValido={esCalendario}
        alCargar={setCalendario}
      />
    </Pagina>
  )
}

/** Baja hasta la fila de esa publicación y deja el cursor en su título. */
function irA(id: string) {
  const campo = document.getElementById(`titulo-${id}`)
  campo?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  campo?.focus({ preventScroll: true })
}

interface ListaProps<T extends string> {
  clase?: string
  nombre: string
  n: number
  opciones: readonly T[]
  valor: T
  alCambiar: (valor: T) => void
}

function Lista<T extends string>({ clase, nombre, n, opciones, valor, alCambiar }: ListaProps<T>) {
  return (
    <select
      className={unir('ui-entrada', clase)}
      value={valor}
      onChange={(e) => alCambiar(e.target.value as T)}
      aria-label={`${nombre} de la publicación ${n}`}
    >
      {opciones.map((opcion) => (
        <option key={opcion}>{opcion}</option>
      ))}
    </select>
  )
}
