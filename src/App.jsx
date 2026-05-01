import { useState } from 'react'
import { useNutriLog } from './hooks/useNutriLog'
import { useProfile } from './hooks/useProfile'
import MacroSummary from './components/MacroSummary'
import TodayTab from './components/TodayTab'
import SearchTab from './components/SearchTab'
import ScanTab from './components/ScanTab'
import ProfileSetup from './components/ProfileSetup'
import CalendarTab from './components/CalendarTab'

const TABS = [
  { id: 'today',    label: 'Hoy'       },
  { id: 'search',   label: 'Buscar'    },
  { id: 'scan',     label: 'Escanear'  },
  { id: 'calendar', label: '📅'        },
]

export default function App() {
  const [activeTab, setActiveTab]           = useState('today')
  const [editingProfile, setEditingProfile] = useState(false)
  const { todayEntries, totals, todayWater, addFood, removeFood, addWater, log } = useNutriLog()
  const { profile, goals, saveProfile }     = useProfile()

  if (!profile || editingProfile) {
    return (
      <ProfileSetup
        existing={profile}
        onSave={data => { saveProfile(data); setEditingProfile(false) }}
      />
    )
  }

  function handleAdd(product, qty, meal) {
    addFood(product, qty, meal)
    setActiveTab('today')
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-md mx-auto pb-20">
        <div className="sticky top-0 z-10 bg-[#F7F5F0] border-b border-[#E0DED6] px-5 pt-5 pb-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-baseline gap-2">
              <h1 className="font-serif text-2xl font-normal text-[#1C1C1A] tracking-tight">
                {profile.name ? `Hola, ${profile.name}` : 'NutriLog'}
              </h1>
              <span className="text-[10px] bg-[#EAF3DE] text-[#3B6D11] px-2 py-0.5 rounded-full font-medium">
                100% gratis
              </span>
            </div>
            <button onClick={() => setEditingProfile(true)}
              className="text-[#888780] hover:text-[#1C1C1A] text-lg transition-colors" title="Editar perfil">
              ⚙️
            </button>
          </div>
          <p className="text-xs text-[#888780] mb-3">
            Obj: {goals?.kcal} kcal · {goals?.protein}g prot · {goals?.carbs}g carbs · {goals?.fat}g grasa
          </p>
          <div className="flex gap-0 bg-[#E0DED6] rounded-xl p-1">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activeTab === tab.id ? 'bg-white text-[#1C1C1A] shadow-sm' : 'text-[#888780]'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 pt-4">
          {activeTab === 'today' && (
            <>
              <MacroSummary totals={totals} goals={goals} water={todayWater} onAddWater={addWater} />
              <TodayTab entries={todayEntries} onRemove={removeFood} />
            </>
          )}
          {activeTab === 'search'   && <SearchTab   onAdd={handleAdd} />}
          {activeTab === 'scan'     && <ScanTab     onAdd={handleAdd} />}
          {activeTab === 'calendar' && <CalendarTab log={log} goals={goals} />}
        </div>
      </div>
    </div>
  )
}
