'use client'

import { useRef, useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import type { StoreCategory, ShopItem } from '@/lib/types'
import { STORE_CATEGORIES, STORE_CATEGORY_STYLE } from '@/lib/utils'

type Props = {
  shopList: Record<StoreCategory, ShopItem[]>
  checked: Record<string, boolean>
  onToggle: (id: string) => void
  initialIdx: number
  onIdxChange: (idx: number) => void
}

function scrollTo(ref: React.RefObject<HTMLDivElement | null>, idx: number) {
  const el = ref.current
  if (!el) return
  const child = el.children[idx] as HTMLElement
  if (child) child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
}

export default function ShopView({ shopList, checked, onToggle, initialIdx, onIdxChange }: Props) {
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
      <div className="px-4 pt-4">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex gap-4 overflow-x-auto snap-x no-scrollbar"
        >
          {shopCategories.map((storeCat, scIdx) => {
            const items = shopList[storeCat]
            const style = STORE_CATEGORY_STYLE[storeCat]
            const doneCount = items.filter(i => checked[i.id]).length
            const isActive = scIdx === activeIdx

            return (
              <div
                key={storeCat}
                className={`
                  snap-center flex-shrink-0 w-[calc(100vw-2rem)] max-w-sm
                  rounded-2xl ${style.bg} flex flex-col
                  transition-all duration-200
                  ${isActive ? '' : 'opacity-60'}
                `}
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{style.emoji}</span>
                    <span className={`text-lg font-black ${style.text}`}>{storeCat}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-medium">{doneCount}/{items.length} picked</p>
                    <div className="w-16 h-1.5 bg-white/70 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: items.length > 0 ? `${(doneCount / items.length) * 100}%` : '0%',
                          backgroundColor: style.dot,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="mx-4 h-px bg-black/5" />

                {/* Items list */}
                <div className="flex flex-col divide-y divide-black/5 px-1 pb-2 overflow-y-auto max-h-[55vh]">
                  {items.map(item => {
                    const isChecked = !!checked[item.id]
                    return (
                      <button
                        key={item.id}
                        onClick={() => onToggle(item.id)}
                        className={`flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl transition-colors active:scale-98 ${
                          isChecked ? 'opacity-50' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <div
                          className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all shadow-sm"
                          style={{
                            backgroundColor: isChecked ? '#E5E7EB' : 'white',
                            boxShadow: isChecked ? 'none' : `0 0 0 2px ${style.dot}`,
                          }}
                        >
                          {isChecked && <Check size={11} className="text-gray-400" />}
                        </div>

                        {/* Name + quantity + shared with */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${isChecked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {item.name}
                          </p>
                          {item.quantity && (
                            <p className="text-xs text-gray-400">{item.quantity}</p>
                          )}
                          {item.meals.length > 0 && (
                            <p className="text-xs mt-0.5 truncate text-gray-400">
                              For {item.meals.join(', ')}
                            </p>
                          )}
                        </div>
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
              className="rounded-full transition-all duration-200"
              style={{
                width: idx === activeIdx ? 24 : 8,
                height: 8,
                backgroundColor: idx === activeIdx ? style.dot : '#D1D5DB',
              }}
            />
          )
        })}
      </div>
    </>
  )
}
