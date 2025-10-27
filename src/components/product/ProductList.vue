<template>
  <div class="product-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>Product List</span>
            <el-tag v-if="isSampleData" type="info" size="small" style="margin-left: 10px;">
              Sample Data
            </el-tag>
          </div>
          <el-button type="primary" @click="showAddDrawer">
            <el-icon><Plus /></el-icon>
            Add Product
          </el-button>
        </div>
      </template>

      <!-- Search and Filters -->
      <div class="filters">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="searchQuery"
              placeholder="Search by name, code, or category..."
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button @click="handleSearch">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select v-model="filterStatus" placeholder="Status" clearable @change="handleFilter">
              <el-option label="All Status" value="" />
              <el-option label="On Sale" value="onsale" />
              <el-option label="Off Sale" value="offsale" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="filterCategory" placeholder="Category" clearable @change="handleFilter">
              <el-option label="All Categories" value="" />
              <el-option 
                v-for="category in categories" 
                :key="category.id" 
                :label="category.name" 
                :value="category.name" 
              />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="filterHasSkus" placeholder="SKUs" clearable @change="handleFilter">
              <el-option label="All Products" value="" />
              <el-option label="With SKUs" value="with" />
              <el-option label="Without SKUs" value="without" />
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-button @click="resetFilters" type="default">
              Reset
            </el-button>
          </el-col>
          <el-col :span="3" style="text-align: right;">
            <el-button @click="showStats = true" type="info">
              <el-icon><DataAnalysis /></el-icon>
              Stats
            </el-button>
          </el-col>
        </el-row>

        <!-- Active Filters Display -->
        <div v-if="hasActiveFilters" class="active-filters">
          <span class="filters-label">Active Filters:</span>
          <el-tag
            v-if="filterStatus"
            closable
            @close="removeFilter('status')"
            type="success"
          >
            Status: {{ filterStatus === 'onsale' ? 'On Sale' : 'Off Sale' }}
          </el-tag>
          <el-tag
            v-if="filterCategory"
            closable
            @close="removeFilter('category')"
            type="warning"
          >
            Category: {{ filterCategory }}
          </el-tag>
          <el-tag
            v-if="filterHasSkus"
            closable
            @close="removeFilter('hasSkus')"
            type="primary"
          >
            SKUs: {{ filterHasSkus === 'with' ? 'With SKUs' : 'Without SKUs' }}
          </el-tag>
          <el-tag
            v-if="searchQuery"
            closable
            @close="removeFilter('search')"
            type="info"
          >
            Search: "{{ searchQuery }}"
          </el-tag>
        </div>
      </div>

      <!-- Products Table with Expandable Rows -->
      <el-table 
        :data="paginatedProducts" 
        v-loading="loading"
        @sort-change="handleSort"
        stripe
        style="width: 100%"
      >
        <!-- Expand Icon Column -->
        <el-table-column type="expand" width="60">
          <template #default="scope">
            <div v-if="scope.row.skus && scope.row.skus.length > 0" class="sku-expand-content">
              <div class="expand-header">
                <h4>SKU List for {{ scope.row.nameMajor }}</h4>
                <div class="sku-summary">
                  <el-tag type="primary">{{ scope.row.skus.length }} SKUs</el-tag>
                  <el-tag type="success">
                    Active: {{ getActiveSkusCount(scope.row) }}
                  </el-tag>
                  <el-tag type="info">
                    Inactive: {{ getInactiveSkusCount(scope.row) }}
                  </el-tag>
                  <el-tag type="warning">
                    Total Stock: {{ getTotalStock(scope.row) }}
                  </el-tag>
                </div>
              </div>
              
              <el-table 
                :data="scope.row.skus" 
                border 
                size="small"
                style="width: 100%; margin-top: 16px;"
              >
                <el-table-column type="index" width="50" label="#" />
                
                <el-table-column prop="status" label="Status" width="80">
                  <template #default="skuScope">
                    <el-tag 
                      :type="skuScope.row.status === 'active' ? 'success' : 'info'"
                      size="small"
                    >
                      {{ skuScope.row.status === 'active' ? 'Active' : 'Inactive' }}
                    </el-tag>
                  </template>
                </el-table-column>
                
                <!-- Dynamic specification columns -->
                <el-table-column 
                  v-for="spec in scope.row.specifications" 
                  :key="spec.name"
                  :label="spec.name"
                  width="120"
                >
                  <template #default="skuScope">
                    <el-tag size="small" effect="plain">
                      {{ skuScope.row.specs ? skuScope.row.specs[spec.name] : '' }}
                    </el-tag>
                  </template>
                </el-table-column>
                
                <el-table-column prop="skuCode" label="SKU Code" width="130">
                  <template #default="skuScope">
                    <code class="sku-code">{{ skuScope.row.skuCode }}</code>
                  </template>
                </el-table-column>
                
                <el-table-column prop="barcode" label="Barcode" width="140">
                  <template #default="skuScope">
                    <code class="barcode">{{ skuScope.row.barcode }}</code>
                  </template>
                </el-table-column>
                
                <el-table-column prop="stock" label="Stock" width="100">
                  <template #default="skuScope">
                    <span :class="getStockClass(skuScope.row.stock)">
                      {{ skuScope.row.stock || 0 }}
                    </span>
                  </template>
                </el-table-column>
                
                <el-table-column prop="unit" label="Unit" width="80">
                  <template #default="skuScope">
                    {{ skuScope.row.unit || 'Pcs' }}
                  </template>
                </el-table-column>
                
                <el-table-column label="Prices" width="180">
                  <template #default="skuScope">
                    <div class="prices-list">
                      <div v-for="(price, unit) in skuScope.row.prices || {}" :key="unit" class="price-item">
                        <span class="unit">{{ unit }}:</span>
                        <span class="price">${{ price }}</span>
                      </div>
                      <div v-if="!skuScope.row.prices || Object.keys(skuScope.row.prices).length === 0" class="text-muted">
                        No prices
                      </div>
                    </div>
                  </template>
                </el-table-column>
                
                <el-table-column label="Cost Price" width="110">
                  <template #default="skuScope">
                    <span v-if="skuScope.row.costPrice" class="cost-price">${{ skuScope.row.costPrice }}</span>
                    <span v-else class="text-muted">--</span>
                  </template>
                </el-table-column>
                
                <el-table-column label="Profit Margin" width="120">
                  <template #default="skuScope">
                    <span :class="getMarginClass(calculateProfitMargin(skuScope.row))">
                      {{ calculateProfitMargin(skuScope.row) }}
                    </span>
                  </template>
                </el-table-column>

                <el-table-column label="Value" width="120">
                  <template #default="skuScope">
                    <span v-if="skuScope.row.costPrice && skuScope.row.stock" class="total-value">
                      ${{ (skuScope.row.costPrice * skuScope.row.stock).toFixed(2) }}
                    </span>
                    <span v-else class="text-muted">--</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div v-else class="no-skus-message">
              <el-empty description="No SKUs generated for this product" :image-size="80">
                <el-button type="primary" size="small" @click="editProduct(scope.row)">
                  Generate SKUs
                </el-button>
              </el-empty>
            </div>
          </template>
        </el-table-column>

        <!-- Main Product Columns -->
        <el-table-column type="index" width="50" label="#" />
        <el-table-column prop="productCode" label="Product Code" width="130" sortable>
          <template #default="scope">
            <span class="product-code">{{ scope.row.productCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="nameMajor" label="Product Name" sortable min-width="180">
          <template #default="scope">
            <div class="product-name">
              <strong>{{ scope.row.nameMajor }}</strong>
              <div v-if="scope.row.nameMinor" class="product-name-minor">
                {{ scope.row.nameMinor }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="Category" width="130" sortable>
          <template #default="scope">
            <el-tag v-if="scope.row.category" type="info" size="small">
              {{ scope.row.category }}
            </el-tag>
            <span v-else class="text-muted">--</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="100" sortable>
          <template #default="scope">
            <el-tag 
              :type="scope.row.status === 'onsale' ? 'success' : 'info'"
              :effect="scope.row.status === 'onsale' ? 'dark' : 'plain'"
            >
              {{ scope.row.status === 'onsale' ? 'On Sale' : 'Off Sale' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="specModel" label="Spec Model" width="120">
          <template #default="scope">
            <span v-if="scope.row.specModel" class="spec-model">{{ scope.row.specModel }}</span>
            <span v-else class="text-muted">--</span>
          </template>
        </el-table-column>
        <el-table-column label="SKUs" width="100">
          <template #default="scope">
            <div class="sku-count">
              <el-tag 
                v-if="scope.row.skus && scope.row.skus.length > 0"
                type="primary"
                style="cursor: pointer;"
              >
                {{ scope.row.skus.length }} SKUs
              </el-tag>
              <el-tag v-else type="info" effect="plain">0</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Specs" width="100">
          <template #default="scope">
            <el-tag 
              v-if="scope.row.specifications && scope.row.specifications.length > 0"
              type="warning"
              size="small"
            >
              {{ scope.row.specifications.length }}
            </el-tag>
            <span v-else class="text-muted">--</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created" width="140" sortable>
          <template #default="scope">
            <div class="date-cell">
              <div class="date">{{ formatDate(scope.row.createdAt) }}</div>
              <div class="time">{{ formatTime(scope.row.createdAt) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="180" fixed="right">
          <template #default="scope">
            <el-button-group>
              <el-button size="small" @click="showViewDrawer(scope.row)" title="View Details">
                <el-icon><View /></el-icon>
              </el-button>
              <el-button size="small" type="primary" @click="showEditDrawer(scope.row)" title="Edit">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row.id)" title="Delete">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <div class="pagination-info">
          Showing {{ showingStart }}-{{ showingEnd }} of {{ filteredProducts.length }} products
          <span v-if="hasActiveFilters" class="filtered-info">
            (filtered from {{ products.length }} total)
          </span>
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredProducts.length"
          :page-sizes="[10, 20, 50, 100]"
          layout="sizes, prev, pager, next"
          background
        />
      </div>

      <!-- Empty State -->
      <div v-if="filteredProducts.length === 0 && !loading" class="empty-state">
        <el-empty description="No products found">
          <template #description>
            <p v-if="hasActiveFilters">No products match your current filters.</p>
            <p v-else>No products found. Start by adding your first product!</p>
          </template>
          <el-button type="primary" @click="showAddDrawer" v-if="!hasActiveFilters">
            Add Your First Product
          </el-button>
          <el-button @click="resetFilters" v-else>
            Clear Filters
          </el-button>
        </el-empty>
      </div>
    </el-card>

    <!-- Add Product Drawer -->
    <el-drawer
      v-model="addDrawerVisible"
      title="Add Product"
      size="70%"
      direction="rtl"
    >
      <ProductFormDrawer
        v-if="addDrawerVisible"
        mode="add"
        @saved="handleProductSaved"
        @cancel="addDrawerVisible = false"
      />
    </el-drawer>

    <!-- Edit Product Drawer -->
    <el-drawer
      v-model="editDrawerVisible"
      :title="`Edit Product - ${editingProduct?.nameMajor || ''}`"
      size="70%"
      direction="rtl"
    >
      <ProductFormDrawer
        v-if="editDrawerVisible && editingProduct"
        mode="edit"
        :product-id="editingProduct?.id"
        @saved="handleProductSaved"
        @cancel="editDrawerVisible = false"
      />
    </el-drawer>

    <!-- View Product Drawer -->
    <el-drawer
      v-model="viewDrawerVisible"
      title="Product Details"
      size="60%"
      direction="rtl"
    >
      <ProductDetailsDrawer
        v-if="viewDrawerVisible && selectedProduct"
        :product="selectedProduct"
        @edit="handleEditFromDrawer"
        @close="viewDrawerVisible = false"
      />
    </el-drawer>

    <!-- Statistics Dialog -->
    <el-dialog v-model="showStats" title="Product Statistics" width="500px">
      <div v-if="stats" class="stats-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-statistic title="Total Products" :value="stats.total" />
          </el-col>
          <el-col :span="12">
            <el-statistic title="Active Products" :value="stats.active" />
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <el-statistic title="With Multiple Units" :value="stats.withMultiUnits" />
          </el-col>
          <el-col :span="12">
            <el-statistic title="With Specifications" :value="stats.withSpecs" />
          </el-col>
        </el-row>
        
        <h4 style="margin-top: 20px;">Categories Distribution</h4>
        <div v-for="(count, category) in stats.categories" :key="category" class="category-item">
          <span>{{ category }}:</span>
          <span>{{ count }}</span>
        </div>

        <h4 style="margin-top: 20px;">SKU Statistics</h4>
        <div class="sku-stats">
          <div class="stat-item">
            <span class="label">Total SKUs:</span>
            <span class="value">{{ totalSkus }}</span>
          </div>
          <div class="stat-item">
            <span class="label">Avg SKUs per Product:</span>
            <span class="value">{{ averageSkusPerProduct }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, DataAnalysis, View, Edit, Delete } from '@element-plus/icons-vue'
import { productDB } from '@/utils/db'
import ProductDetailsDrawer from '@/components/product/ProductDetailsDrawer.vue'
import ProductFormDrawer from '@/components/product/ProductFormDrawer.vue'

// Reactive data
const products = ref([])
const filteredProducts = ref([])
const categories = ref([])
const loading = ref(false)
const showStats = ref(false)
const stats = ref(null)
const isSampleData = ref(false)

// Drawer states
const addDrawerVisible = ref(false)
const editDrawerVisible = ref(false)
const viewDrawerVisible = ref(false)
const selectedProduct = ref(null)
const editingProduct = ref(null)

// Filter and pagination
const searchQuery = ref('')
const filterStatus = ref('')
const filterCategory = ref('')
const filterHasSkus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// Computed properties
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProducts.value.slice(start, end)
})

const showingStart = computed(() => {
  return (currentPage.value - 1) * pageSize.value + 1
})

const showingEnd = computed(() => {
  const end = currentPage.value * pageSize.value
  return end > filteredProducts.value.length ? filteredProducts.value.length : end
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || filterStatus.value || filterCategory.value || filterHasSkus.value
})

const totalSkus = computed(() => {
  return products.value.reduce((total, product) => total + (product.skus?.length || 0), 0)
})

const averageSkusPerProduct = computed(() => {
  const productsWithSkus = products.value.filter(p => p.skus && p.skus.length > 0).length
  return productsWithSkus > 0 ? (totalSkus.value / productsWithSkus).toFixed(1) : '0.0'
})

onMounted(async () => {
  await loadProducts()
  await loadCategories()
  await loadStats()
  checkSampleData()
})

async function loadProducts() {
  loading.value = true
  try {
    products.value = await productDB.getAllProducts()
    filteredProducts.value = products.value
  } catch (error) {
    ElMessage.error('Failed to load products: ' + error.message)
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    categories.value = await productDB.getAllCategories()
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

async function loadStats() {
  try {
    stats.value = await productDB.getProductStats()
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

function checkSampleData() {
  const hasSampleProduct = products.value.some(product => 
    product.productCode === 'IP15P-001'
  )
  isSampleData.value = hasSampleProduct
}

function handleSearch() {
  applyFilters()
}

function handleFilter() {
  applyFilters()
}

function applyFilters() {
  let filtered = products.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(product => 
      product.nameMajor?.toLowerCase().includes(query) ||
      product.productCode?.toLowerCase().includes(query) ||
      product.nameMinor?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query) ||
      product.specModel?.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (filterStatus.value) {
    filtered = filtered.filter(product => product.status === filterStatus.value)
  }

  // Category filter
  if (filterCategory.value) {
    filtered = filtered.filter(product => product.category === filterCategory.value)
  }

  // SKU filter
  if (filterHasSkus.value === 'with') {
    filtered = filtered.filter(product => product.skus && product.skus.length > 0)
  } else if (filterHasSkus.value === 'without') {
    filtered = filtered.filter(product => !product.skus || product.skus.length === 0)
  }

  filteredProducts.value = filtered
  currentPage.value = 1
}

function removeFilter(filterType) {
  switch (filterType) {
    case 'status':
      filterStatus.value = ''
      break
    case 'category':
      filterCategory.value = ''
      break
    case 'hasSkus':
      filterHasSkus.value = ''
      break
    case 'search':
      searchQuery.value = ''
      break
  }
  applyFilters()
}

function resetFilters() {
  searchQuery.value = ''
  filterStatus.value = ''
  filterCategory.value = ''
  filterHasSkus.value = ''
  filteredProducts.value = products.value
  currentPage.value = 1
}

function handleSort(sort) {
  const { prop, order } = sort
  if (!prop) return

  filteredProducts.value.sort((a, b) => {
    let aVal = a[prop]
    let bVal = b[prop]

    if (prop === 'createdAt') {
      aVal = new Date(aVal)
      bVal = new Date(bVal)
    }

    if (order === 'ascending') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
}

function formatDate(dateString) {
  if (!dateString) return '--'
  return new Date(dateString).toLocaleDateString()
}

function formatTime(dateString) {
  if (!dateString) return '--'
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// SKU related methods
function getActiveSkusCount(product) {
  return product.skus ? product.skus.filter(sku => sku.status === 'active').length : 0
}

function getInactiveSkusCount(product) {
  return product.skus ? product.skus.filter(sku => sku.status !== 'active').length : 0
}

function getTotalStock(product) {
  return product.skus ? product.skus.reduce((sum, sku) => sum + (sku.stock || 0), 0) : 0
}

function getStockClass(stock) {
  if (!stock) return 'no-stock'
  if (stock < 10) return 'low-stock'
  if (stock >= 50) return 'good-stock'
  return 'normal-stock'
}

function calculateProfitMargin(sku) {
  if (!sku.costPrice || !sku.prices) return '--'
  
  const sellingPrice = Object.values(sku.prices)[0] || 0
  if (!sellingPrice || sku.costPrice === 0) return '--'
  
  const margin = ((sellingPrice - sku.costPrice) / sku.costPrice) * 100
  return `${margin.toFixed(1)}%`
}

function getMarginClass(margin) {
  if (margin === '--') return ''
  const marginValue = parseFloat(margin)
  if (marginValue > 50) return 'high-margin'
  if (marginValue > 20) return 'good-margin'
  if (marginValue > 0) return 'low-margin'
  return 'negative-margin'
}

function editProduct(product) {
  editingProduct.value = product
  editDrawerVisible.value = true
}

function showAddDrawer() {
  addDrawerVisible.value = true
}

function showEditDrawer(product) {
  editingProduct.value = product
  editDrawerVisible.value = true
}

function showViewDrawer(product) {
  selectedProduct.value = product
  viewDrawerVisible.value = true
}

function handleEditFromDrawer(productId) {
  viewDrawerVisible.value = false
  const product = products.value.find(p => p.id === productId)
  if (product) {
    editingProduct.value = product
    editDrawerVisible.value = true
  }
}

async function handleProductSaved() {
  addDrawerVisible.value = false
  editDrawerVisible.value = false
  await loadProducts()
  await loadStats()
  ElMessage.success('Product saved successfully!')
}

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to delete this product? This action cannot be undone.',
      'Warning',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
    
    await productDB.deleteProduct(id)
    ElMessage.success('Product deleted successfully!')
    await loadProducts()
    await loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to delete product: ' + error.message)
    }
  }
}
</script>

<style scoped>
/* ... (keep all the CSS styles from the previous version) ... */

.product-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.filters {
  margin-bottom: 20px;
}

.active-filters {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filters-label {
  font-size: 14px;
  color: #606266;
  margin-right: 8px;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 16px 0;
}

.pagination-info {
  color: #606266;
  font-size: 14px;
}

.filtered-info {
  color: #909399;
  font-style: italic;
}

.empty-state {
  padding: 40px 0;
}

/* SKU Expand Styles */
.sku-expand-content {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 10px 0;
}

.expand-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.expand-header h4 {
  margin: 0;
  color: #303133;
}

.sku-summary {
  display: flex;
  gap: 8px;
}

.no-skus-message {
  padding: 40px 20px;
  text-align: center;
}

/* Table Styles */
.product-code {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #409eff;
}

.product-name {
  line-height: 1.4;
}

.product-name-minor {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.spec-model {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.text-muted {
  color: #c0c4cc;
  font-style: italic;
}

.date-cell {
  font-size: 12px;
  line-height: 1.4;
}

.date {
  color: #303133;
}

.time {
  color: #909399;
}

/* SKU Table Styles */
.sku-code, .barcode {
  font-family: 'Courier New', monospace;
  background: #f4f4f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
}

.sku-code {
  color: #f56c6c;
}

.barcode {
  color: #909399;
}

.no-stock {
  color: #c0c4cc;
}

.low-stock {
  color: #f56c6c;
  font-weight: 600;
}

.normal-stock {
  color: #606266;
}

.good-stock {
  color: #67c23a;
  font-weight: 600;
}

.prices-list {
  font-size: 12px;
}

.price-item {
  display: flex;
  justify-content: space-between;
  margin: 2px 0;
}

.price-item .unit {
  color: #909399;
}

.price-item .price {
  font-weight: 600;
  color: #67c23a;
}

.cost-price {
  color: #e6a23c;
  font-weight: 600;
}

.total-value {
  color: #409eff;
  font-weight: 600;
}

.high-margin {
  color: #67c23a;
  font-weight: 600;
}

.good-margin {
  color: #409eff;
  font-weight: 600;
}

.low-margin {
  color: #e6a23c;
  font-weight: 600;
}

.negative-margin {
  color: #f56c6c;
  font-weight: 600;
}

.stats-content {
  text-align: center;
}

.category-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.category-item:last-child {
  border-bottom: none;
}

.sku-stats {
  margin-top: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}

.stat-item .label {
  color: #606266;
}

.stat-item .value {
  font-weight: 600;
  color: #303133;
}

:deep(.el-table .cell) {
  padding: 8px 12px;
}

:deep(.el-tag) {
  margin: 1px;
}
</style>