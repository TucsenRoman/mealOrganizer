'use client'

import { useRef, useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { Category, Meal } from '@/lib/types'

type Props = {
  categories: Category[]
  onMealSelect: (catIdx: number, meal: Meal) => void
  initialIdx: number
  onIdxChange: (idx: number) => void
}

function scrollTo(ref: React.RefObject<HTMLDivElement | null>, idx: number) {
  const el = ref.current
  if (!el) return
  const child = el.children[idx] as HTMLElement
  if (child) child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
}

export default function CookView({ categories, onMealSelect, initialIdx, onIdxChange }: Props) {
  const [activeIdx, setActiveIdx] = useState(initialIdx)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const child = el.children[initialIdx] as HTMLElement
    if (child) child.scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' })
  }, [])

  function onScroll() {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.children[0]?.clientWidth ?? el.clientWidth
    const idx = Math.round(el.scrollLeft / (cardWidth + 16))
    const clamped = Math.max(0, Math.min(idx, categories.length - 1))
    if (clamped !== activeIdx) {
      setActiveIdx(clamped)
      onIdxChange(clamped)
    }
  }

  return (
    <>
      <div className="px-4 pt-4 flex-1 flex flex-col min-h-0">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex gap-4 overflow-x-auto snap-x no-scrollbar flex-1 min-h-0"
        >
          {categories.map((cat, catIdx) => {

            return (
              <div
                key={cat.id}
                className="snap-center flex-shrink-0 w-[calc(100vw-2rem)] max-w-sm rounded-2xl flex flex-col bg-[var(--layer-1)]"
              >
                {/* Card header */}
                <div className="flex items-center px-4 pt-4 pb-3 gap-2">
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-lg font-black" style={{ color: cat.color }}>{cat.label}</span>
                </div>

                {/* Divider */}
                <div className="mx-4 h-px bg-black/6" />

                {/* Meal list */}
                <div className="flex flex-col px-1 pb-2 overflow-y-auto flex-1 min-h-0">
                  {cat.meals.map((meal, mealIdx) => {
                    const totalCount = meal.ingredients.length

                    return (
                      <div key={meal.id}>
                        {mealIdx > 0 && <div className="h-px mx-3 bg-[var(--layer-2)]" />}
                      <button
                        onClick={() => onMealSelect(catIdx, meal)}
                        className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-gray-800">
                            {meal.name}
                          </p>
                          {meal.side && <p className="text-xs text-gray-400 truncate">w/ {meal.side}</p>}
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <span className="text-xs text-gray-400">{totalCount} items</span>
                          <ChevronRight size={14} className="text-gray-300" />
                        </div>
                      </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 pt-3 pb-24">
        {categories.map((cat, idx) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveIdx(idx)
              onIdxChange(idx)
              scrollTo(scrollRef, idx)
            }}
            className={`rounded-full transition-all duration-200 h-2 ${idx === activeIdx ? 'w-6' : 'w-2 bg-gray-300'}`}
            style={idx === activeIdx ? { backgroundColor: cat.color } : undefined}
          />
        ))}
      </div>
    </>
  )
}
