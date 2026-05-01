import { useState } from 'react'
import { searchFoods } from '../services/openFoodFacts'

const MEALS = ['Desayuno', 'Almuerzo', 'Cena', 'Snacks']

function ResultCard({ product, onAdd }) {
  const [expanded, setExpanded] = useState(false)
  const [qty, setQty] = useState(100)
  const [meal, setMeal] = useState('Almuerzo')

  return (
    <div className="bg-white border border-[#E0DED6] rounded-xl px-3.5 py-2.5 mb-2">
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-[#1C1C1A] truncate">{product.name}</div>
          {product.brand && (
            <div className="text-xs text-[#888780]">{product.brand}</div>
          )}
          <div className="text-xs text-[#888780] mt-0.5">
            {Math.round(product.kcal)} kcal/100g · P:{product.protein.toFixed(1)}g C:{product.carbs.toFixed(1)}g G:{product.fat.toFixed(1)}g
          </div>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="ml-2 shrink-0 bg-[#EAF3DE] text-[#3B6D11] text-xs font-medium px-3 py-1 rounded-lg hover:bg-[#C0DD97] transition-colors"
        >
          {expanded ? 'Cancelar' : 'Añadir'}
        </button>
      </div>

      {expanded && (
        <div className="mt-2.5 pt-2.5 border-t border-[#E0DED6] flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={2000}
              value={qty}
              onChange={e => setQty(Number(e.target.value))}
              className="w-16 border border-[#E0DED6] rounded-lg text-center text-sm py-1 px-2 bg-[#F7F5F0] text-[#1C1C1A]"
            />
            <span className="text-xs text-[#888780]">g</span>
          </div>
          <select
            value={meal}
            onChange={e => setMeal(e.target.value)}
            className="border border-[#E0DED6] rounded-lg text-xs py-1 px-2 bg-[#F7F5F0] text-[#1C1C1A]"
          >
            {MEALS.map(m => <option key={m}>{m}</option>)}
          </select>
          <button
            onClick={() => { onAdd(product, qty, meal); setExpanded(false) }}
            className="bg-[#639922] text-white text-xs font-medium px-3 py-1 rounded-lg hover:bg-[#3B6D11] transition-colors"
          >
            + Confirmar
          </button>
          <span className="text-xs text-[#888780]">
            ≈ {Math.round(product.kcal * qty / 100)} kcal
          </span>
        </div>
      )}
    </div>
  )
}

export default function SearchTab({ onAdd }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const data = await searchFoods(q, 10)
      setResults(data)
    } catch (e) {
      setError('Error al buscar. Comprueba tu conexión a internet.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Buscar alimento… (ej: avena, pollo)"
          className="flex-1 bg-white border border-[#E0DED6] rounded-xl px-3.5 py-2.5 text-sm text-[#1C1C1A] placeholder-[#888780] outline-none focus:border-[#639922]"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-[#639922] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#3B6D11] disabled:opacity-50 transition-colors"
        >
          {loading ? '…' : 'Buscar'}
        </button>
      </div>

      <p className="text-[10px] text-[#888780] mb-3">
        Datos de{' '}
        <a href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer" className="underline">
          OpenFoodFacts
        </a>{' '}
        — base de datos libre de alimentos colaborativa
      </p>

      {error && <p className="text-sm text-[#E24B4A] mb-3">{error}</p>}

      {loading && <p className="text-sm text-[#888780] text-center py-6">Buscando…</p>}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-8 text-[#888780]">
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-sm">Sin resultados.</p>
          <p className="text-xs mt-1">Prueba en inglés o usa términos más genéricos.</p>
        </div>
      )}

      {results.map(product => (
        <ResultCard key={product.id} product={product} onAdd={onAdd} />
      ))}
    </div>
  )
}
