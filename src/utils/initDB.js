import { productDB } from './db'

export async function initializeSampleData() {
  try {
    await productDB.init()

    // Check if we already have data
    const existingProducts = await productDB.getAllProducts()
    if (existingProducts.length > 0) {
      return // Data already exists
    }

    // Add sample categories
    const sampleCategories = [
      'Smartphones', 'Laptops', 'Headphones', 'Men\'s Wear', 
      'Women\'s Wear', 'Kids\' Clothing', 'Furniture', 'Cookware'
    ]
    
    for (const categoryName of sampleCategories) {
      await productDB.addCategory({ name: categoryName })
    }

    // Add sample product labels
    const sampleLabels = [
      'Global Logistics Depot',
      'Swift Stock Warehouse', 
      'Central Distribution Center',
      'Elite Storage Solution',
      'Pinnacle Inventory Hub'
    ]

    for (const labelName of sampleLabels) {
      await productDB.addProductLabel({ name: labelName })
    }

    // Add sample products
    await createSampleProducts()

    console.log('Sample data initialized successfully')
  } catch (error) {
    console.error('Failed to initialize sample data:', error)
  }
}

async function createSampleProducts() {
  const sampleProducts = [
    {
      nameMajor: 'iPhone 15 Pro',
      productCode: 'IP15P-001',
      nameMinor: 'Apple iPhone 15 Pro',
      vat: 'W001',
      exciseDuty: 'W002',
      otherTax: 'W003',
      status: 'onsale',
      productLabel: 'Global Logistics Depot',
      category: 'Smartphones',
      specModel: '2024-Model',
      shelfLifeMgmt: false,
      batchMgmt: true,
      specifications: [
        {
          name: 'Color',
          values: ['Space Black', 'Natural Titanium', 'White', 'Blue']
        },
        {
          name: 'Storage',
          values: ['128GB', '256GB', '512GB', '1TB']
        }
      ],
      units: [
        { name: 'Pcs', rate: 1 },
        { name: 'Box', rate: 10 },
        { name: 'Carton', rate: 100 }
      ],
      skus: generateSampleSkus(['Space Black', 'Natural Titanium', 'White', 'Blue'], ['128GB', '256GB', '512GB', '1TB'], 'IP15P')
    },
    {
      nameMajor: 'MacBook Air M3',
      productCode: 'MBA-M3-001',
      nameMinor: 'Apple MacBook Air M3',
      vat: 'W001',
      exciseDuty: 'W002',
      otherTax: 'W003',
      status: 'onsale',
      productLabel: 'Elite Storage Solution',
      category: 'Laptops',
      specModel: '2024-Model',
      shelfLifeMgmt: false,
      batchMgmt: false,
      specifications: [
        {
          name: 'Color',
          values: ['Midnight', 'Starlight', 'Space Gray', 'Silver']
        },
        {
          name: 'Memory',
          values: ['8GB', '16GB', '24GB']
        },
        {
          name: 'Storage',
          values: ['256GB', '512GB', '1TB']
        }
      ],
      units: [
        { name: 'Pcs', rate: 1 },
        { name: 'Box', rate: 5 }
      ],
      skus: generateSampleSkus(
        ['Midnight', 'Starlight', 'Space Gray', 'Silver'],
        ['8GB', '16GB', '24GB'],
        'MBA-M3',
        ['256GB', '512GB', '1TB']
      )
    },
    {
      nameMajor: 'Wireless Headphones',
      productCode: 'WH-001',
      nameMinor: 'Premium Wireless Headphones',
      vat: 'W001',
      exciseDuty: 'W002',
      otherTax: 'W003',
      status: 'onsale',
      productLabel: 'Swift Stock Warehouse',
      category: 'Headphones',
      specModel: 'Pro-Model',
      shelfLifeMgmt: true,
      batchMgmt: true,
      specifications: [
        {
          name: 'Color',
          values: ['Black', 'White', 'Blue', 'Red']
        }
      ],
      units: [
        { name: 'Pcs', rate: 1 },
        { name: 'Pack', rate: 6 },
        { name: 'Box', rate: 24 }
      ],
      skus: generateSampleSkus(['Black', 'White', 'Blue', 'Red'], [], 'WH')
    },
    {
      nameMajor: 'Men\'s T-Shirt',
      productCode: 'MTS-001',
      nameMinor: 'Cotton Men\'s T-Shirt',
      vat: 'W001',
      exciseDuty: 'W002',
      otherTax: 'W003',
      status: 'onsale',
      productLabel: 'Central Distribution Center',
      category: 'Men\'s Wear',
      specModel: 'Summer-2024',
      shelfLifeMgmt: false,
      batchMgmt: false,
      specifications: [
        {
          name: 'Size',
          values: ['S', 'M', 'L', 'XL', 'XXL']
        },
        {
          name: 'Color',
          values: ['White', 'Black', 'Navy', 'Gray', 'Red']
        }
      ],
      units: [
        { name: 'Pcs', rate: 1 },
        { name: 'Pack', rate: 3 },
        { name: 'Box', rate: 12 }
      ],
      skus: generateSampleSkus(['S', 'M', 'L', 'XL', 'XXL'], ['White', 'Black', 'Navy', 'Gray', 'Red'], 'MTS')
    },
    {
      nameMajor: 'Office Chair',
      productCode: 'OC-001',
      nameMinor: 'Ergonomic Office Chair',
      vat: 'W001',
      exciseDuty: 'W002',
      otherTax: 'W003',
      status: 'offsale',
      productLabel: 'Pinnacle Inventory Hub',
      category: 'Furniture',
      specModel: 'Pro-2024',
      shelfLifeMgmt: false,
      batchMgmt: true,
      specifications: [
        {
          name: 'Color',
          values: ['Black', 'Gray', 'Brown']
        },
        {
          name: 'Material',
          values: ['Mesh', 'Leather', 'Fabric']
        }
      ],
      units: [
        { name: 'Pcs', rate: 1 }
      ],
      skus: generateSampleSkus(['Black', 'Gray', 'Brown'], ['Mesh', 'Leather', 'Fabric'], 'OC')
    },
    {
      nameMajor: 'Non-Stick Cookware Set',
      productCode: 'NSCS-001',
      nameMinor: '10-Piece Non-Stick Cookware Set',
      vat: 'W001',
      exciseDuty: 'W002',
      otherTax: 'W003',
      status: 'onsale',
      productLabel: 'Reliable Goods Depot',
      category: 'Cookware',
      specModel: 'Kitchen-Pro',
      shelfLifeMgmt: true,
      batchMgmt: false,
      specifications: [
        {
          name: 'Set Size',
          values: ['8-Piece', '10-Piece', '12-Piece']
        },
        {
          name: 'Color',
          values: ['Black', 'Red', 'Blue', 'Silver']
        }
      ],
      units: [
        { name: 'Set', rate: 1 },
        { name: 'Box', rate: 1 }
      ],
      skus: generateSampleSkus(['8-Piece', '10-Piece', '12-Piece'], ['Black', 'Red', 'Blue', 'Silver'], 'NSCS')
    },
    {
      nameMajor: 'Kids Winter Jacket',
      productCode: 'KWJ-001',
      nameMinor: 'Kids Waterproof Winter Jacket',
      vat: 'W001',
      exciseDuty: 'W002',
      otherTax: 'W003',
      status: 'onsale',
      productLabel: 'Efficient Supply Warehouse',
      category: 'Kids\' Clothing',
      specModel: 'Winter-2024',
      shelfLifeMgmt: false,
      batchMgmt: true,
      specifications: [
        {
          name: 'Size',
          values: ['4-5Y', '6-7Y', '8-9Y', '10-12Y']
        },
        {
          name: 'Color',
          values: ['Blue', 'Pink', 'Red', 'Green', 'Purple']
        }
      ],
      units: [
        { name: 'Pcs', rate: 1 },
        { name: 'Pack', rate: 4 }
      ],
      skus: generateSampleSkus(['4-5Y', '6-7Y', '8-9Y', '10-12Y'], ['Blue', 'Pink', 'Red', 'Green', 'Purple'], 'KWJ')
    },
    {
      nameMajor: 'Women\'s Running Shoes',
      productCode: 'WRS-001',
      nameMinor: 'Women\'s Lightweight Running Shoes',
      vat: 'W001',
      exciseDuty: 'W002',
      otherTax: 'W003',
      status: 'onsale',
      productLabel: 'Nexus Storage Facility',
      category: 'Women\'s Wear',
      specModel: 'Sport-2024',
      shelfLifeMgmt: false,
      batchMgmt: false,
      specifications: [
        {
          name: 'Size',
          values: ['US 6', 'US 7', 'US 8', 'US 9', 'US 10']
        },
        {
          name: 'Color',
          values: ['White/Pink', 'Black/Blue', 'Gray/Orange', 'White/Green']
        }
      ],
      units: [
        { name: 'Pair', rate: 1 },
        { name: 'Box', rate: 6 }
      ],
      skus: generateSampleSkus(
        ['US 6', 'US 7', 'US 8', 'US 9', 'US 10'],
        ['White/Pink', 'Black/Blue', 'Gray/Orange', 'White/Green'],
        'WRS'
      )
    }
  ]

  for (const productData of sampleProducts) {
    await productDB.addProduct(productData)
  }
}

