const MEALS = ['Desayuno', 'Almuerzo', 'Cena', 'Snacks']

function FoodItem({ entry, onRemove }) {
  return (
    <div className="bg-white border border-[#E0DED6] rounded-xl px-3.5 py-2.5 flex justify-between items-center mb-1.5">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-[#1C1C1A] truncate">{entry.name}</div>
        <div className="text-xs text-[#888780] mt-0.5">
          {entry.qty}g · {entry.kcal} kcal · P:{entry.protein}g C:{entry.carbs}g G:{entry.fat}g
        </div>
      </div>
      <button
        onClick={() => onRemove(entry.id)}
        className="ml-2 text-[#888780] hover:text-[#E24B4A] hover:bg-[#FCEBEB] rounded px-1.5 py-0.5 text-lg leading-none transition-colors"
      >
        ×
      </button>
    </div>
  )
}

export default function TodayTab({ entries, onRemove }) {
  if (!entries.length) {
    return (
      <div className="text-center py-12 text-[#888780]">
        <div className="text-4xl mb-2">🥗</div>
        <p className="text-sm">Todavía no has registrado nada hoy.</p>
        <p className="text-xs mt-1">Usa la pestaña Buscar para añadir alimentos.</p>
      </div>
    )
  }

  return (
    <div>
      {MEALS.map(meal => {
        const mealEntries = entries.filter(e => e.meal === meal)
        if (!mealEntries.length) return null
        return (
          <div key={meal} className="mb-4">
            <div className="text-[10px] font-medium uppercase tracking-widest text-[#888780] mb-1.5">
              {meal}
            </div>
            {mealEntries.map(entry => (
              <FoodItem key={entry.id} entry={entry} onRemove={onRemove} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
