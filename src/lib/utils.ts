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
export const BUDGET_STORAGE_KEY = 'meal-planner-budget-goal'

/**
 * Parse a purchase total from a quantity string.
 */
export function parsePrice(quantity: string): number | null {
  if (!quantity) return null
  const totalSuffix = quantity.match(/~?\$(\d+(?:\.\d+)?)\s*total/i)
  if (totalSuffix) return parseFloat(totalSuffix[1])
  const totalPrefix = quantity.match(/total[,\s]+~?\$(\d+(?:\.\d+)?)/i)
  if (totalPrefix) return parseFloat(totalPrefix[1])
  const first = quantity.match(/~?\$(\d+(?:\.\d+)?)/)
  if (first) return parseFloat(first[1])
  return null
}

// Brand prefixes to strip from display names (order matters — longer first)
const BRAND_PREFIXES = [
  "Nature's Own Perfectly Crafted ",
  "Daisy Pure and Natural ",
  "Checkers & Rally's Famous ",
  "Campbell's Condensed ",
  "State Fair Classic ",
  "Eggo Homestyle ",
  "Great Value ",
  "Marketside ",
  "Nature's Own ",
  "State Fair ",
  "Campbell's ",
  "Honey Maid ",
  "Totino's ",
  "Jack's ",
  "Vlasic ",
  "Kraft ",
  "Eggo ",
  "80% Lean / 20% Fat ",
]

/**
 * Given an item's name, quantity string, and total price, returns:
 *  displayName — brand-stripped, size-suffix-stripped label
 *  count       — number of units being purchased (e.g. 2 for "2x bags")
 *  unitPrice   — per-unit cost derived from "each" price or total ÷ count
 *  size        — first size token found ("16 oz", "5 lb", etc.)
 */
export function parseItemDisplay(
  name: string,
  quantity: string,
  totalPrice: number | null,
): { displayName: string; count: number; unitPrice: number | null; size: string | null } {
  // Strip brand prefix
  let working = name
  for (const brand of BRAND_PREFIXES) {
    if (working.startsWith(brand)) { working = working.slice(brand.length); break }
  }

  // Split on first comma: everything before is the display name, ignore the rest
  const commaIdx = working.indexOf(',')
  const displayName = (commaIdx !== -1 ? working.slice(0, commaIdx) : working).trim()

  // Extract first size token from the full item name + quantity string.
  // Covers weight (oz, lb), volume (fl oz, gallon), and unit counts (count, ct, pack, pieces, slices).
  // Allow a hyphen or space between the number and unit ("3-count", "16 oz").
  const sizeMatch = (name + ' ' + quantity).match(
    /\b(\d+(?:\.\d+)?)[- ]?(fl oz|oz|lbs?|gallons?|gal|count|ct|packs?|pieces?|slices?|rolls?)\b/i,
  )
  const size = sizeMatch ? `${sizeMatch[1]} ${sizeMatch[2].toLowerCase()}` : null

  // Count: leading "Nx" or "N <word>"
  let count = 1
  const cxMatch = quantity.match(/^(\d+)x\s/i)
  const cwMatch = quantity.match(/^(\d+)\s+[a-zA-Z]/i)
  if (cxMatch) count = parseInt(cxMatch[1])
  else if (cwMatch) count = parseInt(cwMatch[1])

  // Unit price: prefer explicit "each" price, then derive from total
  let unitPrice: number | null = null
  const eachMatch = quantity.match(/~?\$(\d+(?:\.\d+)?)\s+each/i)
  if (eachMatch) {
    unitPrice = parseFloat(eachMatch[1])
  } else if (totalPrice !== null) {
    unitPrice = count > 1
      ? Math.round((totalPrice / count) * 100) / 100
      : totalPrice
  }

  return { displayName, count, unitPrice, size }
}
