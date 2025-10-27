<template>
  <div class="sku-generator">
    <!-- Multi-Units Configuration -->
    <div class="config-section">
      <el-checkbox v-model="enableMultiUnits">
        Multi-Units - Purchasing and sales use different units of measurement. Please enable this feature.
      </el-checkbox>
    </div>

    <!-- Specifications Configuration -->
    <div class="config-section">
      <h4>Specifications Configuration</h4>
      <div class="spec-list">
        <div v-for="(spec, specIndex) in specifications" :key="specIndex" class="spec-item">
          <el-input
            v-model="spec.name"
            placeholder="Spec name (e.g., Color)"
            style="width: 150px; margin-right: 10px;"
          />
          <el-tag
            v-for="(value, valueIndex) in spec.values"
            :key="valueIndex"
            closable
            @close="removeSpecValue(specIndex, valueIndex)"
            style="margin-right: 5px; margin-bottom: 5px;"
          >
            {{ value }}
          </el-tag>
          <el-input
            v-model="spec.newValue"
            placeholder="Add value"
            style="width: 120px; margin-right: 10px;"
            @keyup.enter="addSpecValue(specIndex)"
          >
            <template #append>
              <el-button @click="addSpecValue(specIndex)" :disabled="!spec.newValue">
                <el-icon><Plus /></el-icon>
              </el-button>
            </template>
          </el-input>
          <el-button @click="removeSpec(specIndex)" type="danger" text>
            Remove
          </el-button>
        </div>
      </div>
      <el-button @click="addSpec" type="primary" text>
        + Add Specification
      </el-button>
    </div>

    <!-- Units Configuration -->
    <div class="config-section" v-if="enableMultiUnits">
      <h4>Units Configuration</h4>
      <el-table :data="units" style="width: 100%; margin-bottom: 15px;">
        <el-table-column label="Unit Name" width="200">
          <template #default="{ row, $index }">
            <el-input v-model="row.name" placeholder="e.g., Box, Carton" />
          </template>
        </el-table-column>
        <el-table-column label="Unit Rate" width="150">
          <template #default="{ row, $index }">
            <el-input-number 
              v-model="row.rate" 
              :min="1" 
              :precision="2"
              placeholder="Rate" 
            />
          </template>
        </el-table-column>
        <el-table-column label="Major Unit" width="120">
          <template #default="{ row, $index }">
            <el-radio v-model="majorUnitIndex" :label="$index">
              Major
            </el-radio>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="100">
          <template #default="{ $index }">
            <el-button 
              @click="removeUnit($index)" 
              type="danger" 
              text
              :disabled="units.length <= 1"
            >
              Remove
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button @click="addUnit" type="primary" text>
        + Add Unit
      </el-button>
    </div>

    <!-- Basic Unit Configuration (when multi-units is disabled) -->
    <div class="config-section" v-else>
      <h4>Basic Unit Configuration</h4>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Purchase Unit:">
            <el-select v-model="basicUnits.purchase" placeholder="Select" style="width: 100%">
              <el-option 
                v-for="unit in commonUnits" 
                :key="unit" 
                :label="unit" 
                :value="unit" 
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Sales Unit:">
            <el-select v-model="basicUnits.sales" placeholder="Select" style="width: 100%">
              <el-option 
                v-for="unit in commonUnits" 
                :key="unit" 
                :label="unit" 
                :value="unit" 
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <!-- Generated SKUs -->
    <div class="config-section" v-if="generatedSkus.length > 0">
      <h4>Generated SKUs ({{ generatedSkus.length }})</h4>
      <el-table 
        :data="paginatedSkus" 
        border 
        style="width: 100%;" 
        max-height="400"
      >
        <el-table-column type="index" width="50" />
        
        <!-- Dynamic spec columns -->
        <el-table-column 
          v-for="spec in specifications" 
          :key="spec.name"
          :label="spec.name"
          width="120"
        >
          <template #default="{ row }">
            {{ row.specs[spec.name] }}
          </template>
        </el-table-column>

        <!-- Unit columns for multi-units -->
        <el-table-column 
          v-for="unit in displayUnits" 
          :key="unit.name"
          :label="`Price (${unit.name})`"
          width="150"
        >
          <template #default="{ row }">
            <el-input-number
              v-model="row.prices[unit.name]"
              :min="0"
              :precision="2"
              placeholder="0.00"
              size="small"
            />
          </template>
        </el-table-column>

        <!-- Stock and other fields -->
        <el-table-column label="Stock" width="120">
          <template #default="{ row }">
            <el-input-number
              v-model="row.stock"
              :min="0"
              placeholder="0"
              size="small"
            />
          </template>
        </el-table-column>

        <el-table-column label="SKU Code" width="150">
          <template #default="{ row }">
            <el-input
              v-model="row.skuCode"
              placeholder="Auto-generated"
              size="small"
            />
          </template>
        </el-table-column>

        <el-table-column label="Barcode" width="150">
          <template #default="{ row }">
            <el-input
              v-model="row.barcode"
              placeholder="Barcode"
              size="small"
            />
          </template>
        </el-table-column>

        <el-table-column label="Cost Price" width="120">
          <template #default="{ row }">
            <el-input-number
              v-model="row.costPrice"
              :min="0"
              :precision="2"
              placeholder="0.00"
              size="small"
            />
          </template>
        </el-table-column>

        <el-table-column label="Status" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="active"
              inactive-value="inactive"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination for SKU table -->
      <div class="pagination" v-if="generatedSkus.length > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="generatedSkus.length"
          layout="prev, pager, next"
        />
      </div>

      <!-- Bulk Actions -->
      <div class="bulk-actions">
        <el-button @click="bulkEdit" type="primary" text>
          Bulk Edit
        </el-button>
        <el-button @click="generateSkus" type="success">
          Regenerate SKUs
        </el-button>
        <el-button @click="clearAll" type="danger" text>
          Clear All
        </el-button>
      </div>
    </div>

    <!-- Preview before generation -->
    <div class="config-section" v-else-if="specifications.length > 0">
      <div class="preview-info">
        <p>
          Ready to generate 
          <strong>{{ totalCombinations }}</strong> 
          SKU combinations from:
        </p>
        <ul>
          <li v-for="spec in specifications" :key="spec.name">
            {{ spec.name }}: {{ spec.values.length }} values
          </li>
        </ul>
        <el-button @click="generateSkus" type="primary">
          Generate SKUs
        </el-button>
      </div>
    </div>

    <!-- Bulk Edit Dialog -->
    <el-dialog v-model="bulkEditDialogVisible" title="Bulk Edit SKUs" width="600px">
      <el-form :model="bulkEditForm" label-width="120px">
        <el-form-item label="Field:">
          <el-select v-model="bulkEditForm.field" placeholder="Select field">
            <el-option label="Stock" value="stock" />
            <el-option label="Cost Price" value="costPrice" />
            <el-option 
              v-for="unit in displayUnits" 
              :key="unit.name"
              :label="`Price (${unit.name})`" 
              :value="`price_${unit.name}`" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Value:">
          <el-input-number
            v-model="bulkEditForm.value"
            :precision="2"
            placeholder="Enter value"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bulkEditDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="applyBulkEdit">Apply</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// Props and Emits
