class ProductDB {
  constructor() {
    this.dbName = 'ProductManagementDB'
    this.version = 1
    this.db = null
  }

  // Initialize database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Create products store
        if (!db.objectStoreNames.contains('products')) {
          const productsStore = db.createObjectStore('products', {
            keyPath: 'id',
            autoIncrement: true
          })
          productsStore.createIndex('productCode', 'productCode', { unique: true })
          productsStore.createIndex('nameMajor', 'nameMajor', { unique: false })
          productsStore.createIndex('createdAt', 'createdAt', { unique: false })
        }

        // Create categories store
        if (!db.objectStoreNames.contains('categories')) {
          const categoriesStore = db.createObjectStore('categories', {
            keyPath: 'id',
            autoIncrement: true
          })
          categoriesStore.createIndex('name', 'name', { unique: true })
        }

        // Create product labels store
        if (!db.objectStoreNames.contains('productLabels')) {
          const labelsStore = db.createObjectStore('productLabels', {
            keyPath: 'id',
            autoIncrement: true
          })
          labelsStore.createIndex('name', 'name', { unique: true })
        }
      }
    })
  }

  // Generic CRUD operations
  async add(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      
      // Convert to plain object and handle complex data
      const plainData = this.convertToPlainObject(data)
      
      const request = store.add({
        ...plainData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async get(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async update(storeName, id, data) {
    return new Promise(async (resolve, reject) => {
      const existing = await this.get(storeName, id)
      if (!existing) {
        reject(new Error('Record not found'))
        return
      }

      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      
      // Convert to plain object and handle complex data
      const plainData = this.convertToPlainObject(data)
      
      const request = store.put({
        ...existing,
        ...plainData,
        updatedAt: new Date().toISOString()
      })

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Helper method to convert complex objects to plain objects
  convertToPlainObject(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.convertToPlainObject(item))
    }

    const plainObj = {}
    for (const [key, value] of Object.entries(obj)) {
      // Skip Vue-specific properties and methods
      if (key.startsWith('_') || key.startsWith('$') || typeof value === 'function') {
        continue
      }
      
      if (value instanceof Date) {
        plainObj[key] = value.toISOString()
      } else if (Array.isArray(value)) {
        plainObj[key] = value.map(item => this.convertToPlainObject(item))
      } else if (value && typeof value === 'object') {
        plainObj[key] = this.convertToPlainObject(value)
      } else {
        plainObj[key] = value
      }
    }
    
    return plainObj
  }

  // Product-specific methods
  async addProduct(productData) {
    const plainProductData = this.prepareProductData(productData)
    return this.add('products', plainProductData)
  }

  async updateProduct(id, productData) {
    const plainProductData = this.prepareProductData(productData)
    return this.update('products', id, plainProductData)
  }

  // Special preparation for product data
  prepareProductData(productData) {
    const plainData = this.convertToPlainObject(productData)
    
    // Ensure arrays are properly handled
    if (plainData.specifications) {
      plainData.specifications = plainData.specifications.map(spec => ({
        name: spec.name,
        values: Array.isArray(spec.values) ? [...spec.values] : []
      }))
    }
    
    if (plainData.units) {
      plainData.units = plainData.units.map(unit => ({
        name: unit.name,
        rate: unit.rate
      }))
    }
    
    if (plainData.skus) {
      plainData.skus = plainData.skus.map(sku => ({
        id: sku.id,
        specs: sku.specs ? { ...sku.specs } : {},
        specValues: Array.isArray(sku.specValues) ? [...sku.specValues] : [],
        skuCode: sku.skuCode,
        barcode: sku.barcode,
        prices: sku.prices ? { ...sku.prices } : {},
        stock: sku.stock,
        costPrice: sku.costPrice,
        status: sku.status,
        unit: sku.unit
      }))
    }
    
    return plainData
  }

  async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Product-specific methods
  async addProduct(productData) {
    return this.add('products', productData)
  }

  async getProduct(id) {
    return this.get('products', id)
  }

  async getAllProducts() {
    return this.getAll('products')
  }

  async deleteProduct(id) {
    return this.delete('products', id)
  }

  async getProductByCode(productCode) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['products'], 'readonly')
      const store = transaction.objectStore('products')
      const index = store.index('productCode')
      const request = index.get(productCode)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Category methods
  async addCategory(categoryData) {
    return this.add('categories', categoryData)
  }

  async getAllCategories() {
    return this.getAll('categories')
  }

  // Product Label methods
  async addProductLabel(labelData) {
    return this.add('productLabels', labelData)
  }

  async getAllProductLabels() {
    return this.getAll('productLabels')
  }

  async getProductsByStatus(status) {
  return new Promise((resolve, reject) => {
    const transaction = this.db.transaction(['products'], 'readonly')
    const store = transaction.objectStore('products')
    const request = store.getAll()

    request.onsuccess = () => {
      const products = request.result.filter(product => product.status === status)
      resolve(products)
    }
    request.onerror = () => reject(request.error)
  })
}

async searchProducts(query) {
  return new Promise((resolve, reject) => {
    const transaction = this.db.transaction(['products'], 'readonly')
    const store = transaction.objectStore('products')
    const request = store.getAll()

    request.onsuccess = () => {
      const products = request.result.filter(product => 
        product.nameMajor.toLowerCase().includes(query.toLowerCase()) ||
        product.productCode.includes(query) ||
        product.nameMinor.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      )
      resolve(products)
    }
    request.onerror = () => reject(request.error)
  })
}

async getProductsByCategory(category) {
  return new Promise((resolve, reject) => {
    const transaction = this.db.transaction(['products'], 'readonly')
    const store = transaction.objectStore('products')
    const request = store.getAll()

    request.onsuccess = () => {
      const products = request.result.filter(product => 
        product.category === category
      )
      resolve(products)
    }
    request.onerror = () => reject(request.error)
  })
}

// Bulk operations
async bulkUpdateProducts(products) {
  return new Promise(async (resolve, reject) => {
    const transaction = this.db.transaction(['products'], 'readwrite')
    const store = transaction.objectStore('products')
    
    const requests = products.map(product => {
      return new Promise((resolve, reject) => {
        const request = store.put(product)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    })

    try {
      const results = await Promise.all(requests)
      resolve(results)
    } catch (error) {
      reject(error)
    }
  })
}

// Statistics
async getProductStats() {
  return new Promise((resolve, reject) => {
    const transaction = this.db.transaction(['products'], 'readonly')
    const store = transaction.objectStore('products')
    const request = store.getAll()

    request.onsuccess = () => {
      const products = request.result
      const stats = {
        total: products.length,
        active: products.filter(p => p.status === 'onsale').length,
        inactive: products.filter(p => p.status === 'offsale').length,
        categories: {},
        withMultiUnits: products.filter(p => p.units && p.units.length > 1).length,
        withSpecs: products.filter(p => p.specifications && p.specifications.length > 0).length,
        totalSkus: products.reduce((sum, p) => sum + (p.skus?.length || 0), 0)
      }

      // Count by category
      products.forEach(product => {
        if (product.category) {
          stats.categories[product.category] = (stats.categories[product.category] || 0) + 1
        }
      })

      resolve(stats)
    }
    request.onerror = () => reject(request.error)
  })
}

// Export entire database
async exportDatabase() {
  const data = {
    products: await this.getAllProducts(),
    categories: await this.getAllCategories(),
    productLabels: await this.getAllProductLabels(),
    exportDate: new Date().toISOString(),
    version: this.version
  }
  return data
}

// Import database
async importDatabase(data) {
  return new Promise(async (resolve, reject) => {
    try {
      // Clear existing data
      await this.clearDatabase()

      // Import new data
      if (data.products) {
        for (const product of data.products) {
          await this.addProduct(product)
        }
      }

      if (data.categories) {
        for (const category of data.categories) {
          await this.addCategory(category)
        }
      }

      if (data.productLabels) {
        for (const label of data.productLabels) {
          await this.addProductLabel(label)
        }
      }

      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

// Clear all data
async clearDatabase() {
  const stores = ['products', 'categories', 'productLabels']
  
  for (const storeName of stores) {
    await new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}
}

// Create and export a singleton instance
export const productDB = new ProductDB()