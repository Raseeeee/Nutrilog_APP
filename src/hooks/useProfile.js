import { useState } from 'react'

const STORAGE_KEY = 'nutrilog_profile_v1'

// Fórmula de Mifflin-St Jeor para TMB
function calcTMB(weight, height, age, gender) {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5
  }
  return 10 * weight + 6.25 * height - 5 * age - 161
}

// Factor de actividad (usamos moderado como default)
const ACTIVITY = 1.55

const GOAL_ADJUSTMENTS = {
  lose_fat:      { kcalOffset: -400, proteinMult: 2.2,  carbMult: 2.0,  fatMult: 0.8 },
  lose_weight:   { kcalOffset: -300, proteinMult: 1.8,  carbMult: 2.5,  fatMult: 0.9 },
  maintain:      { kcalOffset:    0, proteinMult: 1.6,  carbMult: 3.0,  fatMult: 1.0 },
  gain_muscle:   { kcalOffset: +300, proteinMult: 2.2,  carbMult: 3.5,  fatMult: 1.0 },
  recomp:        { kcalOffset: +100, proteinMult: 2.4,  carbMult: 2.8,  fatMult: 0.9 },
}

export function calcGoals(profile) {
  const { weight, height, age, gender, goal } = profile
  if (!weight || !height || !age) return null

  const tmb   = calcTMB(weight, height, age, gender)
  const tdee  = Math.round(tmb * ACTIVITY)
  const adj   = GOAL_ADJUSTMENTS[goal] || GOAL_ADJUSTMENTS.maintain

  const kcal    = Math.max(1200, Math.round(tdee + adj.kcalOffset))
  const protein = Math.round(weight * adj.proteinMult)
  const fat     = Math.round((kcal * 0.25) / 9)
  const carbs   = Math.round((kcal - protein * 4 - fat * 9) / 4)
  // Fibra: 14g/1000kcal (recomendación OMS), sal: ≤6g/día OMS
  const fiber   = Math.round(kcal / 1000 * 14)
  const salt    = 5   // objetivo ≤5g/día
  const water   = Math.round(weight * 35) // ml: 35ml/kg

  return { kcal, protein, carbs, fat, fiber, salt, water }
}

function loadProfile() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') }
  catch { return null }
}

export function useProfile() {
  const [profile, setProfile] = useState(loadProfile)

  function saveProfile(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setProfile(data)
  }

  const goals = profile ? calcGoals(profile) : null

  return { profile, goals, saveProfile }
}
