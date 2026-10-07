import { Download, FileSpreadsheet, Plus, Trash2 } from 'lucide-react'
import { descargarTexto, paraNombreDeArchivo } from '../../shared/archivo'
import { aCsv } from '../../shared/csv'
import { aMilisegundos, formatearFechaCorta } from '../../shared/fecha'
import { GraficoLinea } from '../../shared/graficos'
import { imprimirConTitulo } from '../../shared/imprimir'
import { cambiarEnLista } from '../../shared/lista'
import { Respaldo } from '../../shared/Respaldo'
import {
  Boton,
  Campo,
  CampoSelect,
  Encabezado,
  Indicador,
  Indicadores,
  Pagina,
  Tarjeta,
} from '../../shared/ui'
import { useGuardadoLocal } from '../../shared/useGuardadoLocal'
import { Documento } from './Documento'
import { ejemploDeMarca, formatearMarca, leerMarca } from './marca'
import estilos from './marcas.module.css'
import {
  type Bitacora,
  bitacoraInicial,
  CLAVE_GUARDADO,
  esBitacora,
  type Registro,
  registroVacio,
} from './modelo'
import { buscarPrueba, GRUPOS, PRUEBAS, type Prueba } from './pruebas'
import { contarPorPrueba, type Resumen, resumir, textoDeCambio } from './resumen'

