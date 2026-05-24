export type Ingredient = {
  id: string
  name: string
  quantity: string
  category: string
  notes: string
  use?: string        // What this ingredient is for in this specific meal
  prep?: string       // How to prep it (e.g. "dice", "cook until 165°F")
  mealQuantity?: string // How much is used for THIS meal (when shared across meals)
  bringing?: { who: string; amount: string }
}

export type Meal = {
  id: string
  name: string
  side: string | null
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
  mealEntries: { meal: string; quantity: string }[]
}
