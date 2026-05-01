import { useState, useRef } from 'react'
import { analyzeImageWithGemini } from '../services/gemini'
import { getProductByBarcode } from '../services/openFoodFacts'
import { readBarcodeFromFile } from '../services/barcodeScanner'

const MEALS = ['Desayuno', 'Almuerzo', 'Cena', 'Snacks']

function ResultCard({ result, onAdd }) {
  const [qty, setQty]   = useState(result.portionGrams || 100)
  const [meal, setMeal] = useState('Almuerzo')

  const per1g = {
    kcal:    result.estimatedPer100g.kcal    / 100,
    protein: result.estimatedPer100g.protein / 100,
    carbs:   result.estimatedPer100g.carbs   / 100,
    fat:     result.estimatedPer100g.fat     / 100,
    fiber:   (result.estimatedPer100g.fiber  || 0) / 100,
    salt:    (result.estimatedPer100g.salt   || 0) / 100,
  }

  const c = {
    kcal:    Math.round(per1g.kcal    * qty),
    protein: (per1g.protein * qty).toFixed(1),
    carbs:   (per1g.carbs   * qty).toFixed(1),
    fat:     (per1g.fat     * qty).toFixed(1),
    fiber:   (per1g.fiber   * qty).toFixed(1),
    salt:    (per1g.salt    * qty).toFixed(2),
  }

  return (
    <div className="bg-white border border-[#E0DED6] rounded-xl p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-medium text-[#1C1C1A]">{result.dish}</div>
          {result.brand && <div className="text-xs text-[#888780]">{result.brand}</div>}
          <div className="text-xs text-[#888780] mt-0.5">
            {result.source === 'barcode' ? '📦 Código de barras (datos exactos)' : `📷 IA · Confianza: ${result.confidence}`}
          </div>
        </div>
        <span className="text-[10px] bg-[#EAF3DE] text-[#3B6D11] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2">
          {result.source === 'barcode' ? 'OFF' : 'IA'}
        </span>
      </div>

      {/* Editor de cantidad */}
      <div className="bg-[#F7F5F0] rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#1C1C1A]">Cantidad a ingerir</span>
          <span className="text-xs text-[#888780]">{result.estimatedPer100g.kcal} kcal/100g</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => setQty(q => Math.max(1, q - 5))}
            className="w-8 h-8 rounded-lg border border-[#E0DED6] bg-white text-lg flex items-center justify-center hover:bg-[#EAF3DE] active:scale-95 transition-all">−</button>
          <input type="number" min={1} max={5000} value={qty}
            onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))}
            className="flex-1 border border-[#E0DED6] rounded-lg text-center text-sm py-1.5 bg-white text-[#1C1C1A] font-medium" />
          <span className="text-sm text-[#888780] shrink-0">g</span>
          <button onClick={() => setQty(q => q + 5)}
            className="w-8 h-8 rounded-lg border border-[#E0DED6] bg-white text-lg flex items-center justify-center hover:bg-[#EAF3DE] active:scale-95 transition-all">+</button>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[25, 30, 35, 50, 100, 150, 200].map(g => (
            <button key={g} onClick={() => setQty(g)}
              className={`px-2 py-0.5 rounded-md text-xs transition-all ${qty === g ? 'bg-[#639922] text-white' : 'bg-white border border-[#E0DED6] text-[#888780] hover:border-[#639922]'}`}
            >{g}g</button>
          ))}
        </div>
      </div>

      {/* Macros dinámicos */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {[
          { label: 'Kcal',   value: c.kcal,    unit: '' },
          { label: 'Prot',   value: c.protein, unit: 'g' },
          { label: 'Carbs',  value: c.carbs,   unit: 'g' },
          { label: 'Grasa',  value: c.fat,     unit: 'g' },
          { label: 'Fibra',  value: c.fiber,   unit: 'g' },
          { label: 'Sal',    value: c.salt,    unit: 'g' },
        ].map(({ label, value, unit }) => (
          <div key={label} className="bg-[#F7F5F0] rounded-lg py-2 text-center">
            <div className="text-[10px] text-[#888780]">{label}</div>
            <div className="text-sm font-medium text-[#1C1C1A]">{value}{unit}</div>
          </div>
        ))}
      </div>

      {result.notes && <p className="text-xs text-[#888780] mb-3">{result.notes}</p>}

      <div className="flex gap-2 items-center">
        <select value={meal} onChange={e => setMeal(e.target.value)}
          className="flex-1 border border-[#E0DED6] rounded-lg text-sm py-1.5 px-2 bg-[#F7F5F0] text-[#1C1C1A]">
          {MEALS.map(m => <option key={m}>{m}</option>)}
        </select>
        <button onClick={() => onAdd({ name: result.dish, brand: result.brand || '',
            kcal: result.estimatedPer100g.kcal, protein: result.estimatedPer100g.protein,
            carbs: result.estimatedPer100g.carbs, fat: result.estimatedPer100g.fat,
            fiber: result.estimatedPer100g.fiber || 0, salt: result.estimatedPer100g.salt || 0 }, qty, meal)}
          className="bg-[#639922] text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-[#3B6D11] transition-colors whitespace-nowrap">
          + Añadir
        </button>
      </div>
    </div>
  )
}

