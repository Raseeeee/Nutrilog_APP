import { useState } from 'react'

const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]
const DAYS = ['L','M','X','J','V','S','D']

function getEntries(log, dateStr) {
  const d = log[dateStr]
  if (!d) return []
  return Array.isArray(d) ? d : (d.entries || [])
}

function getWater(log, dateStr) {
  const d = log[dateStr]
  if (!d || Array.isArray(d)) return 0
  return d.water || 0
}

function dayTotals(log, dateStr) {
  const entries = getEntries(log, dateStr)
  return entries.reduce(
    (a, e) => ({
      kcal:    a.kcal    + (e.kcal    || 0),
      protein: a.protein + (e.protein || 0),
      carbs:   a.carbs   + (e.carbs   || 0),
      fat:     a.fat     + (e.fat     || 0),
      fiber:   a.fiber   + (e.fiber   || 0),
      salt:    a.salt    + (e.salt    || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, salt: 0 }
  )
}

function pad(n) { return String(n).padStart(2, '0') }
function dateStr(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}` }

function kcalColor(kcal, goal) {
  if (!kcal || !goal) return null
  const pct = kcal / goal
  if (pct < 0.6)  return '#185FA5'   // muy poco — azul
  if (pct < 0.9)  return '#BA7517'   // bajo — naranja
  if (pct <= 1.05) return '#639922'  // en objetivo — verde
  if (pct <= 1.2)  return '#D85A30'  // algo pasado — naranja-rojo
  return '#E24B4A'                    // exceso — rojo
}

// ─── DayDetail ──────────────────────────────────────────────────────────────
function DayDetail({ dateStr, log, goals, onClose }) {
  const entries = getEntries(log, dateStr)
  const water   = getWater(log, dateStr)
  const totals  = dayTotals(log, dateStr)
  const g = goals || { kcal: 2000, protein: 150, carbs: 250, fat: 65, fiber: 28, salt: 5 }

  const [d, m, y] = dateStr.split('-').reverse()
  const label = `${d} de ${MONTHS[parseInt(m) - 1]} de ${y}`

  const MEALS = ['Desayuno', 'Almuerzo', 'Cena', 'Snacks']

  return (
    <div className="fixed inset-0 z-40 bg-[#F7F5F0] overflow-y-auto">
      <div className="max-w-md mx-auto px-5 pt-5 pb-20">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[#E0DED6] bg-white flex items-center justify-center text-[#888780] hover:text-[#1C1C1A]">
            ←
          </button>
          <div>
            <h2 className="font-serif text-xl text-[#1C1C1A]">{label}</h2>
            <p className="text-xs text-[#888780]">{entries.length} registros</p>
          </div>
        </div>

        {!entries.length ? (
          <div className="text-center py-16 text-[#888780]">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-sm">Sin registros este día</p>
          </div>
        ) : (
          <>
            {/* Resumen del día */}
            <div className="bg-white rounded-2xl border border-[#E0DED6] p-4 mb-4">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <div className="font-serif text-4xl text-[#1C1C1A]">{Math.round(totals.kcal)}</div>
                  <div className="text-xs text-[#888780]">kcal totales</div>
                </div>
                <div className="text-right text-xs text-[#888780]">
                  <div>Objetivo: {g.kcal} kcal</div>
                  <div className="font-medium" style={{ color: kcalColor(totals.kcal, g.kcal) }}>
                    {totals.kcal > g.kcal
                      ? `+${Math.round(totals.kcal - g.kcal)} exceso`
                      : `${Math.round(g.kcal - totals.kcal)} restantes`}
                  </div>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-[#F0EDE6] overflow-hidden mb-3">
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, totals.kcal / g.kcal * 100)}%`,
                    background: kcalColor(totals.kcal, g.kcal),
                  }} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Prot',  value: totals.protein.toFixed(0), unit: 'g', goal: g.protein, color: '#185FA5' },
                  { label: 'Carbs', value: totals.carbs.toFixed(0),   unit: 'g', goal: g.carbs,   color: '#BA7517' },
                  { label: 'Grasa', value: totals.fat.toFixed(0),     unit: 'g', goal: g.fat,     color: '#D85A30' },
                  { label: 'Fibra', value: totals.fiber.toFixed(1),   unit: 'g', goal: g.fiber,   color: '#639922' },
                  { label: 'Sal',   value: totals.salt.toFixed(1),    unit: 'g', goal: g.salt,    color: '#888780' },
                  { label: 'Agua',  value: Math.round(water / 100) / 10, unit: 'L', goal: null,   color: '#185FA5' },
                ].map(({ label, value, unit, goal, color }) => (
                  <div key={label} className="bg-[#F7F5F0] rounded-xl py-2 px-1">
                    <div className="text-[10px] text-[#888780]">{label}</div>
                    <div className="text-sm font-medium" style={{ color }}>{value}{unit}</div>
                    {goal && <div className="text-[9px] text-[#888780]">/{goal}{unit}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Comidas agrupadas */}
            {MEALS.map(meal => {
              const mealEntries = entries.filter(e => e.meal === meal)
              if (!mealEntries.length) return null
              return (
                <div key={meal} className="mb-4">
                  <div className="text-[10px] font-medium uppercase tracking-widest text-[#888780] mb-1.5">
                    {meal}
                  </div>
                  {mealEntries.map(e => (
                    <div key={e.id} className="bg-white border border-[#E0DED6] rounded-xl px-3.5 py-2.5 mb-1.5">
                      <div className="flex justify-between">
                        <div className="text-sm font-medium text-[#1C1C1A] truncate flex-1">{e.name}</div>
                        <div className="text-sm font-medium text-[#1C1C1A] ml-2">{e.kcal} kcal</div>
                      </div>
                      <div className="text-xs text-[#888780] mt-0.5">
                        {e.qty}g · P:{e.protein}g C:{e.carbs}g G:{e.fat}g
                        {e.fiber ? ` · F:${e.fiber}g` : ''}
                        {e.salt  ? ` · Sal:${e.salt}g` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}

// ─── CalendarTab principal ───────────────────────────────────────────────────
export default function CalendarTab({ log, goals }) {
  const now = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState(null)

  const g = goals || { kcal: 2000 }
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

  // Días del mes
  const firstDay = new Date(year, month, 1)
  const totalDays = new Date(year, month + 1, 0).getDate()
  // Lunes=0, así que ajustar (getDay devuelve 0=domingo)
  const startOffset = (firstDay.getDay() + 6) % 7

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  // Estadísticas del mes
  const monthDays = Array.from({ length: totalDays }, (_, i) => i + 1)
  const daysWithData = monthDays.filter(d => {
    const ds = dateStr(year, month, d)
    return getEntries(log, ds).length > 0
  })
  const monthTotalKcal = daysWithData.reduce((sum, d) => {
    return sum + dayTotals(log, dateStr(year, month, d)).kcal
  }, 0)

  // Leyenda de colores
  const legend = [
    { color: '#185FA5', label: '<60% objetivo' },
    { color: '#BA7517', label: '60–90%' },
    { color: '#639922', label: 'En objetivo' },
    { color: '#D85A30', label: '105–120%' },
    { color: '#E24B4A', label: '>120%' },
  ]

  if (selectedDay) {
    return (
      <DayDetail
        dateStr={selectedDay}
        log={log}
        goals={goals}
        onClose={() => setSelectedDay(null)}
      />
    )
  }

  return (
    <div>
      {/* Navegación mes/año */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth}
          className="w-8 h-8 rounded-lg border border-[#E0DED6] bg-white flex items-center justify-center text-[#888780] hover:bg-[#EAF3DE] active:scale-95 transition-all">
          ‹
        </button>
        <div className="text-center">
          <div className="font-serif text-lg text-[#1C1C1A]">{MONTHS[month]}</div>
          <div className="text-xs text-[#888780]">{year}</div>
        </div>
        <button
          onClick={nextMonth}
          disabled={year === now.getFullYear() && month === now.getMonth()}
          className="w-8 h-8 rounded-lg border border-[#E0DED6] bg-white flex items-center justify-center text-[#888780] hover:bg-[#EAF3DE] active:scale-95 transition-all disabled:opacity-30"
        >›</button>
      </div>

      {/* Resumen del mes */}
      {daysWithData.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E0DED6] p-3.5 mb-3">
          <div className="flex justify-between text-sm">
            <div>
              <div className="text-xs text-[#888780]">Días registrados</div>
              <div className="font-medium text-[#1C1C1A]">{daysWithData.length} / {totalDays}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#888780]">Media diaria</div>
              <div className="font-medium text-[#1C1C1A]">
                {daysWithData.length ? Math.round(monthTotalKcal / daysWithData.length) : 0} kcal
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#888780]">Total mes</div>
              <div className="font-medium text-[#1C1C1A]">{Math.round(monthTotalKcal / 1000)}k kcal</div>
            </div>
          </div>
        </div>
      )}

      {/* Cabecera días de la semana */}
      <div className="bg-white rounded-2xl border border-[#E0DED6] p-3 mb-3">
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-[#888780] py-1">{d}</div>
          ))}
        </div>

        {/* Grid del calendario */}
        <div className="grid grid-cols-7 gap-0.5">
          {/* Celdas vacías antes del primer día */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Días del mes */}
          {monthDays.map(day => {
            const ds = dateStr(year, month, day)
            const entries = getEntries(log, ds)
            const hasData = entries.length > 0
            const totals  = hasData ? dayTotals(log, ds) : null
            const color   = hasData ? kcalColor(totals.kcal, g.kcal) : null
            const isToday = ds === today

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(ds)}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-all active:scale-90 ${
                  isToday
                    ? 'ring-2 ring-[#639922]'
                    : ''
                } ${
                  hasData
                    ? 'hover:opacity-80 cursor-pointer'
                    : 'cursor-default'
                }`}
                style={{
                  background: hasData ? color + '22' : 'transparent',
                }}
              >
                <span className={`text-xs font-medium ${
                  isToday ? 'text-[#639922]' :
                  hasData ? 'text-[#1C1C1A]' : 'text-[#C0BDB4]'
                }`}>{day}</span>
                {hasData && (
                  <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: color }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="bg-white rounded-xl border border-[#E0DED6] p-3">
        <div className="text-[10px] font-medium uppercase tracking-widest text-[#888780] mb-2">
          Leyenda de calorías
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {legend.map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-[10px] text-[#888780]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
