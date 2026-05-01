import { useState } from 'react'

const GOALS = [
  { id: 'lose_fat',    emoji: '🔥', label: 'Perder grasa',         desc: 'Déficit moderado, alta proteína' },
  { id: 'lose_weight', emoji: '⚡', label: 'Perder peso',           desc: 'Déficit calórico general' },
  { id: 'maintain',   emoji: '⚖️',  label: 'Mantenimiento',         desc: 'Calorías de mantenimiento' },
  { id: 'gain_muscle', emoji: '💪', label: 'Ganar músculo',         desc: 'Superávit + alta proteína' },
  { id: 'recomp',     emoji: '🔄', label: 'Recomposición corporal', desc: 'Perder grasa y ganar músculo' },
]

export default function ProfileSetup({ onSave, existing }) {
  const [step, setStep]   = useState(0)
  const [data, setData]   = useState(existing || {
    name: '', age: '', weight: '', height: '', gender: 'male', goal: 'maintain',
  })

  function set(key, val) { setData(d => ({ ...d, [key]: val })) }

  function finish() {
    onSave({
      ...data,
      age:    Number(data.age),
      weight: Number(data.weight),
      height: Number(data.height),
    })
  }

  const steps = [
    // 0 — Datos personales
    <div key="personal">
      <h2 className="font-serif text-xl text-[#1C1C1A] mb-1">Cuéntame sobre ti</h2>
      <p className="text-xs text-[#888780] mb-5">Para calcular tus calorías y macros exactos</p>

      <label className="block text-xs font-medium text-[#888780] mb-1">Tu nombre (opcional)</label>
      <input value={data.name} onChange={e => set('name', e.target.value)}
        placeholder="Ej: Raúl"
        className="w-full border border-[#E0DED6] rounded-xl px-3.5 py-2.5 text-sm text-[#1C1C1A] bg-white mb-3 outline-none focus:border-[#639922]"
      />

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { key: 'age',    label: 'Edad',    unit: 'años',  placeholder: '25' },
          { key: 'weight', label: 'Peso',    unit: 'kg',    placeholder: '75' },
          { key: 'height', label: 'Altura',  unit: 'cm',    placeholder: '175' },
        ].map(({ key, label, unit, placeholder }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-[#888780] mb-1">{label}</label>
            <div className="flex items-center border border-[#E0DED6] rounded-xl bg-white overflow-hidden focus-within:border-[#639922]">
              <input
                type="number"
                value={data[key]}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                className="flex-1 min-w-0 px-2.5 py-2.5 text-sm text-[#1C1C1A] bg-transparent outline-none"
              />
              <span className="text-[10px] text-[#888780] pr-2 shrink-0">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      <label className="block text-xs font-medium text-[#888780] mb-2">Género biológico</label>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {[{ id: 'male', label: '♂ Hombre' }, { id: 'female', label: '♀ Mujer' }].map(g => (
          <button key={g.id} onClick={() => set('gender', g.id)}
            className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
              data.gender === g.id
                ? 'bg-[#639922] text-white border-[#639922]'
                : 'bg-white text-[#1C1C1A] border-[#E0DED6] hover:border-[#639922]'
            }`}
          >{g.label}</button>
        ))}
      </div>

      <button
        onClick={() => setStep(1)}
        disabled={!data.age || !data.weight || !data.height}
        className="w-full bg-[#639922] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#3B6D11] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Siguiente →
      </button>
    </div>,

    // 1 — Objetivo
    <div key="goal">
      <h2 className="font-serif text-xl text-[#1C1C1A] mb-1">¿Cuál es tu objetivo?</h2>
      <p className="text-xs text-[#888780] mb-4">Ajustaremos tus macros y calorías a tu meta</p>

      <div className="flex flex-col gap-2 mb-6">
        {GOALS.map(g => (
          <button key={g.id} onClick={() => set('goal', g.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
              data.goal === g.id
                ? 'bg-[#EAF3DE] border-[#639922]'
                : 'bg-white border-[#E0DED6] hover:border-[#639922]'
            }`}
          >
            <span className="text-2xl">{g.emoji}</span>
            <div>
              <div className="text-sm font-medium text-[#1C1C1A]">{g.label}</div>
              <div className="text-xs text-[#888780]">{g.desc}</div>
            </div>
            {data.goal === g.id && (
              <span className="ml-auto text-[#639922] text-lg">✓</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setStep(0)}
          className="px-4 py-3 rounded-xl border border-[#E0DED6] text-sm text-[#888780] hover:bg-[#F7F5F0]"
        >← Atrás</button>
        <button onClick={finish}
          className="flex-1 bg-[#639922] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#3B6D11] transition-all"
        >Guardar y empezar ✓</button>
      </div>
    </div>,
  ]

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-start justify-center pt-12 px-5">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-[#639922]' : 'bg-[#E0DED6]'}`} />
          ))}
        </div>
        {steps[step]}
      </div>
    </div>
  )
}
