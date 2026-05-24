'use client'

import { ListTodo, CookingPot } from 'lucide-react'
import { getProgressPhrase } from '@/data/phrases'

type Props = {
  view: 'cook' | 'shop'
  onToggle: () => void
  pct: number
  vibe: { title: string; pct: number } | null
}

export default function Header({ view, onToggle, pct, vibe }: Props) {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Bar */}
        <div className="relative flex-1 flex flex-col justify-center gap-1 h-10">
          {view === 'shop' && (
            <>
              <span className="text-xs font-semibold text-gray-400 tracking-wider">
                {getProgressPhrase(pct)}
              </span>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: '#e5e7eb', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: '#22c55e',
                    boxShadow: '0 1px 6px rgba(34,197,94,0.6)',
                  }}
                />
              </div>
            </>
          )}
          {view === 'cook' && vibe && (
            <>
              <span className="text-xs font-semibold text-gray-400 tracking-wider">{vibe.title}</span>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${vibe.pct}%`, background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #a855f7)' }}
                />
              </div>
              <div className="absolute -bottom-2 flex justify-between w-full">
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i} className="text-[9px] text-gray-300 font-medium">{i + 1}</span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Toggle */}
        <div className="w-32 flex-shrink-0 flex justify-end">
          <button
            onClick={onToggle}
            className="flex items-center h-8 bg-gray-100 rounded-xl p-1 gap-1"
          >
            <div className={`flex items-center h-6 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out overflow-hidden ${view === 'shop' ? 'bg-white text-gray-900 shadow-sm px-3 py-1' : 'text-gray-400 px-2 py-1'}`}>
              <ListTodo size={14} className="flex-shrink-0" />
              <span
                className="overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap"
                style={{ maxWidth: view === 'shop' ? '3rem' : '0px', opacity: view === 'shop' ? 1 : 0, paddingLeft: view === 'shop' ? '6px' : '0px' }}
              >
                Shop
              </span>
            </div>
            <div className={`flex items-center h-6 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out overflow-hidden ${view === 'cook' ? 'bg-white text-gray-900 shadow-sm px-3 py-1' : 'text-gray-400 px-2 py-1'}`}>
              <CookingPot size={14} className="flex-shrink-0" />
              <span
                className="overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap"
                style={{ maxWidth: view === 'cook' ? '3rem' : '0px', opacity: view === 'cook' ? 1 : 0, paddingLeft: view === 'cook' ? '6px' : '0px' }}
              >
                Cook
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
