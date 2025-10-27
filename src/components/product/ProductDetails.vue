<template>
  <div class="product-details">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Product Details</span>
          <div class="creator">Creator: HHB</div>
        </div>
      </template>

      <!-- Basic Information -->
      <div class="info-section">
        <h3>Basic Information</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="Name(Major)" width="150">
            {{ product.nameMajor }}
          </el-descriptions-item>
          <el-descriptions-item label="Image">
            <div v-if="product.images && product.images.length > 0">
              <el-image 
                v-for="(image, index) in product.images" 
                :key="index"
                :src="image" 
                style="width: 60px; height: 60px; margin-right: 10px;"
              />
            </div>
            <span v-else>No Image</span>
          </el-descriptions-item>
          
          <el-descriptions-item label="Product Code">
            {{ product.productCode }}
          </el-descriptions-item>
          <el-descriptions-item label="VAT">
            {{ product.vat }}
          </el-descriptions-item>
          
          <el-descriptions-item label="Name(Minor)">
            {{ product.nameMinor }}
          </el-descriptions-item>
          <el-descriptions-item label="Excise Duty">
            {{ product.exciseDuty }}
          </el-descriptions-item>
          
          <el-descriptions-item label="Spec Model">
            {{ product.specModel }}
          </el-descriptions-item>
          <el-descriptions-item label="Other VAT">
            {{ product.otherTax }}
          </el-descriptions-item>
          
          <el-descriptions-item label="Shelf Life Mgmt">
            {{ product.shelfLifeMgmt ? 'Open' : 'Closed' }}
          </el-descriptions-item>
          <el-descriptions-item label="Shelf Life Unit">
            {{ product.shelfLifeUnit || '--' }}
          </el-descriptions-item>
          
          <el-descriptions-item label="Warning Days">
            {{ product.warningDays || '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="ECM">
            {{ product.ecm || '--' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- Units Information -->
      <div class="info-section" v-if="product.units && product.units.length > 0">
        <h3>Unit</h3>
        <el-table :data="product.units" style="width: 100%">
          <el-table-column prop="name" label="Unit Name" />
          <el-table-column prop="rate" label="Unit Rate" />
          <el-table-column label="Type">
            <template #default="{ $index }">
              {{ $index === 0 ? 'Major Unit' : 'Minor Unit' }}
            </template>
          </el-table-column>
          <el-table-column label="Conversion">
            <template #default="{ row, $index }">
              <span v-if="$index > 0">
                1 {{ row.name }} = {{ row.rate }} {{ product.units[0].name }}
              </span>
              <span v-else>Base Unit</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Specifications -->
      <div class="info-section" v-if="product.specifications && product.specifications.length > 0">
        <h3>Spec</h3>
        <el-row :gutter="20">
          <el-col 
            :span="8" 
            v-for="(spec, index) in product.specifications" 
            :key="index"
            style="margin-bottom: 10px;"
          >
            <el-card shadow="hover">
              <template #header>
                <strong>Spec {{ index + 1 }}</strong>
              </template>
              <div>{{ spec.name }}</div>
              <el-tag 
                v-for="value in spec.values" 
                :key="value"
                style="margin: 2px;"
              >
                {{ value }}
              </el-tag>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- SKU List -->
      <div class="info-section" v-if="product.skus && product.skus.length > 0">
        <h3>SKU List</h3>
        <el-table :data="product.skus" border style="width: 100%">
          <el-table-column type="index" width="50" />
          <el-table-column prop="status" label="Status" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                {{ row.status === 'active' ? 'Open' : 'Close' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <!-- Dynamic spec columns -->
          <el-table-column 
            v-for="spec in product.specifications" 
            :key="spec.name"
            :label="spec.name"
            width="120"
          >
            <template #default="{ row }">
              {{ row.specs[spec.name] }}
            </template>
          </el-table-column>
          
          <el-table-column prop="weight" label="Weight" width="100" />
          <el-table-column prop="barcode" label="SKU Barcode" width="130" />
          <el-table-column prop="skuCode" label="Spec Code" width="120" />
          <el-table-column prop="stock" label="Initial Stock" width="120" />
          <el-table-column prop="unit" label="Unit" width="80" />
          <el-table-column prop="prices" label="Selling Price" width="100">
            <template #default="{ row }">
              {{ formatPrice(row.prices) }}
            </template>
          </el-table-column>
          <el-table-column prop="costPrice" label="Cost Price" width="100">
            <template #default="{ row }">
              {{ row.costPrice ? `$${row.costPrice}` : '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="remarks" label="Remarks" />
        </el-table>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <el-button @click="handleBack">Back to List</el-button>
        <el-button type="primary" @click="handleEdit">Edit Product</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { productDB } from '@/utils/db'

const route = useRoute()
const router = useRouter()
const product = ref({})
const loading = ref(false)

onMounted(async () => {
  await loadProductDetails()
})

async function loadProductDetails() {
  loading.value = true
  try {
    const productId = parseInt(route.params.id)
    if (productId) {
      const productData = await productDB.getProduct(productId)
      if (productData) {
        product.value = productData
      } else {
        ElMessage.error('Product not found')
        router.push('/products')
      }
    }
  } catch (error) {
    ElMessage.error('Failed to load product details: ' + error.message)
  } finally {
    loading.value = false
  }
}

function formatPrice(prices) {
  if (!prices || typeof prices !== 'object') return '--'
  
  const priceEntries = Object.entries(prices)
  if (priceEntries.length === 0) return '--'
  
  return priceEntries.map(([unit, price]) => {
    return `${unit}: $${price || '0.00'}`
  }).join(', ')
}

function handleBack() {
  router.push('/products')
}

function handleEdit() {
  router.push(`/products/edit/${route.params.id}`)
}
</script>

<style scoped>
.product-details {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.creator {
  font-size: 14px;
  color: #666;
}

.info-section {
  margin-bottom: 30px;
}

.info-section h3 {
  margin-bottom: 16px;
  color: #303133;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.action-buttons {
  text-align: center;
  margin-top: 30px;
}
</style>