const emit = defineEmits(['update:specifications', 'update:units', 'skuGenerated'])

const props = defineProps({
  specifications: {
    type: Array,
    default: () => []
  },
  units: {
    type: Array,
    default: () => []
  }
})

// Reactive data
const enableMultiUnits = ref(false)
const majorUnitIndex = ref(0)
const generatedSkus = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const bulkEditDialogVisible = ref(false)

const commonUnits = ref(['Pcs', 'Box', 'Bag', 'Carton', 'Pack', 'Set', 'Pair', 'Roll', 'Grams', 'Kg', 'Meter'])

const basicUnits = reactive({
  purchase: 'Pcs',
  sales: 'Pcs'
})

const bulkEditForm = reactive({
  field: '',
  value: 0
})

// Computed properties
const displayUnits = computed(() => {
  if (enableMultiUnits.value && props.units.length > 0) {
    return props.units
  }
  return [{ name: basicUnits.purchase }]
})

const totalCombinations = computed(() => {
  if (props.specifications.length === 0) return 0
  
  return props.specifications.reduce((total, spec) => {
    return total * (spec.values.length || 1)
  }, 1)
})

const paginatedSkus = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return generatedSkus.value.slice(start, end)
})

// Watch for changes and emit updates
watch(() => props.specifications, (newVal) => {
  emit('update:specifications', newVal)
}, { deep: true })

watch(() => props.units, (newVal) => {
  emit('update:units', newVal)
}, { deep: true })

// Initialize with one spec and one unit if empty
if (props.specifications.length === 0) {
  emit('update:specifications', [{
    name: 'Color',
    values: ['Black', 'White'],
    newValue: ''
  }])
}

if (props.units.length === 0) {
  emit('update:units', [{
    name: 'Pcs',
    rate: 1
  }])
}

// Methods
function addSpec() {
  const newSpecs = [...props.specifications, {
    name: `Spec${props.specifications.length + 1}`,
    values: [],
    newValue: ''
  }]
  emit('update:specifications', newSpecs)
}

function removeSpec(index) {
  const newSpecs = props.specifications.filter((_, i) => i !== index)
  emit('update:specifications', newSpecs)
}

function addSpecValue(specIndex) {
  const spec = props.specifications[specIndex]
  if (spec.newValue && !spec.values.includes(spec.newValue)) {
    const newSpecs = [...props.specifications]
    newSpecs[specIndex].values.push(spec.newValue)
    newSpecs[specIndex].newValue = ''
    emit('update:specifications', newSpecs)
  }
}

function removeSpecValue(specIndex, valueIndex) {
  const newSpecs = [...props.specifications]
  newSpecs[specIndex].values.splice(valueIndex, 1)
  emit('update:specifications', newSpecs)
}

function addUnit() {
  const newUnits = [...props.units, {
    name: `Unit${props.units.length + 1}`,
    rate: 1
  }]
  emit('update:units', newUnits)
}

