export type Ingredient = {
  id: string
  name: string
  quantity: string
  category: string
  notes: string
  bringing?: { who: string; amount: string }
}

export type Meal = {
  id: string
  name: string
  side: string | null
  confirmed: boolean
  notes?: string
  ingredients: Ingredient[]
}

export type Category = {
  id: string
  label: string
  emoji: string
  color: string
  meals: Meal[]
}

export type StoreCategory = 'Produce' | 'Meat' | 'Dairy' | 'Frozen' | 'Dry'

export type ShopItem = {
  id: string
  name: string
  quantity: string
  meals: string[]
}
