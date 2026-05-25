'use client'

import { useRef, useEffect, useState } from 'react'
import { Check, Info, X } from 'lucide-react'
import type { StoreCategory, ShopItem } from '@/lib/types'
import { STORE_CATEGORIES, STORE_CATEGORY_STYLE, parseItemDisplay } from '@/lib/utils'
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
  const [popup, setPopup] = useState<ShopItem | null>(null)
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
                <div className="flex flex-col pb-2 overflow-y-auto flex-1 min-h-0">
                  {items.map((item, itemIdx) => {
                    const isChecked = !!checked[item.id]
                    const hasMeals = item.mealEntries.length > 0

                    return (
                      <div key={item.id} className={isChecked ? 'opacity-50' : ''}>
                        {itemIdx > 0 && <div className="h-px mx-4 bg-[var(--layer-2)]" />}

                        <div className="flex items-center">

                          {/* Checkbox — left tap zone */}
                          <button
                            onClick={() => onToggle(item.id)}
                            className="flex-shrink-0 flex items-center justify-center w-12 self-stretch active:opacity-60 transition-opacity"
                          >
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                isChecked ? 'bg-[var(--layer-3)]' : `bg-[var(--layer-0)] ring-2 ${style.dotRing}`
                              }`}
                            >
                              {isChecked && <Check size={11} className="text-gray-400" />}
                            </div>
                          </button>

                          {/* Name + qty/price stacked — middle */}
                          {(() => {
                            const { displayName, count, unitPrice, size } = parseItemDisplay(item.name, item.quantity, item.price)
                            const isCountUnit = size ? /count|ct/i.test(size) : false
                            const left = count > 1
                              ? (isCountUnit || !size ? `${count} count` : `${count} x ${size}`)
                              : (isCountUnit && !size!.startsWith('1 ') ? `1 x ${size}` : size ?? '1 count')
                            const right = unitPrice !== null ? `~$${unitPrice.toFixed(2)}` : 'TBD'
                            const meta = [left, right].filter(Boolean).join(' | ')
                            return (
                              <div className="flex-1 min-w-0 py-3 pr-1">
                                <p className={`text-sm font-semibold leading-snug ${isChecked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                  {displayName}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5 tabular-nums">{meta}</p>
                              </div>
                            )
                          })()}

                          {/* Info icon — right tap zone */}
                          {hasMeals && (
                            <button
                              onClick={() => setPopup(item)}
                              className="flex-shrink-0 flex items-center justify-center w-11 self-stretch active:opacity-60 transition-opacity"
                            >
                              <Info size={15} className="text-gray-300" />
                            </button>
                          )}
                        </div>
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

      {/* Meal breakdown popup */}
      {popup && (
        <div
          className="fixed inset-0 z-[60] flex items-end"
          onClick={() => setPopup(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

          {/* Sheet */}
          <div
            className="relative w-full bg-[var(--layer-0)] rounded-t-3xl shadow-float px-5 pt-5 pb-10"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 rounded-full bg-[var(--layer-3)] mx-auto mb-5" />

            {/* Item name + price */}
            <div className="mb-4">
              <p className="text-base font-bold text-gray-900 leading-snug">{popup.name}</p>
              <div className="flex items-baseline gap-2 mt-1">
                {popup.price !== null && (
                  <span className="text-sm font-bold text-gray-700">${popup.price.toFixed(2)}</span>
                )}
                {popup.quantity && popup.quantity !== 'TBD' && (
                  <span className="text-xs text-gray-400">{popup.quantity}</span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[var(--layer-2)] mb-3" />

            {/* Meal entries */}
            <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-2">Used in</p>
            <div className="flex flex-col">
              {popup.mealEntries.map((entry, i) => (
                <div key={i}>
                  {i > 0 && <div className="h-px bg-[var(--layer-2)]" />}
                  <div className="flex items-baseline justify-between gap-4 py-2.5">
                    <span className="text-sm font-medium text-gray-700">{entry.meal}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{entry.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Close button */}
            <button
              onClick={() => setPopup(null)}
              className="absolute top-5 right-5 w-7 h-7 rounded-full bg-[var(--layer-2)] flex items-center justify-center active:scale-95 transition-transform"
            >
              <X size={13} className="text-gray-500" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
