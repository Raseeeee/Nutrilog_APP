function MacroBar({ label, value, goal, color, unit = 'g', decimals = 0 }) {
  const pct = Math.min(100, goal > 0 ? (value / goal) * 100 : 0)
  const over = pct >= 100
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-xs text-[#888780] w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-[#F0EDE6] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: over ? '#E24B4A' : color }} />
      </div>
      <span className={`text-xs font-medium w-14 text-right ${over ? 'text-[#E24B4A]' : 'text-[#1C1C1A]'}`}>
        {value.toFixed(decimals)}{unit}
        <span className="text-[#888780] font-normal">/{goal}{unit}</span>
      </span>
    </div>
  )
}

// Componente del agua
function WaterTracker({ water, goal, onAdd }) {
  const glasses      = Math.round(water / 250)  // vasos de 250ml
  const goalGlasses  = Math.ceil(goal / 250)
  const pct          = Math.min(100, (water / goal) * 100)

  return (
    <div className="bg-white rounded-2xl border border-[#E0DED6] p-4 mb-3">
      <div className="flex justify-between items-center mb-3">
        <div>
          <div className="text-sm font-medium text-[#1C1C1A]">💧 Hidratación</div>
          <div className="text-xs text-[#888780]">{water} ml de {goal} ml</div>
        </div>
        <div className="text-right">
          <div className="font-serif text-2xl text-[#185FA5]">{glasses}</div>
          <div className="text-[10px] text-[#888780]">de {goalGlasses} vasos</div>
        </div>
      </div>

      {/* Vasos visuales */}
      <div className="flex gap-1 flex-wrap mb-3">
        {Array.from({ length: goalGlasses }).map((_, i) => (
          <div key={i}
            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center text-sm transition-all ${
              i < glasses
                ? 'bg-[#185FA5] border-[#185FA5] text-white'
                : 'bg-white border-[#E0DED6] text-[#E0DED6]'
            }`}
          >
            {i < glasses ? '💧' : '○'}
          </div>
        ))}
      </div>

      {/* Barra de progreso */}
      <div className="h-1.5 rounded-full bg-[#F0EDE6] overflow-hidden mb-3">
        <div className="h-full rounded-full bg-[#185FA5] transition-all duration-500"
          style={{ width: `${pct}%` }} />
      </div>

      {/* Botones para añadir agua */}
      <div className="flex gap-1.5">
        {[150, 250, 330, 500].map(ml => (
          <button key={ml} onClick={() => onAdd(ml)}
            className="flex-1 py-1.5 rounded-lg border border-[#E0DED6] text-xs text-[#1C1C1A] hover:bg-[#EAF3DE] hover:border-[#639922] active:scale-95 transition-all"
          >+{ml < 1000 ? `${ml}ml` : `${ml/1000}L`}</button>
        ))}
        {water > 0 && (
          <button onClick={() => onAdd(-250)}
            className="px-2 py-1.5 rounded-lg border border-[#E0DED6] text-xs text-[#888780] hover:bg-[#FCEBEB] hover:border-[#E24B4A] transition-all"
          >↩</button>
        )}
      </div>
    </div>
  )
}

export default function MacroSummary({ totals, goals, water, onAddWater }) {
  const g = goals || { kcal: 2000, protein: 150, carbs: 250, fat: 65, fiber: 28, salt: 5, water: 2500 }
  const kcalPct = Math.min(100, (totals.kcal / g.kcal) * 100)

  return (
    <>
      {/* Calorías + macros principales */}
      <div className="bg-white rounded-2xl border border-[#E0DED6] p-4 mb-3">
        <div className="flex justify-between items-end mb-3">
          <div>
            <div className="font-serif text-5xl leading-none text-[#1C1C1A]">
              {Math.round(totals.kcal)}
            </div>
            <div className="text-xs text-[#888780] mt-0.5">kcal consumidas</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#888780]">objetivo</div>
            <div className="text-lg font-medium text-[#1C1C1A]">{g.kcal}</div>
            <div className="text-xs text-[#639922]">
              {Math.max(0, g.kcal - Math.round(totals.kcal))} restantes
            </div>
          </div>
        </div>

        <div className="h-2 rounded-full bg-[#F0EDE6] overflow-hidden mb-4">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${kcalPct}%`, background: kcalPct > 95 ? '#E24B4A' : '#639922' }} />
        </div>

        <div className="text-[10px] font-medium uppercase tracking-widest text-[#888780] mb-2">Macros</div>
        <MacroBar label="Proteínas"      value={totals.protein} goal={g.protein} color="#185FA5" />
        <MacroBar label="Carbohidratos"  value={totals.carbs}   goal={g.carbs}   color="#BA7517" />
        <MacroBar label="Grasas"         value={totals.fat}     goal={g.fat}     color="#D85A30" />

        <div className="mt-3 pt-3 border-t border-[#F0EDE6]">
          <div className="text-[10px] font-medium uppercase tracking-widest text-[#888780] mb-2">Otros nutrientes</div>
          <MacroBar label="Fibra"  value={totals.fiber}              goal={g.fiber} color="#639922" />
          <MacroBar label="Sal"    value={totals.salt}               goal={g.salt}  color="#888780" decimals={1} />
        </div>
      </div>

      {/* Agua */}
      <WaterTracker water={water} goal={g.water} onAdd={onAddWater} />
    </>
  )
}
