'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import mealsData from '@/data/meals.json'
import type { Category, Meal, StoreCategory } from '@/lib/types'
import { STORAGE_KEY } from '@/lib/utils'
import CookView from '@/components/CookView'
import ShopView from '@/components/ShopView'
import { ListTodo, CookingPot } from 'lucide-react'

export default function Home() {
  const categories: Category[] = mealsData.categories as Category[]
  const router = useRouter()

  const [view, setView] = useState<'cook' | 'shop'>('shop')
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
        const allIds = categories.flatMap(cat => cat.meals.flatMap(m => m.ingredients.map(i => i.id)))
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

  // Build deduplicated shopping list grouped by store category
  const shopList: Record<StoreCategory, { id: string; name: string; quantity: string; meals: string[]; mealEntries: { meal: string; quantity: string }[] }[]> = {
    Produce: [], Meat: [], Dairy: [], Frozen: [], Dry: [],
  }
  const seenIngredients = new Map<string, { id: string; name: string; quantities: string[]; meals: string[]; mealEntries: { meal: string; quantity: string }[]; category: string }>()
  categories.forEach(cat => {
    cat.meals.forEach(meal => {
      meal.ingredients.forEach(ing => {
        const key = ing.name.toLowerCase()
        const perMealQty = ing.mealQuantity || ing.quantity || ''
        if (seenIngredients.has(key)) {
          const existing = seenIngredients.get(key)!
          existing.meals.push(meal.name)
          existing.mealEntries.push({ meal: meal.name, quantity: perMealQty })
          // Only add quantity if it's distinct (avoids repeating identical strings)
          if (ing.quantity && !existing.quantities.includes(ing.quantity)) {
            existing.quantities.push(ing.quantity)
          }
        } else {
          seenIngredients.set(key, { id: ing.id, name: ing.name, quantities: ing.quantity ? [ing.quantity] : [], meals: [meal.name], mealEntries: [{ meal: meal.name, quantity: perMealQty }], category: ing.category })
        }
      })
    })
  })
  seenIngredients.forEach(ing => {
    const cat = ing.category as StoreCategory
    if (shopList[cat]) shopList[cat].push({ ...ing, quantity: ing.quantities.join(' + ') })
  })

  // Progress calculation
  const allIngredients = categories.flatMap(cat => cat.meals.flatMap(m => m.ingredients))
  const done = allIngredients.filter(i => checked[i.id]).length
  const total = allIngredients.length
  const pct = total > 0 ? (done / total) * 100 : 0

  function toggleIngredient(id: string) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function handleMealSelect(_catIdx: number, meal: Meal) {
    router.push(`/meal/${meal.id}`)
  }

  function handleToggleView() {
    setView(v => v === 'shop' ? 'cook' : 'shop')
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

      {/* Floating view toggle */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleToggleView}
          className="flex items-center h-8 rounded-xl p-1 gap-1 bg-white/55 backdrop-blur-[3px] shadow-float border border-white/40"
        >
          <div className={`flex items-center h-6 rounded-lg text-sm font-semibold overflow-hidden transition-[background-color,color,box-shadow,padding] duration-300 ease-in-out ${view === 'shop' ? 'bg-[var(--layer-0)] text-gray-900 shadow-sm px-3 py-1' : 'text-gray-400 px-2 py-1'}`}>
            <ListTodo size={14} className="flex-shrink-0" />
            <span className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,padding-left] duration-300 ease-in-out [will-change:opacity,max-width] ${view === 'shop' ? 'max-w-[3rem] opacity-100 pl-1.5' : 'max-w-0 opacity-0 pl-0'}`}>
              Shop
            </span>
          </div>
          <div className={`flex items-center h-6 rounded-lg text-sm font-semibold overflow-hidden transition-[background-color,color,box-shadow,padding] duration-300 ease-in-out ${view === 'cook' ? 'bg-[var(--layer-0)] text-gray-900 shadow-sm px-3 py-1' : 'text-gray-400 px-2 py-1'}`}>
            <CookingPot size={14} className="flex-shrink-0" />
            <span className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,padding-left] duration-300 ease-in-out [will-change:opacity,max-width] ${view === 'cook' ? 'max-w-[3rem] opacity-100 pl-1.5' : 'max-w-0 opacity-0 pl-0'}`}>
              Cook
            </span>
          </div>
        </button>
      </div>
    </main>
  )
}
