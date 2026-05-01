import { useState, useCallback } from 'react'

const STORAGE_KEY = 'nutrilog_v1'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function loadLog() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}

export function useNutriLog() {
  const [log, setLog] = useState(loadLog)

  const today        = getToday()
  const todayData    = log[today] || { entries: [], water: 0 }
  const todayEntries = todayData.entries || todayData // retrocompat si era array plano
  const todayWater   = todayData.water || 0

  const addFood = useCallback((food, qty, meal) => {
    const ratio = qty / 100
    const entry = {
      id:      Date.now(),
      name:    food.name,
      brand:   food.brand || '',
      qty,
      meal,
      kcal:    Math.round((food.kcal    || 0) * ratio),
      protein: +((food.protein || 0) * ratio).toFixed(1),
      carbs:   +((food.carbs   || 0) * ratio).toFixed(1),
      fat:     +((food.fat     || 0) * ratio).toFixed(1),
      fiber:   +((food.fiber   || 0) * ratio).toFixed(1),
      salt:    +((food.salt    || 0) * ratio).toFixed(2),
    }
    setLog(prev => {
      const prevData    = prev[today] || { entries: [], water: 0 }
      const prevEntries = prevData.entries || prevData
      const updated = {
        ...prev,
        [today]: { entries: [...prevEntries, entry], water: prevData.water || 0 },
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [today])

  const removeFood = useCallback((id) => {
    setLog(prev => {
      const prevData    = prev[today] || { entries: [], water: 0 }
      const prevEntries = prevData.entries || prevData
      const updated = {
        ...prev,
        [today]: { entries: prevEntries.filter(e => e.id !== id), water: prevData.water || 0 },
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [today])

  const addWater = useCallback((mlToAdd) => {
    setLog(prev => {
      const prevData    = prev[today] || { entries: [], water: 0 }
      const prevEntries = prevData.entries || prevData
      const updated = {
        ...prev,
        [today]: {
          entries: prevEntries,
          water: Math.max(0, (prevData.water || 0) + mlToAdd),
        },
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [today])

  const totals = (Array.isArray(todayEntries) ? todayEntries : []).reduce(
    (acc, e) => ({
      kcal:    acc.kcal    + e.kcal,
      protein: acc.protein + e.protein,
      carbs:   acc.carbs   + e.carbs,
      fat:     acc.fat     + e.fat,
      fiber:   acc.fiber   + (e.fiber || 0),
      salt:    acc.salt    + (e.salt  || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, salt: 0 }
  )

  return {
    todayEntries: Array.isArray(todayEntries) ? todayEntries : [],
    totals,
    todayWater,
    addFood,
    removeFood,
    addWater,
    log,
  }
}
