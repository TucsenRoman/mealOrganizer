import type { StoreCategory } from './types'

export const STORE_CATEGORIES: StoreCategory[] = ['Produce', 'Meat', 'Dairy', 'Frozen', 'Dry']

export const STORE_CATEGORY_STYLE: Record<StoreCategory, { bg: string; text: string; dot: string; shadow: string; emoji: string }> = {
  Produce: { bg: 'bg-green-50',  text: 'text-green-700',  dot: '#7dba97', shadow: 'shadow-green-200',  emoji: '🥦' },
  Meat:    { bg: 'bg-red-50',    text: 'text-red-700',    dot: '#d98080', shadow: 'shadow-red-200',    emoji: '🥩' },
  Dairy:   { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: '#e0bf6a', shadow: 'shadow-yellow-200', emoji: '🧀' },
  Frozen:  { bg: 'bg-sky-50',    text: 'text-sky-700',    dot: '#5aaecf', shadow: 'shadow-sky-200',    emoji: '❄️' },
  Dry:     { bg: 'bg-stone-100', text: 'text-stone-600',  dot: '#ba9d7e', shadow: 'shadow-stone-200',  emoji: '🍞' },
}

export const STORAGE_KEY = 'meal-planner-checked'
