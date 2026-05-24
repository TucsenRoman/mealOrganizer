'use client'

import { useRef, useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { Category, Meal } from '@/lib/types'
import { getCategoryBg, getCategoryText } from '@/lib/utils'

type Props = {
  categories: Category[]
  checked: Record<string, boolean>
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

export default function CookView({ categories, checked, onMealSelect, initialIdx, onIdxChange }: Props) {
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
    if (idx !== activeIdx) {
      setActiveIdx(idx)
      onIdxChange(idx)
    }
  }

  return (
    <>
      <div className="px-4 pt-4">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex gap-4 overflow-x-auto snap-x no-scrollbar"
        >
          {categories.map((cat, catIdx) => {
            const bgCls = getCategoryBg(cat.color)
            const textCls = getCategoryText(cat.color)

            return (
              <div
                key={cat.id}
                className={`
                  snap-center flex-shrink-0 w-[calc(100vw-2rem)] max-w-sm
                  rounded-2xl ${bgCls} flex flex-col
                  transition-all duration-200
                  ${catIdx === activeIdx ? '' : 'opacity-60'}
                `}
              >
                {/* Card header */}
                <div className="flex items-center px-4 pt-4 pb-3 gap-2">
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className={`text-lg font-black ${textCls}`}>{cat.label}</span>
                </div>

                {/* Divider */}
                <div className="mx-4 h-px bg-black/5" />

                {/* Meal list */}
                <div className="flex flex-col divide-y divide-black/5 px-1 pb-2 overflow-y-auto max-h-[55vh]">
                  {cat.meals.map(meal => {
                    const checkedCount = meal.ingredients.filter(i => checked[i.id]).length
                    const totalCount = meal.ingredients.length
                    const allDone = totalCount > 0 && checkedCount === totalCount

                    return (
                      <button
                        key={meal.id}
                        onClick={() => onMealSelect(catIdx, meal)}
                        className={`flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl transition-colors ${allDone ? 'opacity-50' : ''}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${allDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                            {meal.name}
                          </p>
                          {meal.side && <p className="text-xs text-gray-400 truncate">+ {meal.side}</p>}
                        </div>
                        <div className="flex-shrink-0 flex flex-col items-end gap-1">
                          <span className="text-xs text-gray-400">{checkedCount}/{totalCount}</span>
                          <div className="w-12 h-1.5 bg-white/70 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: totalCount > 0 ? `${(checkedCount / totalCount) * 100}%` : '0%',
                                backgroundColor: cat.color,
                              }}
                            />
                          </div>
                        </div>
                        <ChevronRight size={14} className="flex-shrink-0 text-gray-300" />
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 pt-3 pb-4">
        {categories.map((cat, idx) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveIdx(idx)
              onIdxChange(idx)
              scrollTo(scrollRef, idx)
            }}
            className="rounded-full transition-all duration-200"
            style={{
              width: idx === activeIdx ? 24 : 8,
              height: 8,
              backgroundColor: idx === activeIdx ? cat.color : '#D1D5DB',
            }}
          />
        ))}
      </div>
    </>
  )
}
