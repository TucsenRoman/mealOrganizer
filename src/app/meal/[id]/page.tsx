'use client'

import { useParams, useRouter } from 'next/navigation'
import mealsData from '@/data/meals.json'
import type { Category } from '@/lib/types'
import MealDetailView from '@/components/MealDetailView'

export default function MealPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const categories: Category[] = mealsData.categories as Category[]

  // Find the meal and its category across all categories
  let foundMeal = null
  let foundCat = null
  for (const cat of categories) {
    const meal = cat.meals.find(m => m.id === id)
    if (meal) {
      foundMeal = meal
      foundCat = cat
      break
    }
  }

  if (!foundMeal || !foundCat) {
    return (
      <main className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--layer-0)' }}>
        <p className="text-gray-400 text-sm">Meal not found.</p>
      </main>
    )
  }

  return (
    <MealDetailView
      meal={foundMeal}
      cat={foundCat}
      categories={categories}
      onBack={() => router.back()}
    />
  )
}
