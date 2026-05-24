'use client'

import { useRef, useState } from 'react'
import { ArrowLeft, Info, ChefHat, Scale, Scissors, MoveLeft } from 'lucide-react'
import type { Meal, Category, Ingredient } from '@/lib/types'

type Props = {
  meal: Meal
  cat: Category
  categories: Category[]
  onBack: () => void
}

function scrollCarouselTo(ref: React.RefObject<HTMLDivElement | null>, idx: number) {
  const el = ref.current
  if (!el) return
  const child = el.children[idx] as HTMLElement
  if (child) child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
}

export default function MealDetailView({ meal, cat, categories, onBack }: Props) {
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
    <main className="flex flex-col h-screen overflow-hidden bg-[var(--layer-0)]">
      {/* Header — your version, untouched */}
      <div className="relative flex-col items-center gap-4 px-6 pt-8 pb-4 bg-[var(--layer-1)]">
        <div className='absolute top-0 left-0 px-3 py-2 rounded-lg backdrop-blur-[3px]'>
          <button
            onClick={onBack}
            className="flex justify-center items-center gap-2"
          >
            <MoveLeft size={14} style={{ color: cat.color }}/>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: cat.color }}>
              {cat.label}
            </span>
          </button>
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-gray-900 leading-tight">{meal.name}</h1>
          {meal.side && <p className="text-xs text-gray-400">w/ {meal.side}</p>}
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
      <div className="flex-1 flex flex-col px-4 pt-4 min-h-0">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex gap-4 overflow-x-auto snap-x no-scrollbar pb-4 flex-1 min-h-0"
        >
          {meal.ingredients.map((ing, idx) => {
            const sharedWith = (ingredientMealMap.get(ing.name.toLowerCase()) ?? [])
              .filter(e => e.mealName !== meal.name)

            return (
              <div
                key={ing.id}
                className="snap-center flex-shrink-0 w-[calc(100vw-2rem)] max-w-sm rounded-2xl flex flex-col overflow-y-auto bg-[var(--layer-1)]"
              >
                {/* Top: counter + name + quantity */}
                <div className="px-5 pt-5 pb-4">
                  <span
                    className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-3"
                    style={{ backgroundColor: cat.color + '22', color: cat.color }}
                  >
                    {idx + 1} / {meal.ingredients.length}
                  </span>

                  <h2 className="text-2xl font-bold leading-tight text-gray-900 mb-2">
                    {ing.name}
                  </h2>

                  {/* Total quantity */}
                  <div className="flex items-center gap-1.5">
                    <Scale size={12} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-600">{ing.quantity}</span>
                    {ing.mealQuantity && (
                      <span className="text-xs text-gray-400 ml-0.5">total</span>
                    )}
                  </div>

                  {/* Per-meal allocation */}
                  {ing.mealQuantity && (
                    <div className="mt-2.5 rounded-xl px-3 py-2 bg-[var(--layer-2)]">
                      <p className="text-xs text-gray-500 leading-snug">
                        <span className="font-semibold text-gray-700">For this meal: </span>
                        {ing.mealQuantity}
                      </p>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="mx-5 h-px bg-[var(--layer-2)]" />

                {/* Detail body */}
                <div className="px-5 py-4 flex flex-col gap-3">

                  {/* What it's used for */}
                  {ing.use && (
                    <div className="flex items-start gap-2.5">
                      <ChefHat size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 leading-snug">{ing.use}</p>
                    </div>
                  )}

                  {/* Prep instructions */}
                  {ing.prep && (
                    <div className="flex items-start gap-2.5">
                      <Scissors size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-500 leading-relaxed">{ing.prep}</p>
                    </div>
                  )}

                  {/* Bringing */}
                  {ing.bringing && (
                    <div className="flex items-start gap-2 bg-emerald-50 rounded-xl px-3 py-2.5">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">🎒</span>
                      <div className="text-xs text-emerald-700 leading-snug">
                        <span className="font-semibold">{ing.bringing.who}</span> is bringing{' '}
                        <span className="font-semibold">{ing.bringing.amount}</span>
                        {ing.mealQuantity
                          ? ' — split between meals as noted above'
                          : ` — covers the full ${ing.quantity}`}
                      </div>
                    </div>
                  )}

                  {/* Shared with other meals */}
                  {sharedWith.length > 0 && (
                    <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 bg-[var(--layer-2)]">
                      <Info size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-gray-500">
                        <p className="font-semibold text-gray-600 mb-1">Also used in:</p>
                        {sharedWith.map(e => (
                          <p key={e.mealName} className="leading-snug">
                            {e.mealName}
                            {e.quantity ? <span className="text-gray-400"> — {e.quantity}</span> : null}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
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
              className={`rounded-full transition-all duration-200 h-[7px] ${idx === activeIdx ? 'w-5' : 'w-[7px] bg-gray-300'}`}
              style={idx === activeIdx ? { backgroundColor: cat.color } : undefined}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
