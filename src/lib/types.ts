export type StoreCategory = 'Produce' | 'Meat' | 'Dairy' | 'Frozen' | 'Dry'

export type Item = {
  id: string
  name: string
  quantity: string   // Full purchase description, e.g. "2x 48 oz bags ($7.42 each, $14.84 total)"
  price: number | null  // Total cost of this purchase (null = TBD)
  category: StoreCategory
  usedIn: Record<string, string>  // mealId -> amount used in that meal
  notes: string
  store: 'Walmart' | 'Safeway' | 'Pre-Trip'
  bringing?: { who: string; amount: string } | null
}

// A meal's reference to an item — what amount of it this meal uses and how to prep it
export type MealIngredient = {
  itemId: string
  amount: string     // How much of the item this meal uses, e.g. "~1.5 lbs", "1 loaf", "~2 cups"
  use?: string       // What this ingredient does in this specific meal
  prep?: string      // How to prep it for this meal
}

export type Meal = {
  id: string
  name: string
  side: string | null
  notes?: string
  ingredients: MealIngredient[]
}

export type Category = {
  id: string
  label: string
  emoji: string
  color: string
  meals: Meal[]
}

export type ShopItem = {
  id: string
  name: string
  quantity: string
  price: number | null
  category: StoreCategory
  store: 'Walmart' | 'Safeway' | 'Pre-Trip'
  bringing?: { who: string; amount: string } | null
  meals: string[]
  mealEntries: { meal: string; quantity: string }[]
}
