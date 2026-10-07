import { Membrete } from '../../shared/documento'
import { formatearNumero } from '../../shared/numero'
import { repeticionesDe, resumirSemana, tonelajeDe } from './carga'
import { DIAS, type Plan, type Semana } from './modelo'

interface Props {
  plan: Plan
  semana: Semana
}

/** El plan de la semana como lo recibe el atleta: un bloque por día. */
export function Documento({ plan, semana }: Props) {
  const tonelaje = resumirSemana(semana, 'tonelaje')
  const repeticiones = resumirSemana(semana, 'repeticiones')
  const kilos = (valor: number) => `${formatearNumero(valor, 0)} kg`

  return (
    <article className="doc">
      <Membrete
        marca={plan.atleta || 'Atleta'}
        detalle={semana.nombre}
        tipo="PLAN DE CARGAS"
        renglones={[`${tonelaje.diasDeEntrenamiento} días de entrenamiento`]}
      />

      <div className="doc-cifras">
        <div className="doc-cifra">
          <strong>{kilos(tonelaje.total)}</strong>
          <span>Tonelaje de la semana</span>
        </div>
        <div className="doc-cifra">
          <strong>{formatearNumero(repeticiones.total, 0)}</strong>
          <span>Repeticiones</span>
        </div>
        <div className="doc-cifra">
          <strong>
            {tonelaje.pesoMedio > 0 ? `${formatearNumero(tonelaje.pesoMedio, 1)} kg` : '—'}
          </strong>
          <span>Peso medio por repetición</span>
        </div>
      </div>

      {DIAS.map((dia) => {
        const ejercicios = semana.ejercicios.filter(
          (e) => e.dia === dia && (e.nombre.trim() || repeticionesDe(e) > 0),
        )
        if (ejercicios.length === 0) return null
        const delDia = tonelaje.porDia.find((d) => d.dia === dia)

        return (
          <section key={dia} style={{ breakInside: 'avoid' }}>
            <h2 className="doc-seccion">
              {dia}
              {delDia && delDia.carga > 0 ? ` · ${kilos(delDia.carga)}` : ''}
            </h2>
            <table className="doc-tabla">
              <thead>
                <tr>
                  <th scope="col">Ejercicio</th>
                  <th scope="col" className="doc-num">
                    Series × reps
                  </th>
                  <th scope="col" className="doc-num">
                    Peso
                  </th>
                  <th scope="col" className="doc-num">
                    Tonelaje
                  </th>
                </tr>
              </thead>
              <tbody>
                {ejercicios.map((ejercicio) => (
                  <tr key={ejercicio.id}>
                    <td>{ejercicio.nombre || '—'}</td>
                    <td className="doc-num">
                      {ejercicio.series || '0'} × {ejercicio.reps || '0'}
                    </td>
                    <td className="doc-num">
                      {ejercicio.kg ? `${ejercicio.kg.replace('.', ',')} kg` : '—'}
                    </td>
                    <td className="doc-num">
                      {tonelajeDe(ejercicio) > 0 ? kilos(tonelajeDe(ejercicio)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )
      })}
    </article>
  )
}