function removeUnit(index) {
  const newUnits = props.units.filter((_, i) => i !== index)
  if (majorUnitIndex.value === index) {
    majorUnitIndex.value = 0
  } else if (majorUnitIndex.value > index) {
    majorUnitIndex.value--
  }
  emit('update:units', newUnits)
}

// Cartesian product algorithm for generating SKU combinations
function cartesianProduct(arrays) {
  return arrays.reduce((acc, curr) => {
    return acc.flatMap(x => curr.map(y => [...x, y]))
  }, [[]])
}

function generateSkus() {
  if (props.specifications.length === 0) {
    ElMessage.warning('Please add at least one specification')
    return
  }

  // Check if all specs have values
  for (const spec of props.specifications) {
    if (spec.values.length === 0) {
      ElMessage.warning(`Please add values for ${spec.name}`)
      return
    }
  }

  try {
    // Prepare arrays for cartesian product
    const specArrays = props.specifications.map(spec => spec.values)
    
    // Generate all combinations using cartesian product
    const combinations = cartesianProduct(specArrays)
    
    // Convert combinations to SKU objects
    const skus = combinations.map((combination, index) => {
      const specs = {}
      const specValues = []
      
      props.specifications.forEach((spec, specIndex) => {
        specs[spec.name] = combination[specIndex]
        specValues.push(combination[specIndex])
      })
      
      const skuCode = `SKU${String(index + 1).padStart(3, '0')}`
      const barcode = `BC${String(index + 1).padStart(5, '0')}`
      
      const prices = {}
      displayUnits.value.forEach(unit => {
        prices[unit.name] = 0
      })
      
      // Return plain object without any methods
      return {
        id: index + 1,
        specs: { ...specs }, // Ensure it's a plain object
        specValues: [...specValues], // Ensure it's a plain array
        skuCode,
        barcode,
        prices: { ...prices }, // Ensure it's a plain object
        stock: 0,
        costPrice: 0,
        status: 'active',
        unit: displayUnits.value[0]?.name || 'Pcs'
      }
    })
    
    generatedSkus.value = skus
    currentPage.value = 1
    
    // Emit generated SKUs to parent
    emit('skuGenerated', skus)
    
    ElMessage.success(`Generated ${skus.length} SKU combinations`)
  } catch (error) {
    ElMessage.error('Failed to generate SKUs: ' + error.message)
  }
}

function bulkEdit() {
  if (generatedSkus.value.length === 0) {
    ElMessage.warning('No SKUs to edit')
    return
  }
  bulkEditForm.field = ''
  bulkEditForm.value = 0
  bulkEditDialogVisible.value = true
}

function applyBulkEdit() {
  if (!bulkEditForm.field) {
    ElMessage.warning('Please select a field to edit')
    return
  }

  const field = bulkEditForm.field
  const value = bulkEditForm.value

  generatedSkus.value.forEach(sku => {
    if (field.startsWith('price_')) {
      const unitName = field.replace('price_', '')
      sku.prices[unitName] = value
    } else {
      sku[field] = value
    }
  })

  bulkEditDialogVisible.value = false
  ElMessage.success(`Updated ${field} for all SKUs`)
  
  // Re-emit updated SKUs
  emit('skuGenerated', generatedSkus.value)
}

function clearAll() {
  generatedSkus.value = []
  emit('update:specifications', [])
  emit('update:units', [{
    name: 'Pcs',
    rate: 1
  }])
  majorUnitIndex.value = 0
  enableMultiUnits.value = false
  emit('skuGenerated', [])
  ElMessage.info('Cleared all specifications and SKUs')
}

// Watch multi-units toggle
watch(enableMultiUnits, (newVal) => {
  if (!newVal) {
    // Reset to basic units when disabling multi-units
    basicUnits.purchase = 'Pcs'
    basicUnits.sales = 'Pcs'
  } else {
    // Ensure we have at least one unit when enabling multi-units
    if (props.units.length === 0) {
      emit('update:units', [{
        name: 'Pcs',
        rate: 1
      }])
    }
  }
})

// Watch major unit index changes
watch(majorUnitIndex, (newIndex) => {
  if (props.units[newIndex]) {
    // You can add logic here to handle major unit changes
    console.log('Major unit changed to:', props.units[newIndex].name)
  }
})
</script>

<style scoped>
.sku-generator {
  width: 100%;
}

.config-section {
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.config-section h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-weight: 600;
}

.spec-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
  flex-wrap: wrap;
}

.spec-item:last-child {
  margin-bottom: 0;
}

.preview-info {
  text-align: center;
  padding: 20px;
  background: #f0f9ff;
  border-radius: 4px;
  border: 1px dashed #91caff;
}

.preview-info ul {
  text-align: left;
  display: inline-block;
  margin: 10px 0;
}

.bulk-actions {
  margin-top: 16px;
  text-align: center;
}

.pagination {
  margin-top: 16px;
  text-align: center;
}

:deep(.el-tag) {
  margin-bottom: 5px;
}
</style>