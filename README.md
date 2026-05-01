# NutriLog 🥗

Diario de alimentación gratuito. Sin suscripciones, sin backend propio, sin base de datos.

## Stack

| Pieza | Solución | Coste |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Gratis |
| Datos de alimentos | OpenFoodFacts API | Gratis (open source) |
| Reconocimiento de imágenes | Google Gemini Flash | Gratis (15 rpm) |
| Persistencia | LocalStorage del navegador | Gratis |
| Hosting | Vercel Hobby | Gratis |

## Instalación local

```bash
npm install
cp .env.example .env
# → edita .env y añade tu VITE_GEMINI_API_KEY
npm run dev
```

## Obtener API key de Gemini (gratis)

1. Ve a https://aistudio.google.com/app/apikey
2. Crea una API key.
3. Pégala en `.env`:
   ```
   VITE_GEMINI_API_KEY=AIza...
   ```
4. El plan gratuito incluye **15 peticiones/minuto** y **1M tokens/día** — más que suficiente para uso personal.

## Deploy en Vercel (gratis)

```bash
# Opción A: desde CLI
npx vercel

# Opción B: desde GitHub
# 1. Sube el proyecto a un repo de GitHub
# 2. Ve a vercel.com → New Project → importa el repo
# 3. En "Environment Variables", añade VITE_GEMINI_API_KEY
# 4. Haz clic en Deploy
```

Vercel detecta Vite automáticamente. No necesitas configuración adicional.

## Estructura del proyecto

```
src/
  hooks/
    useNutriLog.js      ← persistencia en LocalStorage
  services/
    openFoodFacts.js    ← búsqueda de alimentos (gratis)
    gemini.js           ← reconocimiento de imágenes (gratis)
  components/
    MacroSummary.jsx    ← resumen de kcal y macros
    TodayTab.jsx        ← diario del día
    SearchTab.jsx       ← búsqueda de alimentos
    ScanTab.jsx         ← análisis de imágenes con IA
  App.jsx               ← componente raíz
  main.jsx              ← entrada
  index.css             ← Tailwind
```

## Personalización rápida

- **Cambiar objetivo calórico**: edita `GOAL` en `MacroSummary.jsx` y `useNutriLog.js`.
- **Añadir más comidas**: edita el array `MEALS` en `TodayTab.jsx` y `SearchTab.jsx`.
- **Exportar datos**: `JSON.parse(localStorage.getItem('nutrilog_v1'))` desde la consola del navegador.
