import { useState, useRef } from 'react'
import { analyzeImageWithGemini } from '../services/gemini'
import { getProductByBarcode } from '../services/openFoodFacts'

const MEALS = ['Desayuno', 'Almuerzo', 'Cena', 'Snacks']

// ─── Modo activo del scanner ────────────────────────────────────────────────
const MODES = {
  IDLE:    'idle',
  PHOTO:   'photo',
  BARCODE: 'barcode',
}

// ─── Componente de resultado editable ───────────────────────────────────────
function ResultCard({ result, onAdd }) {
  const [qty, setQty] = useState(result.portionGrams || 100)
  const [meal, setMeal] = useState('Almuerzo')

  const per1g = {
    kcal:    result.estimatedPer100g.kcal    / 100,
    protein: result.estimatedPer100g.protein / 100,
    carbs:   result.estimatedPer100g.carbs   / 100,
    fat:     result.estimatedPer100g.fat     / 100,
  }

  const computed = {
    kcal:    Math.round(per1g.kcal    * qty),
    protein: (per1g.protein * qty).toFixed(1),
    carbs:   (per1g.carbs   * qty).toFixed(1),
    fat:     (per1g.fat     * qty).toFixed(1),
  }

  return (
    <div className="bg-white border border-[#E0DED6] rounded-xl p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-medium text-[#1C1C1A]">{result.dish}</div>
          {result.brand && (
            <div className="text-xs text-[#888780]">{result.brand}</div>
          )}
          <div className="text-xs text-[#888780] mt-0.5">
            {result.source === 'barcode'
              ? '📦 Escaneado de código de barras'
              : `📷 IA · Confianza: ${result.confidence}`}
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
          <span className="text-xs text-[#888780]">
            {result.estimatedPer100g.kcal} kcal / 100g
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQty(q => Math.max(1, q - 5))}
            className="w-8 h-8 rounded-lg border border-[#E0DED6] bg-white text-[#1C1C1A] text-lg leading-none flex items-center justify-center hover:bg-[#EAF3DE] active:scale-95 transition-all"
          >−</button>
          <div className="flex-1 flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={5000}
              value={qty}
              onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="w-full border border-[#E0DED6] rounded-lg text-center text-sm py-1.5 bg-white text-[#1C1C1A] font-medium"
            />
            <span className="text-sm text-[#888780] shrink-0">g</span>
          </div>
          <button
            onClick={() => setQty(q => q + 5)}
            className="w-8 h-8 rounded-lg border border-[#E0DED6] bg-white text-[#1C1C1A] text-lg leading-none flex items-center justify-center hover:bg-[#EAF3DE] active:scale-95 transition-all"
          >+</button>
        </div>
        {/* Atajos rápidos */}
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {[25, 35, 50, 100, 150, 200].map(g => (
            <button
              key={g}
              onClick={() => setQty(g)}
              className={`px-2 py-0.5 rounded-md text-xs transition-all ${
                qty === g
                  ? 'bg-[#639922] text-white'
                  : 'bg-white border border-[#E0DED6] text-[#888780] hover:border-[#639922]'
              }`}
            >{g}g</button>
          ))}
        </div>
      </div>

      {/* Macros calculados dinámicamente */}
      <div className="grid grid-cols-4 gap-2 mb-3 text-center">
        {[
          { label: 'Kcal',   value: computed.kcal,    unit: '' },
          { label: 'Prot',   value: computed.protein, unit: 'g' },
          { label: 'Carbs',  value: computed.carbs,   unit: 'g' },
          { label: 'Grasa',  value: computed.fat,     unit: 'g' },
        ].map(({ label, value, unit }) => (
          <div key={label} className="bg-[#F7F5F0] rounded-lg py-2">
            <div className="text-[10px] text-[#888780]">{label}</div>
            <div className="text-sm font-medium text-[#1C1C1A]">{value}{unit}</div>
          </div>
        ))}
      </div>

      {result.notes && (
        <p className="text-xs text-[#888780] mb-3">{result.notes}</p>
      )}

      {/* Selector de comida + botón añadir */}
      <div className="flex gap-2 items-center">
        <select
          value={meal}
          onChange={e => setMeal(e.target.value)}
          className="flex-1 border border-[#E0DED6] rounded-lg text-sm py-1.5 px-2 bg-[#F7F5F0] text-[#1C1C1A]"
        >
          {MEALS.map(m => <option key={m}>{m}</option>)}
        </select>
        <button
          onClick={() => onAdd(
            {
              name:    result.dish,
              brand:   result.brand || '',
              kcal:    result.estimatedPer100g.kcal,
              protein: result.estimatedPer100g.protein,
              carbs:   result.estimatedPer100g.carbs,
              fat:     result.estimatedPer100g.fat,
            },
            qty,
            meal
          )}
          className="bg-[#639922] text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-[#3B6D11] transition-colors whitespace-nowrap"
        >
          + Añadir
        </button>
      </div>
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function ScanTab({ onAdd }) {
  const [mode, setMode]       = useState(MODES.IDLE)
  const [preview, setPreview] = useState(null)
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [barcode, setBarcode] = useState('')

  const cameraRef  = useRef()
  const galleryRef = useRef()
  const barcodeRef = useRef()

  const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY

  // ── Foto con IA ──────────────────────────────────────────────────────────
  async function handleImageFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setError(null)
    setLoading(true)
    setMode(MODES.PHOTO)
    try {
      const data = await analyzeImageWithGemini(file)
      if (data.detected) {
        setResult({ ...data, source: 'photo' })
      } else {
        setError('No se detectó comida. ' + (data.notes || ''))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Código de barras con cámara ──────────────────────────────────────────
  async function handleBarcodeImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setResult(null)
    setError(null)
    setLoading(true)
    setMode(MODES.BARCODE)
    setPreview(URL.createObjectURL(file))

    try {
      // 1. Gemini lee el código de barras de la imagen
      const barcodeData = await readBarcodeWithGemini(file)
      if (!barcodeData) {
        setError('No se detectó código de barras en la imagen.')
        setLoading(false)
        return
      }
      setBarcode(barcodeData)

      // 2. Buscar el producto en OpenFoodFacts con ese código
      const product = await getProductByBarcode(barcodeData)
      if (!product) {
        setError(`Código ${barcodeData} no encontrado en la base de datos. Prueba a buscar el producto por nombre en la pestaña "Buscar".`)
        setLoading(false)
        return
      }

      setResult({
        dish:    product.name,
        brand:   product.brand,
        source:  'barcode',
        confidence: 'alta',
        portionGrams: 100,
        notes: product.quantity ? `Envase: ${product.quantity}` : '',
        estimatedPer100g: {
          kcal:    product.kcal,
          protein: product.protein,
          carbs:   product.carbs,
          fat:     product.fat,
        },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Gemini lee el número del código de barras ────────────────────────────
  async function readBarcodeWithGemini(file) {
    if (!hasApiKey) throw new Error('VITE_GEMINI_API_KEY no configurada.')
    const base64 = await fileToBase64(file)
    const body = {
      model: 'gemini-2.5-flash',
      contents: [{
        parts: [
          { text: 'Lee el código de barras o QR de esta imagen y devuelve ÚNICAMENTE el número/código en texto plano, sin nada más. Si no hay código de barras visible, responde exactamente: NO_BARCODE' },
          { inline_data: { mime_type: file.type || 'image/jpeg', data: base64 } },
        ],
      }],
      generationConfig: { temperature: 0, maxOutputTokens: 64 },
    }
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    )
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `Error Gemini ${res.status}`)
    }
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
    if (!text || text === 'NO_BARCODE') return null
    // Limpiar y quedarnos solo con dígitos/letras del código
    return text.replace(/\s/g, '').replace(/[^0-9A-Za-z]/g, '')
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader()
      r.onload  = () => resolve(r.result.split(',')[1])
      r.onerror = reject
      r.readAsDataURL(file)
    })
  }

  function reset() {
    setMode(MODES.IDLE)
    setPreview(null)
    setResult(null)
    setError(null)
    setBarcode('')
  }

  function handleAdd(food, qty, meal) {
    onAdd(food, qty, meal)
    reset()
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      {!hasApiKey && (
        <div className="bg-[#FAEEDA] border border-[#FAC775] rounded-xl p-3.5 mb-4 text-sm text-[#633806]">
          <strong className="font-medium">API key no configurada.</strong>
          <p className="mt-1 text-xs leading-relaxed">
            Crea tu key gratuita en{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline">
              aistudio.google.com
            </a>{' '}
            y añádela en Vercel → Settings → Environment Variables como{' '}
            <code className="bg-[#F7E8C8] px-1 rounded">VITE_GEMINI_API_KEY</code>.
          </p>
        </div>
      )}

      {/* Preview de imagen */}
      {preview && (
        <div className="relative mb-3">
          <img
            src={preview}
            alt="Vista previa"
            className="w-full max-h-48 object-contain rounded-2xl border border-[#E0DED6] bg-white"
          />
          {barcode && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
              Código: {barcode}
            </div>
          )}
          <button
            onClick={reset}
            className="absolute top-2 right-2 bg-white border border-[#E0DED6] rounded-full w-7 h-7 text-[#888780] hover:text-[#E24B4A] text-sm leading-none flex items-center justify-center"
          >×</button>
        </div>
      )}

      {/* Panel de acciones — se oculta mientras hay resultado */}
      {!result && (
        <>
          {!preview && (
            <div className="bg-white border border-[#E0DED6] rounded-2xl p-5 mb-3 text-center">
              <div className="text-3xl mb-1">🍽️</div>
              <p className="text-sm font-medium text-[#1C1C1A]">Escanea o fotografía</p>
              <p className="text-xs text-[#888780] mt-1">
                Foto del plato → análisis con IA · Código de barras → datos exactos del producto
              </p>
            </div>
          )}

          {/* Tres botones de acción */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            <button
              onClick={() => cameraRef.current?.click()}
              className="flex flex-col items-center gap-1 bg-[#639922] text-white rounded-xl py-3 px-2 hover:bg-[#3B6D11] active:scale-95 transition-all"
            >
              <span className="text-xl">📷</span>
              <span className="text-[11px] font-medium leading-tight text-center">Cámara</span>
            </button>

            <button
              onClick={() => galleryRef.current?.click()}
              className="flex flex-col items-center gap-1 bg-white border border-[#E0DED6] text-[#1C1C1A] rounded-xl py-3 px-2 hover:border-[#639922] hover:bg-[#EAF3DE] active:scale-95 transition-all"
            >
              <span className="text-xl">🖼️</span>
              <span className="text-[11px] font-medium leading-tight text-center">Galería</span>
            </button>

            <button
              onClick={() => barcodeRef.current?.click()}
              className="flex flex-col items-center gap-1 bg-white border border-[#E0DED6] text-[#1C1C1A] rounded-xl py-3 px-2 hover:border-[#639922] hover:bg-[#EAF3DE] active:scale-95 transition-all"
            >
              <span className="text-xl">📦</span>
              <span className="text-[11px] font-medium leading-tight text-center">Código barras</span>
            </button>
          </div>

          <p className="text-[10px] text-[#888780] text-center mb-3">
            Modelo: Gemini 2.5 Flash · 10 peticiones/min · 500/día gratuitas
          </p>
        </>
      )}

      {/* Inputs ocultos */}
      {/* Foto plato — cámara trasera */}
      <input ref={cameraRef}  type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageFile} />
      {/* Foto plato — galería */}
      <input ref={galleryRef} type="file" accept="image/*"                        className="hidden" onChange={handleImageFile} />
      {/* Código de barras — cámara trasera */}
      <input ref={barcodeRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleBarcodeImage} />

      {/* Estado de carga */}
      {loading && (
        <div className="text-center py-6 text-sm text-[#888780]">
          <div className="text-2xl mb-2 animate-pulse">
            {mode === MODES.BARCODE ? '📦' : '🔍'}
          </div>
          {mode === MODES.BARCODE
            ? 'Leyendo código de barras con Gemini…'
            : 'Analizando plato con Gemini 2.5 Flash…'}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-[#FCEBEB] border border-[#F7C1C1] rounded-xl p-3 text-sm text-[#A32D2D]">
          {error}
          <button onClick={reset} className="block mt-2 text-xs underline text-[#A32D2D]">
            Intentar de nuevo
          </button>
        </div>
      )}

      {/* Resultado editable */}
      {result && !loading && (
        <ResultCard result={result} onAdd={handleAdd} />
      )}

      {/* Sin comida detectada */}
      {!result && !loading && !error && mode !== MODES.IDLE && (
        <div className="bg-[#FAEEDA] border border-[#FAC775] rounded-xl p-3 text-sm text-[#633806]">
          No se pudo identificar el alimento.
        </div>
      )}
    </div>
  )
}