function generateSampleSkus(spec1Values, spec2Values, productCode, spec3Values = []) {
  const skus = []
  let skuIndex = 1

  // Helper function to generate cartesian product
  function cartesianProduct(arrays) {
    return arrays.reduce((acc, curr) => {
      return acc.flatMap(x => curr.map(y => [...x, y]))
    }, [[]])
  }

  // Prepare arrays for cartesian product
  const specArrays = [spec1Values]
  if (spec2Values.length > 0) specArrays.push(spec2Values)
  if (spec3Values.length > 0) specArrays.push(spec3Values)

  // Generate all combinations
  const combinations = cartesianProduct(specArrays)

  combinations.forEach(combination => {
    const specs = {}
    const specValues = []
    
    if (spec1Values.length > 0) {
      specs['Spec1'] = combination[0]
      specValues.push(combination[0])
    }
    if (spec2Values.length > 0) {
      specs['Spec2'] = combination[1]
      specValues.push(combination[1])
    }
    if (spec3Values.length > 0) {
      specs['Spec3'] = combination[2]
      specValues.push(combination[2])
    }

    // Generate realistic prices and stock
    const basePrice = Math.random() * 100 + 50
    const costPrice = basePrice * 0.6
    const stock = Math.floor(Math.random() * 1000) + 50

    const sku = {
      id: skuIndex,
      specs,
      specValues,
      skuCode: `${productCode}-${String(skuIndex).padStart(3, '0')}`,
      barcode: `BC${String(skuIndex + 1000).padStart(6, '0')}`,
      prices: { 'Pcs': Math.round(basePrice * 100) / 100 },
      stock: stock,
      costPrice: Math.round(costPrice * 100) / 100,
      status: Math.random() > 0.2 ? 'active' : 'inactive',
      unit: 'Pcs'
    }

    // Add prices for other units if they exist
    if (productCode === 'IP15P' || productCode === 'MBA-M3') {
      sku.prices['Box'] = Math.round(basePrice * 10 * 0.95 * 100) / 100 // 5% discount for box
    }

    skus.push(sku)
    skuIndex++
  })

  return skus
}

export async function clearSampleData() {
  try {
    await productDB.clearDatabase()
    if (typeof ElMessage !== undefined) ElMessage.success('Sample data cleared successfully')
    return true
  } catch (error) {
    if (typeof ElMessage !== undefined) ElMessage.error('Failed to clear sample data: ' + error.message)
    return false
  }
}

export async function recreateSampleData() {
  try {
    await productDB.clearDatabase()
    await initializeSampleData()
    // if (typeof ElMessage !== undefined) ElMessage.success('Sample data recreated successfully')
    return true
  } catch (error) {
    // if (typeof ElMessage !== undefined) ElMessage.error('Failed to recreate sample data: ' + error.message)
    return false
  }
}