'use client'

import { useRef, useState } from 'react'
import { ArrowLeft, Info } from 'lucide-react'
import type { Meal, Category, Ingredient } from '@/lib/types'
import { getCategoryText } from '@/lib/utils'

type Props = {
  meal: Meal
  cat: Category
  categories: Category[]
  checked: Record<string, boolean>
  onBack: () => void
}

function scrollCarouselTo(ref: React.RefObject<HTMLDivElement | null>, idx: number) {
  const el = ref.current
  if (!el) return
  const child = el.children[idx] as HTMLElement
  if (child) child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
}

export default function MealDetailView({ meal, cat, categories, checked, onBack }: Props) {
  const textCls = getCategoryText(cat.color)
  const [activeIdx, setActiveIdx] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Build shared ingredient map
  const ingredientMealMap = new Map<string, { mealName: string; quantity: string }[]>()
  categories.forEach(c => {
    c.meals.forEach(m => {
      m.ingredients.forEach((ing: Ingredient) => {
        const key = ing.name.toLowerCase()
        if (!ingredientMealMap.has(key)) ingredientMealMap.set(key, [])
        ingredientMealMap.get(key)!.push({ mealName: m.name, quantity: ing.quantity })
      })
    })
  })

  function onScroll() {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.children[0]?.clientWidth ?? el.clientWidth
    const idx = Math.round(el.scrollLeft / (cardWidth + 16))
    const clamped = Math.max(0, Math.min(idx, meal.ingredients.length - 1))
    if (clamped !== activeIdx) setActiveIdx(clamped)
  }

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4 bg-white border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex flex-col">
          <span className={`text-xs font-semibold uppercase tracking-wider ${textCls}`}>
            {cat.emoji} {cat.label}
          </span>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">{meal.name}</h1>
          {meal.side && <p className="text-xs text-gray-400">+ {meal.side}</p>}
        </div>
      </div>

      {/* Notes */}
      {meal.notes && (
        <div className="px-4 pt-2">
          <span className="text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1 flex items-center gap-1 w-fit">
            <Info size={11} />
            {meal.notes}
          </span>
        </div>
      )}

      {/* Ingredient carousel */}
      <div className="flex-1 flex flex-col px-4 pt-4">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex gap-4 overflow-x-auto snap-x no-scrollbar pb-4"
        >
          {meal.ingredients.map((ing, idx) => {
            const isChecked = !!checked[ing.id]
            const sharedWith = (ingredientMealMap.get(ing.name.toLowerCase()) ?? [])
              .filter(e => e.mealName !== meal.name)

            return (
              <div
                key={ing.id}
                className={`
                  snap-center flex-shrink-0 w-[calc(100vw-2rem)] max-w-sm
                  rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200
                  ${isChecked ? 'bg-gray-100 opacity-70' : 'bg-white'}
                `}
              >
                {/* Counter */}
                <div className="flex justify-end">
                  <span className="text-xs font-semibold text-gray-300 select-none">
                    {idx + 1} of {meal.ingredients.length}
                  </span>
                </div>

                {/* Name + quantity */}
                <div>
                  <h2 className={`text-2xl font-bold leading-tight ${isChecked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {ing.name}
                  </h2>
                  {ing.quantity && (
                    <p className="mt-1 text-base text-gray-500 font-medium">{ing.quantity}</p>
                  )}
                </div>

                {/* Bringing */}
                {ing.bringing && (
                  <div className="flex items-start gap-2 bg-emerald-50 rounded-xl px-3 py-2">
                    <span className="text-emerald-500 mt-0.5 flex-shrink-0 text-sm">🎒</span>
                    <div className="text-xs text-emerald-700">
                      <span className="font-semibold">{ing.bringing.who}</span> is bringing <span className="font-semibold">{ing.bringing.amount}</span> — still need {ing.quantity} more
                    </div>
                  </div>
                )}

                {/* Shared with */}
                {sharedWith.length > 0 && (
                  <div className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <Info size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-gray-500">
                      <p className="font-semibold text-gray-600 mb-1">Also used in:</p>
                      {sharedWith.map(e => (
                        <p key={e.mealName}>{e.mealName} — <span className="font-medium">{e.quantity}</span></p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 pb-6">
          {meal.ingredients.map((ing, idx) => (
            <button
              key={ing.id}
              onClick={() => {
                setActiveIdx(idx)
                scrollCarouselTo(scrollRef, idx)
              }}
              className="rounded-full transition-all duration-200"
              style={{
                width: idx === activeIdx ? 20 : 7,
                height: 7,
                backgroundColor: idx === activeIdx ? cat.color : '#D1D5DB',
              }}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
