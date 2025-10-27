<template>
  <div class="product-details-drawer">
    <!-- Header with actions -->
    <div class="drawer-header">
      <div class="product-title">
        <h3>{{ product.nameMajor }}</h3>
        <el-tag :type="product.status === 'onsale' ? 'success' : 'info'">
          {{ product.status }}
        </el-tag>
      </div>
      <div class="header-actions">
        <el-button @click="handleEdit" type="primary">
          <el-icon><Edit /></el-icon>
          Edit
        </el-button>
        <el-button @click="handleClose">
          <el-icon><Close /></el-icon>
          Close
        </el-button>
      </div>
    </div>

    <div class="drawer-content">
      <!-- Basic Information -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>Basic Information</span>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="Product Code">
            {{ product.productCode }}
          </el-descriptions-item>
          <el-descriptions-item label="Name(Minor)">
            {{ product.nameMinor || '--' }}
          </el-descriptions-item>
          
          <el-descriptions-item label="Category">
            {{ product.category || '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="Spec Model">
            {{ product.specModel || '--' }}
          </el-descriptions-item>
          
          <el-descriptions-item label="VAT">
            {{ product.vat || '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="Excise Duty">
            {{ product.exciseDuty || '--' }}
          </el-descriptions-item>
          
          <el-descriptions-item label="Other TAX">
            {{ product.otherTax || '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="Product Label">
            {{ product.productLabel || '--' }}
          </el-descriptions-item>
          
          <el-descriptions-item label="Shelf Life Mgmt">
            {{ product.shelfLifeMgmt ? 'Enabled' : 'Disabled' }}
          </el-descriptions-item>
          <el-descriptions-item label="Batch Mgmt">
            {{ product.batchMgmt ? 'Enabled' : 'Disabled' }}
          </el-descriptions-item>
          
          <el-descriptions-item label="Created">
            {{ formatDate(product.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="Last Updated">
            {{ formatDate(product.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- Units Information -->
      <el-card class="info-card" v-if="product.units && product.units.length > 0">
        <template #header>
          <div class="card-header">
            <span>Units Configuration</span>
          </div>
        </template>

        <el-table :data="product.units" style="width: 100%">
          <el-table-column prop="name" label="Unit Name" />
          <el-table-column prop="rate" label="Unit Rate" />
          <el-table-column label="Type">
            <template #default="{ $index }">
              <el-tag v-if="$index === 0" type="success">Major Unit</el-tag>
              <el-tag v-else type="info">Minor Unit</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Conversion">
            <template #default="{ row, $index }">
              <span v-if="$index > 0">
                1 {{ row.name }} = {{ row.rate }} {{ product.units[0].name }}
              </span>
              <span v-else class="text-muted">Base Unit</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Specifications -->
      <el-card class="info-card" v-if="product.specifications && product.specifications.length > 0">
        <template #header>
          <div class="card-header">
            <span>Specifications</span>
            <el-tag>{{ product.specifications.length }} Specs</el-tag>
          </div>
        </template>

        <div class="specs-grid">
          <div 
            v-for="(spec, index) in product.specifications" 
            :key="index"
            class="spec-item"
          >
            <div class="spec-header">
              <strong>{{ spec.name }}</strong>
              <span class="values-count">{{ spec.values.length }} values</span>
            </div>
            <div class="spec-values">
              <el-tag 
                v-for="value in spec.values" 
                :key="value"
                size="small"
                style="margin: 2px;"
              >
                {{ value }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>

      <!-- SKU List -->
      <el-card class="info-card" v-if="product.skus && product.skus.length > 0">
        <template #header>
          <div class="card-header">
            <span>SKU List</span>
            <el-tag type="success">{{ product.skus.length }} SKUs</el-tag>
          </div>
        </template>

        <el-table 
          :data="product.skus" 
          border 
          style="width: 100%" 
          max-height="300"
          size="small"
        >
          <el-table-column type="index" width="50" />
          
          <el-table-column prop="status" label="Status" width="80">
            <template #default="{ row }">
              <el-tag 
                :type="row.status === 'active' ? 'success' : 'info'" 
                size="small"
              >
                {{ row.status === 'active' ? '● Open' : '● Close' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <!-- Dynamic spec columns -->
          <el-table-column 
            v-for="spec in product.specifications" 
            :key="spec.name"
            :label="spec.name"
            width="100"
          >
            <template #default="{ row }">
              {{ row.specs[spec.name] }}
            </template>
          </el-table-column>
          
          <el-table-column prop="skuCode" label="SKU Code" width="120" />
          <el-table-column prop="barcode" label="Barcode" width="130" />
          <el-table-column prop="stock" label="Stock" width="80" />
          <el-table-column prop="unit" label="Unit" width="80" />
          
          <el-table-column label="Selling Price" width="100">
            <template #default="{ row }">
              {{ formatPrice(row.prices) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="costPrice" label="Cost Price" width="100">
            <template #default="{ row }">
              {{ row.costPrice ? `$${row.costPrice}` : '--' }}
            </template>
          </el-table-column>
        </el-table>

        <div class="sku-summary">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="summary-item">
                <span class="label">Total SKUs:</span>
                <span class="value">{{ product.skus.length }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="summary-item">
                <span class="label">Active SKUs:</span>
                <span class="value">
                  {{ product.skus.filter(sku => sku.status === 'active').length }}
                </span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="summary-item">
                <span class="label">Total Stock:</span>
                <span class="value">
                  {{ product.skus.reduce((sum, sku) => sum + (sku.stock || 0), 0) }}
                </span>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- No Data State -->
      <el-empty 
        v-if="!product.skus || product.skus.length === 0" 
        description="No SKUs generated for this product"
        :image-size="100"
      />
    </div>
  </div>
</template>

<script setup>
import { Edit, Close } from '@element-plus/icons-vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'close'])

const handleEdit = () => {
  emit('edit', props.product.id)
}

const handleClose = () => {
  emit('close')
}

const formatDate = (dateString) => {
  if (!dateString) return '--'
  return new Date(dateString).toLocaleString()
}

const formatPrice = (prices) => {
  if (!prices || typeof prices !== 'object') return '--'
  
  const priceEntries = Object.entries(prices)
  if (priceEntries.length === 0) return '--'
  
  // Show the first price for simplicity in the table
  const [unit, price] = priceEntries[0]
  return `${unit}: $${price || '0.00'}`
}
</script>

<style scoped>
.product-details-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px 0;
  margin-bottom: 20px;
}

.product-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-title h3 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 24px;
}

.info-card {
  margin-bottom: 16px;
}

.info-card:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.spec-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
}

.spec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.spec-header strong {
  color: #303133;
}

.values-count {
  font-size: 12px;
  color: #909399;
}

.spec-values {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.sku-summary {
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-item .label {
  color: #606266;
  font-size: 14px;
}

.summary-item .value {
  color: #303133;
  font-weight: 600;
  font-size: 16px;
}

.text-muted {
  color: #909399;
  font-style: italic;
}

/* Custom scrollbar for drawer content */
.drawer-content::-webkit-scrollbar {
  width: 6px;
}

.drawer-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.drawer-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.drawer-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>