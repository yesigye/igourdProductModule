/**
 * Generate Cartesian product of multiple arrays
 * @param {Array} arrays - Array of arrays to combine
 * @returns {Array} Cartesian product combinations
 */
export function cartesianProduct(arrays) {
  return arrays.reduce((acc, curr) => {
    return acc.flatMap(x => curr.map(y => [...x, y]))
  }, [[]])
}

/**
 * Generate SKU combinations from specifications
 * @param {Array} specifications - Array of specification objects
 * @returns {Array} Array of SKU combination objects
 */
export function generateSkuCombinations(specifications) {
  if (!specifications || specifications.length === 0) {
    return []
  }

  // Extract values arrays for cartesian product
  const specArrays = specifications.map(spec => spec.values)
  
  // Generate all combinations
  const combinations = cartesianProduct(specArrays)
  
  // Convert to SKU objects
  return combinations.map((combination, index) => {
    const specs = {}
    const specValues = []
    
    specifications.forEach((spec, specIndex) => {
      specs[spec.name] = combination[specIndex]
      specValues.push(combination[specIndex])
    })
    
    return {
      id: index + 1,
      specs,
      specValues,
      skuCode: `SKU${String(index + 1).padStart(3, '0')}`,
      barcode: `BC${String(index + 1).padStart(5, '0')}`,
      stock: 0,
      costPrice: 0,
      status: 'active'
    }
  })
}

/**
 * Calculate total number of possible combinations
 * @param {Array} specifications - Array of specification objects
 * @returns {Number} Total number of combinations
 */
export function calculateTotalCombinations(specifications) {
  if (!specifications || specifications.length === 0) return 0
  
  return specifications.reduce((total, spec) => {
    return total * (spec.values.length || 1)
  }, 1)
}