/**
 * Returns the applicable unit price for a given quantity based on price_tiers.
 * Falls back to product.price if no tiers are defined or no tier matches.
 */
export function getPriceForQuantity(product, quantity) {
  const tiers = product?.price_tiers;
  if (!tiers || tiers.length === 0) return product.price;

  const sorted = [...tiers].sort((a, b) => a.min_qty - b.min_qty);
  let applicable = product.price;
  for (const tier of sorted) {
    if (quantity >= tier.min_qty) {
      applicable = tier.price;
    }
  }
  return applicable;
}

/**
 * Returns the base price (first tier / product.price) for display purposes.
 */
export function getBasePrice(product) {
  const tiers = product?.price_tiers;
  if (!tiers || tiers.length === 0) return product.price;
  const sorted = [...tiers].sort((a, b) => a.min_qty - b.min_qty);
  return sorted[0].price;
}