export default function Marcas() {
  const [bitacora, setBitacora] = useGuardadoLocal<Bitacora>(
    CLAVE_GUARDADO,
    bitacoraInicial,
    esBitacora,
  )
  const prueba = buscarPrueba(bitacora.pruebaActiva)
  const resumen = resumir(bitacora.registros, prueba)
  const conteo = contarPorPrueba(bitacora.registros)
  const filas = bitacora.registros.filter((registro) => registro.prueba === prueba.id)

  const cambiar = (cambios: Partial<Bitacora>) => setBitacora((prev) => ({ ...prev, ...cambios }))
  const cambiarRegistro = (id: string, cambios: Partial<Registro>) =>
    setBitacora((prev) => ({ ...prev, registros: cambiarEnLista(prev.registros, id, cambios) }))
  // La marca nueva va arriba: es la que la persona acaba de hacer y quiere escribir ya.
  const agregar = () =>
    setBitacora((prev) => ({ ...prev, registros: [registroVacio(prueba.id), ...prev.registros] }))
  const quitar = (id: string) =>
    setBitacora((prev) => ({
      ...prev,
      registros: prev.registros.filter((registro) => registro.id !== id),
    }))

  const formato = (valor: number) => formatearMarca(valor, prueba.unidad)

  const exportarCsv = () => {
    const encabezado = ['Prueba', 'Fecha', 'Marca', `Valor`, 'Unidad', 'Lugar o nota']
    const cuerpo = PRUEBAS.flatMap((p) =>
      resumir(bitacora.registros, p).marcas.map((marca) => [
        p.nombre,
        marca.fecha,
        formatearMarca(marca.valor, p.unidad),
        marca.valor,
        p.unidad,
        marca.lugar,
      ]),
    )
    descargarTexto(
      `marcas-${paraNombreDeArchivo(bitacora.atleta, 'atleta')}.csv`,
      aCsv([encabezado, ...cuerpo]),
      'text/csv',
    )
  }

  return (
    <>
      <Pagina>
        <Encabezado
          titulo="Registro de marcas"
          descripcion="Lleva tus marcas por prueba, mira cómo vas y saca un reporte para tu entrenador."
        >
          <Boton onClick={exportarCsv} disabled={conteo.size === 0}>
            <FileSpreadsheet size={16} aria-hidden /> Excel (CSV)
          </Boton>
          <Boton
            variante="primario"
            onClick={() => imprimirConTitulo(`Marcas ${prueba.nombre} ${bitacora.atleta}`.trim())}
            disabled={resumen.marcas.length === 0}
          >
            <Download size={16} aria-hidden /> Reporte PDF
          </Boton>
        </Encabezado>

        <div className="ui-columnas-3">
          <Campo
            etiqueta="Atleta"
            value={bitacora.atleta}
            onChange={(e) => cambiar({ atleta: e.target.value })}
            autoComplete="name"
          />
          <Campo
            etiqueta="Entrenador"
            value={bitacora.entrenador}
            onChange={(e) => cambiar({ entrenador: e.target.value })}
            placeholder="Opcional"
            autoComplete="off"
          />
          <CampoSelect
            etiqueta="Prueba"
            value={prueba.id}
            onChange={(e) => cambiar({ pruebaActiva: e.target.value })}
          >
            {GRUPOS.map((grupo) => (
              <optgroup key={grupo} label={grupo}>
                {PRUEBAS.filter((p) => p.grupo === grupo).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                    {conteo.has(p.id) ? ` (${conteo.get(p.id)})` : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </CampoSelect>
        </div>

        {resumen.mejor && resumen.ultima && (
          <div aria-live="polite">
            <Indicadores>
              <Indicador
                principal
                etiqueta="Mejor marca"
                valor={formato(resumen.mejor.valor)}
                detalle={[formatearFechaCorta(resumen.mejor.fecha), resumen.mejor.lugar]
                  .filter(Boolean)
                  .join(' · ')}
              />
              <Indicador
                etiqueta="Última marca"
                valor={formato(resumen.ultima.valor)}
                detalle={formatearFechaCorta(resumen.ultima.fecha)}
              />
              {resumen.mejorDelAnio && (
                <Indicador
                  etiqueta={`Mejor de ${resumen.ultima.fecha.slice(0, 4)}`}
                  valor={formato(resumen.mejorDelAnio.valor)}
                  detalle={formatearFechaCorta(resumen.mejorDelAnio.fecha)}
                />
              )}
              <IndicadorDeCambio resumen={resumen} prueba={prueba} />
            </Indicadores>
          </div>
        )}

        {resumen.marcas.length > 1 && (
          <Tarjeta titulo={`Evolución en ${prueba.nombre.toLowerCase()}`}>
            <GraficoLinea
              titulo={`Marcas de ${prueba.nombre} de ${bitacora.atleta || 'el atleta'} en el tiempo`}
              medida="Marca"
              formato={formato}
              puntos={resumen.marcas.map((marca) => ({
                x: aMilisegundos(marca.fecha),
                etiqueta: formatearFechaCorta(marca.fecha),
                valor: marca.valor,
                destacado: marca.id === resumen.mejor?.id,
              }))}
            />
            {prueba.mejor === 'menor' && (
              <p className={estilos.nota}>En esta prueba, más abajo es mejor.</p>
            )}
          </Tarjeta>
        )}

        <Tarjeta titulo={`Marcas de ${prueba.nombre.toLowerCase()}`}>
          {filas.length === 0 ? (
            <p className={estilos.vacio}>Todavía no hay marcas en esta prueba.</p>
          ) : (
            <>
              <div className={estilos.cabecera} aria-hidden>
                <span>Fecha</span>
                <span>Marca</span>
                <span>Competencia, lugar o nota</span>
                <span />
              </div>
              {filas.map((registro, indice) => {
                const noSeEntiende =
                  registro.marca.trim() !== '' && leerMarca(registro.marca, prueba.unidad) === null
                return (
                  <div key={registro.id} className={estilos.fila}>
                    <input
                      className="ui-entrada"
                      type="date"
                      value={registro.fecha}
                      onChange={(e) => cambiarRegistro(registro.id, { fecha: e.target.value })}
                      aria-label={`Fecha de la marca ${indice + 1}`}
                    />
                    <div className={estilos.marca}>
                      <input
                        className="ui-entrada"
                        inputMode={prueba.unidad === 's' ? 'text' : 'decimal'}
                        value={registro.marca}
                        onChange={(e) => cambiarRegistro(registro.id, { marca: e.target.value })}
                        placeholder={ejemploDeMarca(prueba.unidad)}
                        aria-label={`Marca ${indice + 1} en ${unidadLarga(prueba)}`}
                        aria-invalid={noSeEntiende}
                      />
                      <span className={estilos.unidad} aria-hidden>
                        {prueba.unidad}
                      </span>
                    </div>
                    <input
                      className={`ui-entrada ${estilos.lugar}`}
                      value={registro.lugar}
                      onChange={(e) => cambiarRegistro(registro.id, { lugar: e.target.value })}
                      placeholder="Ej.: Grand Prix de Cali"
                      aria-label={`Lugar o nota de la marca ${indice + 1}`}
                    />
                    <Boton
                      variante="icono"
                      className={estilos.quitar}
                      onClick={() => quitar(registro.id)}
                      aria-label={`Quitar la marca ${indice + 1}`}
                    >
                      <Trash2 size={16} aria-hidden />
                    </Boton>
                    {noSeEntiende && (
                      <p className={estilos.error} role="alert">
                        No se entiende esta marca. Escríbela como {ejemploDeMarca(prueba.unidad)}.
                      </p>
                    )}
                  </div>
                )
              })}
            </>
          )}
          <Boton variante="punteado" onClick={agregar}>
            <Plus size={14} aria-hidden /> Agregar marca
          </Boton>
        </Tarjeta>

        <Respaldo
          herramienta="marcas"
          datos={bitacora}
          esValido={esBitacora}
          alCargar={setBitacora}
        />
      </Pagina>

      <div className="solo-impresion">
        <Documento bitacora={bitacora} prueba={prueba} resumen={resumen} />
      </div>
    </>
  )
}

function unidadLarga(prueba: Prueba): string {
  const nombres = { m: 'metros', cm: 'centímetros', kg: 'kilos', s: 'tiempo', pts: 'puntos' }
  return nombres[prueba.unidad]
}

function IndicadorDeCambio({ resumen, prueba }: { resumen: Resumen; prueba: Prueba }) {
  const texto = textoDeCambio(resumen, prueba)
  if (!texto || !resumen.cambio) return null
  const tono = resumen.cambio.igual ? 'neutro' : resumen.cambio.mejoro ? 'bien' : 'mal'
  return (
    <Indicador
      etiqueta="Primera a última"
      valor={texto.valor}
      detalle={texto.detalle}
      tono={tono}
    />
  )
}
