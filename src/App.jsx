import { useState } from 'react'
import { useNutriLog } from './hooks/useNutriLog'
import MacroSummary from './components/MacroSummary'
import TodayTab from './components/TodayTab'
import SearchTab from './components/SearchTab'
import ScanTab from './components/ScanTab'

const TABS = [
  { id: 'today', label: 'Hoy' },
  { id: 'search', label: 'Buscar' },
  { id: 'scan', label: 'Escanear' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('today')
  const { todayEntries, totals, addFood, removeFood } = useNutriLog()

  function handleAdd(product, qty, meal) {
    addFood(product, qty, meal)
    setActiveTab('today')
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-md mx-auto pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#F7F5F0] border-b border-[#E0DED6] px-5 pt-6 pb-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <h1 className="font-serif text-2xl font-normal text-[#1C1C1A] tracking-tight">
              NutriLog
            </h1>
            <span className="text-[10px] bg-[#EAF3DE] text-[#3B6D11] px-2 py-0.5 rounded-full font-medium">
              100% gratis
            </span>
          </div>
          <p className="text-xs text-[#888780] mb-3">Tu diario de alimentación</p>

          {/* Tabs */}
          <div className="flex gap-0 bg-[#E0DED6] rounded-xl p-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-[#1C1C1A] shadow-sm'
                    : 'text-[#888780]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pt-4">
          {activeTab === 'today' && (
            <>
              <MacroSummary totals={totals} />
              <TodayTab entries={todayEntries} onRemove={removeFood} />
            </>
          )}
          {activeTab === 'search' && <SearchTab onAdd={handleAdd} />}
          {activeTab === 'scan' && <ScanTab onAdd={handleAdd} />}
        </div>
      </div>
    </div>
  )
}
