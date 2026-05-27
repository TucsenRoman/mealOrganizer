'use client'

import type { StoreCategory, ShopItem } from '@/lib/types'
import { STORE_CATEGORIES, STORE_CATEGORY_STYLE } from '@/lib/utils'

// Inline hex colors for dynamic stacked-bar segments (Tailwind can't JIT arbitrary bg)
const CAT_HEX: Record<StoreCategory, string> = {
  Produce: '#7dba97',
  Meat:    '#d98080',
  Dairy:   '#e0bf6a',
  Frozen:  '#5aaecf',
  Dry:     '#ba9d7e',
}

type CatRow = { cat: StoreCategory; total: number; count: number }
type StoreSummary = { total: number; catRows: CatRow[]; itemCount: number }

function computeStore(allItems: ShopItem[], store: 'Safeway' | 'Walmart' | 'Pre-Trip'): StoreSummary {
  const items = allItems.filter(i => i.store === store && i.price !== null)
  let total = 0
  const catMap: Partial<Record<StoreCategory, CatRow>> = {}
  items.forEach(item => {
    total += item.price!
    if (!catMap[item.category]) catMap[item.category] = { cat: item.category, total: 0, count: 0 }
    catMap[item.category]!.total += item.price!
    catMap[item.category]!.count++
  })
  const catRows = (Object.values(catMap) as CatRow[]).sort((a, b) => b.total - a.total)
  return { total, catRows, itemCount: items.length }
}

// A horizontal bar split into colored segments, one per category
function StackedCatBar({ catRows, total }: { catRows: CatRow[]; total: number }) {
  if (total === 0) return null
  return (
    <div className="flex h-3 rounded-full overflow-hidden">
      {catRows.map((row, i) => (
        <div
          key={row.cat}
          style={{
            width: `${(row.total / total) * 100}%`,
            backgroundColor: CAT_HEX[row.cat],
            marginLeft: i === 0 ? 0 : 2,
          }}
          className="h-full flex-shrink-0"
        />
      ))}
    </div>
  )
}


function StoreCard({ store, summary }: { store: 'Safeway' | 'Walmart' | 'Pre-Trip'; summary: StoreSummary }) {
  const accentText = store === 'Safeway' ? 'text-red-700' : store === 'Walmart' ? 'text-blue-500' : 'text-purple-500'
  const accentBg   = store === 'Safeway' ? 'bg-red-100'   : store === 'Walmart' ? 'bg-blue-100'   : 'bg-purple-100'
  if (summary.itemCount === 0) return null

  return (
    <div className="rounded-2xl bg-[var(--layer-1)] p-4 flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${accentBg} ${accentText}`}>
            {store}
          </span>
          <span className="text-xs text-gray-400">{summary.itemCount} items</span>
        </div>
        <span className={`text-2xl font-black tabular-nums ${accentText}`}>
          ${summary.total.toFixed(2)}
        </span>
      </div>

      {/* Stacked category color bar */}
      <StackedCatBar catRows={summary.catRows} total={summary.total} />

      {/* Category legend */}
      <div className="flex flex-col gap-2">
        {summary.catRows.map(({ cat, total, count }) => {
          const style = STORE_CATEGORY_STYLE[cat]
          const pct = (total / summary.total) * 100
          return (
            <div key={cat} className="flex items-center gap-2">
              {/* Colored dot matching bar segment */}
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: CAT_HEX[cat] }}
              />
              {/* Emoji + name */}
              <span className="text-sm leading-none">{style.emoji}</span>
              <span className={`text-sm font-semibold flex-1 min-w-0 ${style.dotText}`}>{cat}</span>
              {/* Count */}
              <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
              {/* Percent */}
              <span className="text-xs text-gray-400 tabular-nums w-8 text-right">
                {pct.toFixed(0)}%
              </span>
              {/* Amount */}
              <span className="text-sm font-bold text-gray-700 tabular-nums w-14 text-right">
                ${total.toFixed(2)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function BudgetView({ shopList }: { shopList: Record<StoreCategory, ShopItem[]> }) {
  // Flatten all items
  const allItems: ShopItem[] = []
  STORE_CATEGORIES.forEach(cat => (shopList[cat] ?? []).forEach(i => allItems.push(i)))

  const safeway  = computeStore(allItems, 'Safeway')
  const walmart  = computeStore(allItems, 'Walmart')
  const pretrip  = computeStore(allItems, 'Pre-Trip')
  const estimate = safeway.total + walmart.total + pretrip.total
  const low  = estimate * 0.80
  const high = estimate * 1.20

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28 flex flex-col gap-4 no-scrollbar">

      {/* ── Summary card ── */}
      <div className="rounded-2xl bg-[var(--layer-1)] px-4 pt-4 pb-5 flex flex-col gap-4">

        {/* Estimated total */}
        <div>
          <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1">
            Estimated Total
          </p>
          <p className="text-4xl font-black text-gray-900 leading-none tabular-nums">
            ${estimate.toFixed(2)}
          </p>
        </div>

        {/* ±20% range */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
            20% buffer range (±${(estimate * 0.20).toFixed(2)})
          </p>

          {/* Track with center tick */}
          <div className="relative h-5 flex items-center">
            <div className="absolute inset-x-0 h-1.5 rounded-full bg-[var(--layer-3)]" />
            {/* Gradient fill from low→center→high */}
            <div className="absolute inset-x-0 h-1.5 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-green-300 via-gray-200 to-red-400 opacity-70" />
            </div>
            {/* Center tick = estimate */}
            <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-5 bg-gray-400 rounded-full" />
          </div>

          {/* Low / High labels */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold text-green-600">−20%</p>
              <p className="text-sm font-black text-gray-700 tabular-nums">${low.toFixed(2)}</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[10px] font-semibold text-gray-400">estimate</p>
              <p className="text-xs font-bold text-gray-500 tabular-nums">${estimate.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-red-600">+20%</p>
              <p className="text-sm font-black text-gray-700 tabular-nums">${high.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Safeway card ── */}
      <StoreCard store="Safeway" summary={safeway} />

      {/* ── Walmart card ── */}
      <StoreCard store="Walmart" summary={walmart} />

      {/* ── Pre-Trip card ── */}
      <StoreCard store="Pre-Trip" summary={pretrip} />

    </div>
  )
}
