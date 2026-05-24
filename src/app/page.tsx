'use client'

import { useState, useEffect } from 'react'
import mealsData from '@/data/meals.json'
import { getRandomVibe } from '@/data/phrases'
import type { Category, Meal, StoreCategory } from '@/lib/types'
import { STORAGE_KEY } from '@/lib/utils'
import Header from '@/components/Header'
import CookView from '@/components/CookView'
import ShopView from '@/components/ShopView'
import MealDetailView from '@/components/MealDetailView'

export default function Home() {
  const categories: Category[] = mealsData.categories as Category[]

  const [view, setView] = useState<'cook' | 'shop'>('shop')
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0)
  const [activeShopIdx, setActiveShopIdx] = useState(0)
  const [selectedMeal, setSelectedMeal] = useState<{ catIdx: number; meal: Meal } | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [vibe, setVibe] = useState<{ title: string; pct: number } | null>(null)

  // Roll vibe on mount
  useEffect(() => {
    setVibe(getRandomVibe())
  }, [])

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
  const shopList: Record<StoreCategory, { id: string; name: string; quantity: string; meals: string[] }[]> = {
    Produce: [], Meat: [], Dairy: [], Frozen: [], Dry: [],
  }
  const seenIngredients = new Map<string, { id: string; name: string; quantities: string[]; meals: string[]; category: string }>()
  categories.forEach(cat => {
    cat.meals.forEach(meal => {
      meal.ingredients.forEach(ing => {
        const key = ing.name.toLowerCase()
        if (seenIngredients.has(key)) {
          const existing = seenIngredients.get(key)!
          existing.meals.push(meal.name)
          // Only add quantity if it's distinct (avoids repeating identical strings)
          if (ing.quantity && !existing.quantities.includes(ing.quantity)) {
            existing.quantities.push(ing.quantity)
          }
        } else {
          seenIngredients.set(key, { id: ing.id, name: ing.name, quantities: ing.quantity ? [ing.quantity] : [], meals: [meal.name], category: ing.category })
        }
      })
    })
  })
  seenIngredients.forEach(ing => {
    const cat = ing.category as StoreCategory
    if (shopList[cat]) shopList[cat].push({ ...ing, quantity: ing.quantities.join(' + ') })
  })

  // Progress calculation for header
  const allIngredients = categories.flatMap(cat => cat.meals.flatMap(m => m.ingredients))
  const done = allIngredients.filter(i => checked[i.id]).length
  const total = allIngredients.length
  const pct = total > 0 ? (done / total) * 100 : 0

  function toggleIngredient(id: string) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function handleMealSelect(catIdx: number, meal: Meal) {
    setSelectedMeal({ catIdx, meal })
  }

  function handleBack() {
    setSelectedMeal(null)
  }

  function handleToggleView() {
    setView(v => v === 'shop' ? 'cook' : 'shop')
  }

  // Meal detail view
  if (selectedMeal) {
    return (
      <MealDetailView
        meal={selectedMeal.meal}
        cat={categories[selectedMeal.catIdx]}
        categories={categories}
        onBack={handleBack}
      />
    )
  }

  // Main view
  return (
    <main className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: 'var(--layer-0)' }}>
      <Header
        view={view}
        onToggle={handleToggleView}
        pct={pct}
        vibe={vibe}
      />

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
        />
      )}
    </main>
  )
}
