'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import mealsData from '@/data/meals.json'
import type { Category, Item, Meal, ShopItem, StoreCategory } from '@/lib/types'
import { STORAGE_KEY } from '@/lib/utils'
import CookView from '@/components/CookView'
import ShopView from '@/components/ShopView'
import BudgetView from '@/components/BudgetView'
import { ListTodo, CookingPot, DollarSign, PiggyBank, Settings } from 'lucide-react'

export default function Home() {
  const categories: Category[] = mealsData.categories as Category[]
  const items = mealsData.items as Record<string, Item>
  const router = useRouter()

  const [view, setView] = useState<'cook' | 'shop' | 'budget'>('shop')
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0)
  const [activeShopIdx, setActiveShopIdx] = useState(0)
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  // Load checked from localStorage, auto-flip to cook if all done
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setChecked(parsed)
        const allIds = Object.keys(items)
        const allDone = allIds.length > 0 && allIds.every(id => parsed[id])
        if (allDone) setView('cook')
      }
    } catch {}
  }, [])

  // Persist checked state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked))
    } catch {}
  }, [checked])

  // Build a mealId -> meal name lookup from categories
  const mealNameMap: Record<string, string> = {}
  categories.forEach(cat => {
    cat.meals.forEach(meal => { mealNameMap[meal.id] = meal.name })
  })

  // Collect on-deck meal IDs so we can exclude their exclusive items from the shop list
  const onDeckMealIds = new Set<string>(
    categories.find(c => c.id === 'on-deck')?.meals.map(m => m.id) ?? []
  )

  // Build shopping list from the items dictionary.
  // Each item appears exactly once. mealEntries comes directly from item.usedIn.
  const shopList: Record<StoreCategory, ShopItem[]> = {
    Produce: [], Meat: [], Dairy: [], Frozen: [], Dry: [],
  }

  Object.values(items).forEach(item => {
    // Items brought from home don't need to be purchased
    if (item.store === 'Home') return

    // Items used exclusively in on-deck meals don't belong on the shop list
    const usedInIds = Object.keys(item.usedIn ?? {})
    if (usedInIds.length > 0 && usedInIds.every(id => onDeckMealIds.has(id))) return

    const mealEntries = Object.entries(item.usedIn ?? {}).map(([mealId, amount]) => ({
      meal: mealNameMap[mealId] ?? mealId,
      quantity: amount,
    }))
    const shopItem: ShopItem = {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      category: item.category,
      store: item.store,
      comparePrice: item.comparePrice ?? null,
      bringing: item.bringing,
      meals: mealEntries.map(e => e.meal),
      mealEntries,
    }
    if (shopList[item.category]) {
      shopList[item.category].push(shopItem)
    }
  })

  // Progress: count items checked vs total items
  const allItemIds = Object.keys(items)
  const done = allItemIds.filter(id => checked[id]).length
  const total = allItemIds.length
  const pct = total > 0 ? (done / total) * 100 : 0

  function toggleIngredient(id: string) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function handleMealSelect(_catIdx: number, meal: Meal) {
    router.push(`/meal/${meal.id}`)
  }

  // Main view
  return (
    <main className="flex flex-col h-screen overflow-hidden bg-[var(--layer-0)]">
      {view === 'cook' && (
        <CookView
          categories={categories}
          onMealSelect={handleMealSelect}
          initialIdx={activeCategoryIdx}
          onIdxChange={setActiveCategoryIdx}
        />
      )}

      {view === 'shop' && (
        <ShopView
          shopList={shopList}
          checked={checked}
          onToggle={toggleIngredient}
          initialIdx={activeShopIdx}
          onIdxChange={setActiveShopIdx}
          pct={pct}
        />
      )}

      {view === 'budget' && (
        <BudgetView shopList={shopList} />
      )}

      {/* SETTINGS ~For theme switching. */}
      {/* <div className="fixed bottom-4 left-2 z-50">
        <div className="flex justify-center items-center w-8 h-8 rounded-xl border border-[var(--layer-1)] text-gray-400">
          <Settings size={18}/>
        </div>
      </div> */}

      {/* Floating view toggle — three individually-tappable tabs */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center p-1 gap-1 h-12 rounded-full backdrop-blur-[3px] shadow-lg">
          {([
            { key: 'shop',   Icon: ListTodo,    label: 'Shop'   },
            { key: 'cook',   Icon: CookingPot,  label: 'Cook'   },
            { key: 'budget', Icon: PiggyBank,  label: 'Budget' },
          ] as const).map(({ key, Icon, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`flex justify-center items-center px-3 py-1.5 h-full rounded-full text-sm font-semibold overflow-hidden transition-[background-color,color,box-shadow,padding] duration-300 ease-in-out ${
                view === key
                  ? 'text-gray-600 backdrop-blur-3 shadow-[var(--layer-2)] shadow-inner'
                  : 'text-gray-400'
              }`}
            >
              <Icon size={14} className="flex-shrink-0" />
              <span className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,padding-left] duration-300 ease-in-out [will-change:opacity,max-width] ${
                view === key ? 'max-w-[4rem] opacity-100 pl-1.5' : 'max-w-0 opacity-0 pl-0'
              }`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