export default function ScanTab({ onAdd }) {
  const [preview, setPreview] = useState(null)
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError]     = useState(null)
  const [barcode, setBarcode] = useState('')

  const cameraRef  = useRef()
  const galleryRef = useRef()
  const barcodeRef = useRef()

  const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY

  function reset() {
    setPreview(null); setResult(null); setError(null); setBarcode(''); setLoading(false)
  }

  async function handleImageFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setPreview(URL.createObjectURL(file))
    setResult(null); setError(null); setLoading(true)
    setLoadingMsg('Analizando plato con Gemini 2.5 Flash…')
    try {
      const data = await analyzeImageWithGemini(file)
      if (data.detected) setResult({ ...data, source: 'photo' })
      else setError('No se detectó comida. ' + (data.notes || ''))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleBarcodeImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setPreview(URL.createObjectURL(file))
    setResult(null); setError(null); setLoading(true)

    try {
      // 1. Leer código con @zxing (sin IA, preciso)
      setLoadingMsg('Leyendo código de barras…')
      const code = await readBarcodeFromFile(file)

      if (!code) {
        setError('No se detectó código de barras. Intenta con mejor iluminación y enfoque, o acerca más la cámara.')
        setLoading(false)
        return
      }
      setBarcode(code)

      // 2. Buscar en OpenFoodFacts
      setLoadingMsg(`Código ${code} · Buscando en OpenFoodFacts…`)
      const product = await getProductByBarcode(code)
      if (!product) {
        setError(`Código ${code} no encontrado en OpenFoodFacts. El producto puede no estar en la base de datos aún. Prueba a buscarlo por nombre en la pestaña "Buscar".`)
        setLoading(false)
        return
      }

      setResult({
        dish:   product.name,
        brand:  product.brand,
        source: 'barcode',
        confidence: 'alta',
        portionGrams: 100,
        notes: product.quantity ? `Envase: ${product.quantity}` : '',
        estimatedPer100g: {
          kcal:    product.kcal,
          protein: product.protein,
          carbs:   product.carbs,
          fat:     product.fat,
          fiber:   product.fiber,
          salt:    product.salt,
        },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleAdd(food, qty, meal) {
    onAdd(food, qty, meal)
    reset()
  }

  return (
    <div>
      {!hasApiKey && (
        <div className="bg-[#FAEEDA] border border-[#FAC775] rounded-xl p-3.5 mb-4 text-sm text-[#633806]">
          <strong className="font-medium">API key no configurada.</strong>
          <p className="mt-1 text-xs">Añádela en Vercel → Settings → Environment Variables como <code className="bg-[#F7E8C8] px-1 rounded">VITE_GEMINI_API_KEY</code>.</p>
        </div>
      )}

      {preview && (
        <div className="relative mb-3">
          <img src={preview} alt="Vista previa"
            className="w-full max-h-48 object-contain rounded-2xl border border-[#E0DED6] bg-white" />
          {barcode && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
              📦 {barcode}
            </div>
          )}
          <button onClick={reset}
            className="absolute top-2 right-2 bg-white border border-[#E0DED6] rounded-full w-7 h-7 text-[#888780] hover:text-[#E24B4A] text-sm flex items-center justify-center">
            ×
          </button>
        </div>
      )}

      {!result && !loading && (
        <>
          {!preview && (
            <div className="bg-white border border-[#E0DED6] rounded-2xl p-5 mb-3 text-center">
              <div className="text-3xl mb-1">🍽️</div>
              <p className="text-sm font-medium text-[#1C1C1A]">Escanea o fotografía</p>
              <p className="text-xs text-[#888780] mt-1">
                Foto → IA · Código de barras → datos exactos sin consumir cuota de IA
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 mb-2">
            <button onClick={() => cameraRef.current?.click()}
              className="flex flex-col items-center gap-1 bg-[#639922] text-white rounded-xl py-3 px-2 hover:bg-[#3B6D11] active:scale-95 transition-all">
              <span className="text-xl">📷</span>
              <span className="text-[11px] font-medium">Cámara</span>
            </button>
            <button onClick={() => galleryRef.current?.click()}
              className="flex flex-col items-center gap-1 bg-white border border-[#E0DED6] text-[#1C1C1A] rounded-xl py-3 px-2 hover:border-[#639922] hover:bg-[#EAF3DE] active:scale-95 transition-all">
              <span className="text-xl">🖼️</span>
              <span className="text-[11px] font-medium">Galería</span>
            </button>
            <button onClick={() => barcodeRef.current?.click()}
              className="flex flex-col items-center gap-1 bg-white border border-[#E0DED6] text-[#1C1C1A] rounded-xl py-3 px-2 hover:border-[#639922] hover:bg-[#EAF3DE] active:scale-95 transition-all">
              <span className="text-xl">📦</span>
              <span className="text-[11px] font-medium">Código barras</span>
            </button>
          </div>
          <p className="text-[10px] text-[#888780] text-center mb-1">
            Foto de plato → Gemini 2.5 Flash · Código de barras → @zxing (sin IA)
          </p>
        </>
      )}

      <input ref={cameraRef}  type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageFile} />
      <input ref={galleryRef} type="file" accept="image/*"                        className="hidden" onChange={handleImageFile} />
      <input ref={barcodeRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleBarcodeImage} />

      {loading && (
        <div className="text-center py-6 text-sm text-[#888780]">
          <div className="text-2xl mb-2 animate-pulse">🔍</div>
          {loadingMsg}
        </div>
      )}

      {error && !loading && (
        <div className="bg-[#FCEBEB] border border-[#F7C1C1] rounded-xl p-3 text-sm text-[#A32D2D]">
          {error}
          <button onClick={reset} className="block mt-2 text-xs underline">Intentar de nuevo</button>
        </div>
      )}

      {result && !loading && <ResultCard result={result} onAdd={handleAdd} />}
    </div>
  )
}
