import type { StoreCategory } from './types'

export const STORE_CATEGORIES: StoreCategory[] = ['Produce', 'Meat', 'Dairy', 'Frozen', 'Dry']

export const STORE_CATEGORY_STYLE: Record<StoreCategory, { bg: string; text: string; dot: string; shadow: string; emoji: string }> = {
  Produce: { bg: 'bg-green-50',  text: 'text-green-700',  dot: '#16a34a', shadow: 'shadow-green-200',  emoji: '🥦' },
  Meat:    { bg: 'bg-red-50',    text: 'text-red-700',    dot: '#dc2626', shadow: 'shadow-red-200',    emoji: '🥩' },
  Dairy:   { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: '#d97706', shadow: 'shadow-yellow-200', emoji: '🧀' },
  Frozen:  { bg: 'bg-sky-50',    text: 'text-sky-700',    dot: '#0284c7', shadow: 'shadow-sky-200',    emoji: '❄️' },
  Dry:     { bg: 'bg-stone-100', text: 'text-stone-600',  dot: '#78716c', shadow: 'shadow-stone-200',  emoji: '🛒' },
}

export function getCategoryBg(color: string) {
  const map: Record<string, string> = {
    '#F59E0B': 'bg-amber-50',
    '#3B82F6': 'bg-blue-50',
    '#A855F7': 'bg-purple-50',
  }
  return map[color] ?? 'bg-gray-50'
}

export function getCategoryAccent(color: string) {
  const map: Record<string, string> = {
    '#F59E0B': 'bg-amber-400 text-white',
    '#3B82F6': 'bg-blue-500 text-white',
    '#A855F7': 'bg-purple-500 text-white',
  }
  return map[color] ?? 'bg-gray-500 text-white'
}

export function getCategoryText(color: string) {
  const map: Record<string, string> = {
    '#F59E0B': 'text-amber-600',
    '#3B82F6': 'text-blue-600',
    '#A855F7': 'text-purple-600',
  }
  return map[color] ?? 'text-gray-600'
}

export function getCategoryIngredientBg(category: string) {
  const map: Record<string, string> = {
    Dairy:   'bg-yellow-50 border-yellow-200 text-yellow-700',
    Dry:     'bg-stone-100 border-stone-200 text-stone-600',
    Frozen:  'bg-sky-50 border-sky-200 text-sky-700',
    Meat:    'bg-red-50 border-red-200 text-red-700',
    Produce: 'bg-green-50 border-green-200 text-green-700',
  }
  return map[category] ?? 'bg-gray-50 border-gray-200 text-gray-600'
}

export const STORAGE_KEY = 'meal-planner-checked'
