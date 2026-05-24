'use client'

import { useRef, useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import type { StoreCategory, ShopItem } from '@/lib/types'
import { STORE_CATEGORIES, STORE_CATEGORY_STYLE } from '@/lib/utils'
import { getProgressPhrase } from '@/data/phrases'

type Props = {
  shopList: Record<StoreCategory, ShopItem[]>
  checked: Record<string, boolean>
  onToggle: (id: string) => void
  initialIdx: number
  onIdxChange: (idx: number) => void
  pct: number
}

function scrollTo(ref: React.RefObject<HTMLDivElement | null>, idx: number) {
  const el = ref.current
  if (!el) return
  const child = el.children[idx] as HTMLElement
  if (child) child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
}

export default function ShopView({ shopList, checked, onToggle, initialIdx, onIdxChange, pct }: Props) {
  const shopCategories = STORE_CATEGORIES.filter(sc => shopList[sc].length > 0)
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
    const clamped = Math.max(0, Math.min(idx, shopCategories.length - 1))
    if (clamped !== activeIdx) {
      setActiveIdx(clamped)
      onIdxChange(clamped)
    }
  }

  return (
    <>
      {/* Progress bar */}
      <div className="px-4 pt-4 pb-3 flex flex-col gap-1">
        <span className="text-xs font-semibold text-gray-400 tracking-wider">
          {getProgressPhrase(pct)}
        </span>
        <div className="h-2 rounded-full overflow-hidden w-full bg-gray-200 shadow-inset-sm">
          <div
            className="h-full rounded-full transition-all duration-500 bg-green-500 shadow-glow-green"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="px-4 flex-1 flex flex-col min-h-0">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex gap-4 overflow-x-auto snap-x no-scrollbar flex-1 min-h-0"
        >
          {shopCategories.map((storeCat, scIdx) => {
            const items = shopList[storeCat]
            const style = STORE_CATEGORY_STYLE[storeCat]
            const doneCount = items.filter(i => checked[i.id]).length
            const isActive = scIdx === activeIdx

            return (
              <div
                key={storeCat}
                className="snap-center flex-shrink-0 w-[calc(100vw-2rem)] max-w-sm rounded-2xl flex flex-col bg-[var(--layer-1)]"
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{style.emoji}</span>
                    <span className={`text-lg font-black ${style.dotText}`}>{storeCat}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-medium">{doneCount}/{items.length} picked</p>
                    <div className="w-16 h-1.5 rounded-full overflow-hidden mt-1 bg-[var(--layer-3)]">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${style.dotBg}`}
                        style={{ width: items.length > 0 ? `${(doneCount / items.length) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="mx-4 h-px bg-black/5" />

                {/* Items list */}
                <div className="flex flex-col px-1 pb-2 overflow-y-auto flex-1 min-h-0">
                  {items.map((item, itemIdx) => {
                    const isChecked = !!checked[item.id]
                    return (
                      <div key={item.id}>
                        {itemIdx > 0 && <div className="h-px mx-3 bg-[var(--layer-2)]" />}
                        <button
                          onClick={() => onToggle(item.id)}
                          className={`flex items-start gap-3 w-full text-left px-3 py-3 rounded-xl transition-colors active:scale-98 ${
                            isChecked ? 'opacity-50' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <div
                            className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-md flex items-center justify-center transition-all ${
                              isChecked ? 'bg-[var(--layer-3)]' : `bg-[var(--layer-0)] ring-2 ${style.dotRing}`
                            }`}
                          >
                            {isChecked && <Check size={11} className="text-gray-400" />}
                          </div>

                          {/* Name + per-meal list */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-semibold ${isChecked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                {item.name}
                              </p>
                              {item.quantity && (
                                <p className="text-xs text-gray-400 flex-shrink-0 text-right leading-tight mt-0.5">{item.quantity}</p>
                              )}
                            </div>
                            {item.mealEntries.length > 0 && (
                              <div className="mt-1 flex flex-col gap-0.5">
                                {item.mealEntries.map((entry, i) => (
                                  <div key={i} className="flex items-baseline justify-between gap-2">
                                    <span className="text-xs text-gray-400 truncate">{entry.meal}</span>
                                    {entry.quantity && (
                                      <span className="text-xs text-gray-400 flex-shrink-0 text-right">{entry.quantity}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
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
        {shopCategories.map((storeCat, idx) => {
          const style = STORE_CATEGORY_STYLE[storeCat]
          return (
            <button
              key={storeCat}
              onClick={() => {
                setActiveIdx(idx)
                onIdxChange(idx)
                scrollTo(scrollRef, idx)
              }}
              className={`rounded-full transition-all duration-200 h-2 ${idx === activeIdx ? `w-6 ${style.dotBg}` : 'w-2 bg-gray-300'}`}
            />
          )
        })}
      </div>
    </>
  )
}
