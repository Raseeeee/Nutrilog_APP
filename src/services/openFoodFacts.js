/**
 * OpenFoodFacts API — 100% gratuita, sin auth, sin límites de tasa duros.
 * Docs: https://wiki.openfoodfacts.org/API
 */
const BASE = 'https://world.openfoodfacts.org'

function parseProduct(p) {
  const n = p.nutriments || {}
  return {
    id: p.code || p._id,
    name: p.product_name || p.generic_name || 'Producto sin nombre',
    brand: p.brands || '',
    quantity: p.quantity || '',
    imageUrl: p.image_front_small_url || p.image_url || null,
    kcal: n['energy-kcal_100g'] || Math.round((n['energy_100g'] || 0) / 4.184) || 0,
    protein: n['proteins_100g'] || 0,
    carbs: n['carbohydrates_100g'] || 0,
    fat: n['fat_100g'] || 0,
    fiber: n['fiber_100g'] || 0,
    sugar: n['sugars_100g'] || 0,
  }
}

/**
 * Búsqueda por texto libre.
 * @param {string} query
 * @param {number} pageSize
 * @returns {Promise<Array>}
 */
export async function searchFoods(query, pageSize = 10) {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: 1,
    action: 'process',
    json: 1,
    page_size: pageSize,
    fields: 'code,product_name,generic_name,brands,quantity,nutriments,image_front_small_url',
  })
  const res = await fetch(`${BASE}/cgi/search.pl?${params}`)
  if (!res.ok) throw new Error('Error al contactar OpenFoodFacts')
  const data = await res.json()
  return (data.products || [])
    .filter(p => p.product_name && p.nutriments)
    .map(parseProduct)
}

/**
 * Búsqueda por código de barras.
 * @param {string} barcode
 * @returns {Promise<Object|null>}
 */
export async function getProductByBarcode(barcode) {
  const res = await fetch(`${BASE}/api/v0/product/${barcode}.json`)
  if (!res.ok) throw new Error('Error al contactar OpenFoodFacts')
  const data = await res.json()
  if (data.status !== 1) return null
  return parseProduct(data.product)
}
