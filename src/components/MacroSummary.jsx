const GOAL = { kcal: 2000, protein: 150, carbs: 250, fat: 65 }

function MacroBar({ label, value, goal, color }) {
  const pct = Math.min(100, (value / goal) * 100)
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-xs text-[#888780] w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-[#F0EDE6] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-medium w-12 text-right text-[#1C1C1A]">
        {value.toFixed(0)}g
      </span>
    </div>
  )
}

export default function MacroSummary({ totals }) {
  const kcalPct = Math.min(100, (totals.kcal / GOAL.kcal) * 100)

  return (
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
          <div className="text-lg font-medium text-[#1C1C1A]">{GOAL.kcal}</div>
        </div>
      </div>

      {/* Barra principal de kcal */}
      <div className="h-2 rounded-full bg-[#F0EDE6] overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${kcalPct}%`,
            background: kcalPct > 95 ? '#E24B4A' : '#639922',
          }}
        />
      </div>

      <div className="text-[10px] font-medium uppercase tracking-widest text-[#888780] mb-2">
        Macros
      </div>
      <MacroBar label="Proteínas" value={totals.protein} goal={GOAL.protein} color="#185FA5" />
      <MacroBar label="Carbohidratos" value={totals.carbs} goal={GOAL.carbs} color="#BA7517" />
      <MacroBar label="Grasas" value={totals.fat} goal={GOAL.fat} color="#D85A30" />
    </div>
  )
}
