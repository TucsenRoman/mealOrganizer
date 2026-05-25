'use client'

import { useState, useEffect } from 'react'
import { Pencil, Check } from 'lucide-react'
import type { StoreCategory, ShopItem } from '@/lib/types'
import { STORE_CATEGORIES, STORE_CATEGORY_STYLE, BUDGET_STORAGE_KEY } from '@/lib/utils'

type Props = {
  shopList: Record<StoreCategory, ShopItem[]>
}

type CatRow = { cat: StoreCategory; amount: number; count: number }

export default function BudgetView({ shopList }: Props) {
  const [goal, setGoal] = useState<number | null>(null)
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')

  useEffect(() => {
    try {
      const s = localStorage.getItem(BUDGET_STORAGE_KEY)
      if (s) setGoal(parseFloat(s))
    } catch {}
  }, [])

  // Compute totals per category + unpriced items
  let grandTotal = 0
  const catRows: CatRow[] = []
  const unpricedAll: Array<{ item: ShopItem; cat: StoreCategory }> = []

  STORE_CATEGORIES.forEach(cat => {
    const items = shopList[cat] ?? []
    let catTotal = 0
    let catCount = 0
    items.forEach(item => {
      if (item.price !== null) {
        catTotal += item.price
        catCount++
        grandTotal += item.price
      } else {
        unpricedAll.push({ item, cat })
      }
    })
    if (catTotal > 0) catRows.push({ cat, amount: catTotal, count: catCount })
  })

  catRows.sort((a, b) => b.amount - a.amount)
  const maxAmt = Math.max(...catRows.map(r => r.amount), 1)
  const pricedCount = catRows.reduce((s, r) => s + r.count, 0)

  const delta = goal !== null ? goal - grandTotal : null
  const overBudget = delta !== null && delta < 0
  const goalPct = goal && goal > 0 ? Math.min((grandTotal / goal) * 100, 100) : 0

  function saveGoal() {
    const v = parseFloat(input)
    if (!isNaN(v) && v > 0) {
      setGoal(v)
      try { localStorage.setItem(BUDGET_STORAGE_KEY, String(v)) } catch {}
    }
    setEditing(false)
  }

  function startEdit() {
    setInput(goal != null ? String(Math.round(goal)) : '')
    setEditing(true)
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28 flex flex-col gap-4 no-scrollbar">

      {/* ── Summary card ── */}
      <div className="rounded-2xl bg-[var(--layer-1)] p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          {/* Left: total */}
          <div>
            <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1">
              Estimated Total
            </p>
            <p className="text-4xl font-black text-gray-900 leading-none tabular-nums">
              ${grandTotal.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {pricedCount} priced · {unpricedAll.length} still TBD
            </p>
          </div>

          {/* Right: budget goal */}
          <div className="flex flex-col items-end gap-1.5 pt-1 min-w-0">
            {!editing ? (
              <>
                <button
                  onClick={startEdit}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-[var(--layer-2)] rounded-xl px-3 py-1.5 active:scale-95 transition-transform whitespace-nowrap"
                >
                  {goal != null ? `$${Math.round(goal)} budget` : '+ Set budget'}
                  <Pencil size={10} className="text-gray-400 flex-shrink-0" />
                </button>
                {delta != null && (
                  <p className={`text-xs font-bold ${overBudget ? 'text-red-500' : 'text-green-600'}`}>
                    {overBudget
                      ? `$${Math.abs(delta).toFixed(2)} over`
                      : `$${delta.toFixed(2)} left`}
                  </p>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-gray-400">$</span>
                <input
                  autoFocus
                  type="number"
                  inputMode="decimal"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveGoal()
                    if (e.key === 'Escape') setEditing(false)
                  }}
                  className="w-20 text-sm font-bold text-right bg-white border border-[var(--layer-3)] rounded-lg px-2 py-1.5 outline-none focus:border-blue-400"
                  placeholder="400"
                />
                <button
                  onClick={saveGoal}
                  className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center active:scale-95 transition-transform"
                >
                  <Check size={13} className="text-white" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Goal progress bar */}
        {goal != null && (
          <div className="flex flex-col gap-1">
            <div className="h-2 rounded-full overflow-hidden bg-[var(--layer-3)] shadow-inset-sm">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overBudget ? 'bg-red-500' : 'bg-green-500 shadow-glow-green'
                }`}
                style={{ width: `${goalPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 text-right">
              {goalPct.toFixed(0)}% of ${Math.round(goal)} used
            </p>
          </div>
        )}
      </div>

      {/* ── Category breakdown ── */}
      {catRows.length > 0 && (
        <div className="rounded-2xl bg-[var(--layer-1)] p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase">
            By Category
          </p>
          <div className="flex flex-col gap-3">
            {catRows.map(({ cat, amount, count }) => {
              const style = STORE_CATEGORY_STYLE[cat]
              const pct = (amount / maxAmt) * 100
              return (
                <div key={cat} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{style.emoji}</span>
                      <span className={`text-sm font-bold ${style.dotText}`}>{cat}</span>
                      <span className="text-xs text-gray-400">{count} items</span>
                    </div>
                    <span className="text-sm font-bold text-gray-700 tabular-nums">
                      ${amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-[var(--layer-3)]">
                    <div
                      className={`h-full rounded-full ${style.dotBg} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Unpriced / TBD items ── */}
      {unpricedAll.length > 0 && (
        <div className="rounded-2xl bg-[var(--layer-1)] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase">
              Still TBD
            </p>
            <span className="text-xs font-semibold bg-[var(--layer-2)] text-gray-500 rounded-full px-2 py-0.5">
              {unpricedAll.length}
            </span>
          </div>
          <div className="flex flex-col">
            {unpricedAll.map(({ item, cat }, idx) => {
              const style = STORE_CATEGORY_STYLE[cat]
              return (
                <div key={item.id}>
                  {idx > 0 && <div className="h-px bg-[var(--layer-2)]" />}
                  <div className="flex items-center gap-3 py-2.5">
                    <span className="text-sm flex-shrink-0">{style.emoji}</span>
                    <p className="text-sm font-medium text-gray-600 flex-1 min-w-0 truncate">
                      {item.name}
                    </p>
                    {item.quantity && item.quantity !== 'TBD' && (
                      <p className="text-xs text-gray-400 flex-shrink-0 max-w-[38%] truncate text-right">
                        {item.quantity}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
