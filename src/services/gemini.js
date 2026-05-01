/**
 * Gemini Flash — reconocimiento de alimentos en imágenes.
 *
 * SETUP GRATUITO:
 * 1. Ve a https://aistudio.google.com/app/apikey y crea una API key.
 * 2. Crea un archivo .env en la raíz del proyecto con:
 *      VITE_GEMINI_API_KEY=tu_api_key_aqui
 * 3. El plan gratuito incluye 15 rpm y 1M tokens/día (más que suficiente).
 *
 * Docs: https://ai.google.dev/api/generate-content
 */

const GEMINI_MODEL = 'gemini-1.5-flash-latest'
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const PROMPT = `Analiza esta imagen de comida y responde SOLO con un JSON válido, sin markdown ni explicaciones adicionales.

Formato exacto requerido:
{
  "detected": true,
  "dish": "nombre del plato o alimento principal",
  "ingredients": ["ingrediente1", "ingrediente2"],
  "estimatedPer100g": {
    "kcal": número,
    "protein": número,
    "carbs": número,
    "fat": número
  },
  "portionGrams": número estimado de la porción visible,
  "confidence": "alta|media|baja",
  "notes": "observaciones breves"
}

Si no puedes identificar comida, devuelve { "detected": false, "notes": "motivo" }.`

/**
 * @param {File} imageFile — archivo de imagen del usuario
 * @returns {Promise<Object>} resultado parseado de Gemini
 */
export async function analyzeImageWithGemini(imageFile) {
  if (!API_KEY) {
    throw new Error(
      'VITE_GEMINI_API_KEY no configurada. Añádela en tu archivo .env'
    )
  }

  // Convertir imagen a base64
  const base64 = await fileToBase64(imageFile)
  const mimeType = imageFile.type || 'image/jpeg'

  const body = {
    contents: [
      {
        parts: [
          { text: PROMPT },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 512,
    },
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Error HTTP ${res.status}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

  // Limpiar posibles bloques de código markdown
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  try {
    return JSON.parse(clean)
  } catch {
    throw new Error('Gemini devolvió una respuesta inesperada: ' + text.slice(0, 200))
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
