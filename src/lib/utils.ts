import type { StoreCategory } from './types'

export const STORE_CATEGORIES: StoreCategory[] = ['Produce', 'Meat', 'Dairy', 'Frozen', 'Dry']

export const STORE_CATEGORY_STYLE: Record<StoreCategory, {
  bg: string; text: string; shadow: string; emoji: string
  dotText: string; dotBg: string; dotRing: string
}> = {
  Produce: { bg: 'bg-green-50',  text: 'text-green-700',  shadow: 'shadow-green-200',  emoji: '🥦', dotText: 'text-[#7dba97]', dotBg: 'bg-[#7dba97]', dotRing: 'ring-[#7dba97]' },
  Meat:    { bg: 'bg-red-50',    text: 'text-red-700',    shadow: 'shadow-red-200',    emoji: '🥩', dotText: 'text-[#d98080]', dotBg: 'bg-[#d98080]', dotRing: 'ring-[#d98080]' },
  Dairy:   { bg: 'bg-yellow-50', text: 'text-yellow-700', shadow: 'shadow-yellow-200', emoji: '🧀', dotText: 'text-[#e0bf6a]', dotBg: 'bg-[#e0bf6a]', dotRing: 'ring-[#e0bf6a]' },
  Frozen:  { bg: 'bg-sky-50',    text: 'text-sky-700',    shadow: 'shadow-sky-200',    emoji: '❄️', dotText: 'text-[#5aaecf]', dotBg: 'bg-[#5aaecf]', dotRing: 'ring-[#5aaecf]' },
  Dry:     { bg: 'bg-stone-100', text: 'text-stone-600',  shadow: 'shadow-stone-200',  emoji: '🍞', dotText: 'text-[#ba9d7e]', dotBg: 'bg-[#ba9d7e]', dotRing: 'ring-[#ba9d7e]' },
}

export const STORAGE_KEY = 'meal-planner-checked'
