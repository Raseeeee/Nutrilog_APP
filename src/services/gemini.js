const GEMINI_MODEL = 'gemini-1.5-flash';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const PROMPT = `Analiza esta imagen de comida y responde SOLO con un JSON válido, sin markdown ni explicaciones adicionales.
Formato exacto requerido:
{
  "detected": true,
  "dish": "nombre del plato",
  "ingredients": ["ingrediente1"],
  "estimatedPer100g": { "kcal": 0, "protein": 0, "carbs": 0, "fat": 0 },
  "portionGrams": 200,
  "confidence": "alta",
  "notes": ""
}`;

export async function analyzeImageWithGemini(imageFile) {
  if (!API_KEY) {
    throw new Error('Falta la API KEY en las variables de entorno de Vercel');
  }

  const base64 = await fileToBase64(imageFile);
  const mimeType = imageFile.type || 'image/jpeg';

  const body = {
    contents: [{
      parts: [
        { text: PROMPT },
        { inline_data: { mime_type: mimeType, data: base64 } }
      ]
    }]
  };

  // Usamos la ruta v1beta que es la que mejor funciona con Flash
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Error HTTP ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(clean);
  } catch {
    throw new Error('Error al leer la respuesta de la IA');
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
