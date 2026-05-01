import { useState, useCallback } from 'react'

const STORAGE_KEY = 'nutrilog_v1'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function loadLog() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export function useNutriLog() {
  const [log, setLog] = useState(loadLog)

  const today = getToday()
  const todayEntries = log[today] || []

  const addFood = useCallback((food, qty, meal) => {
    const ratio = qty / 100
    const entry = {
      id: Date.now(),
      name: food.name,
      brand: food.brand || '',
      qty,
      meal,
      kcal: Math.round((food.kcal || 0) * ratio),
      protein: Math.round((food.protein || 0) * ratio * 10) / 10,
      carbs: Math.round((food.carbs || 0) * ratio * 10) / 10,
      fat: Math.round((food.fat || 0) * ratio * 10) / 10,
    }
    setLog(prev => {
      const updated = {
        ...prev,
        [today]: [...(prev[today] || []), entry],
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [today])

  const removeFood = useCallback((id) => {
    setLog(prev => {
      const updated = {
        ...prev,
        [today]: (prev[today] || []).filter(e => e.id !== id),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [today])

  const totals = todayEntries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.kcal,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return { todayEntries, totals, addFood, removeFood, log }
}
