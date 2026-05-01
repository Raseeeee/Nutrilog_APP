import { useState, useRef } from 'react'
import { analyzeImageWithGemini } from '../services/gemini'

const MEALS = ['Desayuno', 'Almuerzo', 'Cena', 'Snacks']

export default function ScanTab({ onAdd }) {
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [meal, setMeal] = useState('Almuerzo')
  const inputRef = useRef()

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setError(null)
    setLoading(true)
    try {
      const data = await analyzeImageWithGemini(file)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleAdd() {
    if (!result?.detected) return
    onAdd(
      {
        name: result.dish,
        kcal: result.estimatedPer100g.kcal,
        protein: result.estimatedPer100g.protein,
        carbs: result.estimatedPer100g.carbs,
        fat: result.estimatedPer100g.fat,
      },
      result.portionGrams || 100,
      meal
    )
    setResult(null)
    setPreview(null)
  }

  const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY

  return (
    <div>
      {!hasApiKey && (
        <div className="bg-[#FAEEDA] border border-[#FAC775] rounded-xl p-3.5 mb-4 text-sm text-[#633806]">
          <strong className="font-medium">API key no configurada.</strong>
          <p className="mt-1 text-xs leading-relaxed">
            Crea una key gratuita en{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline">
              aistudio.google.com
            </a>{' '}
            y añádela en tu archivo <code className="bg-[#F7E8C8] px-1 rounded">.env</code> como{' '}
            <code className="bg-[#F7E8C8] px-1 rounded">VITE_GEMINI_API_KEY=...</code>.
            El plan gratuito incluye 15 req/min.
          </p>
        </div>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-[#E0DED6] rounded-2xl p-8 text-center bg-white hover:border-[#639922] hover:bg-[#EAF3DE] cursor-pointer transition-colors"
      >
        {preview ? (
          <img
            src={preview}
            alt="Vista previa"
            className="max-h-48 mx-auto rounded-xl object-contain"
          />
        ) : (
          <>
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm font-medium text-[#1C1C1A]">Subir foto del plato</p>
            <p className="text-xs text-[#888780] mt-1">
              Gemini Flash identificará los alimentos y estimará las calorías
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {loading && (
        <div className="text-center py-6 text-sm text-[#888780]">
          <div className="text-2xl mb-2 animate-pulse">🔍</div>
          Analizando con Gemini Flash…
        </div>
      )}

      {error && (
        <div className="mt-3 bg-[#FCEBEB] border border-[#F7C1C1] rounded-xl p-3 text-sm text-[#A32D2D]">
          {error}
        </div>
      )}

      {result?.detected && (
        <div className="mt-3 bg-white border border-[#E0DED6] rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-medium text-[#1C1C1A]">{result.dish}</div>
              <div className="text-xs text-[#888780] mt-0.5">
                Confianza: {result.confidence} · ~{result.portionGrams}g detectados
              </div>
            </div>
            <span className="text-[10px] bg-[#EAF3DE] text-[#3B6D11] px-2 py-0.5 rounded-full font-medium">
              IA
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3 text-center">
            {[
              { label: 'Kcal', value: Math.round(result.estimatedPer100g.kcal * result.portionGrams / 100) },
              { label: 'P', value: `${(result.estimatedPer100g.protein * result.portionGrams / 100).toFixed(0)}g` },
              { label: 'C', value: `${(result.estimatedPer100g.carbs * result.portionGrams / 100).toFixed(0)}g` },
              { label: 'G', value: `${(result.estimatedPer100g.fat * result.portionGrams / 100).toFixed(0)}g` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F7F5F0] rounded-lg py-2">
                <div className="text-[10px] text-[#888780]">{label}</div>
                <div className="text-sm font-medium text-[#1C1C1A]">{value}</div>
              </div>
            ))}
          </div>

          {result.notes && (
            <p className="text-xs text-[#888780] mb-3">{result.notes}</p>
          )}

          <div className="flex gap-2 items-center">
            <select
              value={meal}
              onChange={e => setMeal(e.target.value)}
              className="flex-1 border border-[#E0DED6] rounded-lg text-sm py-1.5 px-2 bg-[#F7F5F0] text-[#1C1C1A]"
            >
              {MEALS.map(m => <option key={m}>{m}</option>)}
            </select>
            <button
              onClick={handleAdd}
              className="bg-[#639922] text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-[#3B6D11] transition-colors"
            >
              + Añadir al diario
            </button>
          </div>
        </div>
      )}

      {result && !result.detected && (
        <div className="mt-3 bg-[#FAEEDA] border border-[#FAC775] rounded-xl p-3 text-sm text-[#633806]">
          No se detectó comida en la imagen. {result.notes}
        </div>
      )}
    </div>
  )
}
