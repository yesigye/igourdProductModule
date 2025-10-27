<template>
  <div class="product-form">
    <div class="form-container">
      <!-- Product Information Section -->
      <div class="form-section">
        <h3>Product Information</h3>
        
        <el-form :model="productForm" :rules="rules" ref="formRef" label-width="140px">
          <!-- Basic Information Row -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Product Name(Major):" prop="nameMajor">
                <el-input v-model="productForm.nameMajor" placeholder="Enter" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Product Code:" prop="productCode">
                <el-input 
                  v-model="productForm.productCode" 
                  placeholder="001" 
                  :disabled="isEditMode"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- Image and Tax Information Row -->
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="Image:">
                <el-upload
                  action="#"
                  list-type="picture-card"
                  :auto-upload="false"
                  :on-change="handleImageChange"
                  :on-remove="handleImageRemove"
                  :file-list="fileList"
                  accept=".png,.jpg,.jpeg"
                >
                  <el-icon><Plus /></el-icon>
                </el-upload>
                <div class="upload-tip">To 2MB, Only Support Png, Jpg, Jpeg</div>
              </el-form-item>
            </el-col>
            
            <el-col :span="16">
              <el-row :gutter="10">
                <el-col :span="8">
                  <el-form-item label="VAT:" prop="vat">
                    <el-input v-model="productForm.vat" placeholder="W001">
                      <template #append>
                        <el-button link @click="showStockDialog('vat')">enter stock</el-button>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="Excise Duty:" prop="exciseDuty">
                    <el-input v-model="productForm.exciseDuty" placeholder="W001">
                      <template #append>
                        <el-button link @click="showStockDialog('exciseDuty')">enter stock</el-button>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="Other TAX:" prop="otherTax">
                    <el-input v-model="productForm.otherTax" placeholder="W001">
                      <template #append>
                        <el-button link @click="showStockDialog('otherTax')">enter stock</el-button>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- Status and Selection Row -->
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-form-item label="Status:" prop="status">
                    <el-radio-group v-model="productForm.status">
                      <el-radio label="onsale">Onsale</el-radio>
                      <el-radio label="offsale">Offsale</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Product Label:" prop="productLabel">
                    <el-select 
                      v-model="productForm.productLabel" 
                      placeholder="Select" 
                      style="width: 100%"
                      filterable
                      allow-create
                    >
                      <el-option 
                        v-for="label in productLabels" 
                        :key="label.id" 
                        :label="label.name" 
                        :value="label.name" 
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- Category and Spec Model Row -->
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-form-item label="Category:" prop="category">
                    <el-select 
                      v-model="productForm.category" 
                      placeholder="Select" 
                      style="width: 100%"
                      filterable
                      allow-create
                    >
                      <el-option 
                        v-for="category in categories" 
                        :key="category.id" 
                        :label="category.name" 
                        :value="category.name" 
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Spec Model:" prop="specModel">
                    <el-input v-model="productForm.specModel" placeholder="20mode" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-col>
          </el-row>

          <!-- Product Name Minor and Management Options -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Product Name(Minor):" prop="nameMinor">
                <el-input v-model="productForm.nameMinor" placeholder="Enter" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item>
                <el-checkbox v-model="productForm.shelfLifeMgmt">Shelf Life Mgmt</el-checkbox>
                <el-checkbox v-model="productForm.batchMgmt" style="margin-left: 20px;">Batch Mgmt</el-checkbox>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- Units Configuration Section -->
      <div class="form-section">
        <h3>Units Configuration</h3>
        <SkuGenerator 
          v-model:specifications="specifications"
          v-model:units="units"
          @sku-generated="handleSkuGenerated"
        />
      </div>

      <!-- Bottom actions for mobile -->
      <div class="form-actions-mobile">
        <el-button @click="handleCancel" size="large">Cancel</el-button>
        <el-button 
          type="primary" 
          @click="handleSave" 
          :loading="loading"
          size="large"
        >
          {{ loading ? 'Saving...' : 'Save' }}
        </el-button>
        <el-button 
          v-if="!isEditMode"
          type="primary" 
          @click="handleSaveAndAdd" 
          :loading="loading"
          size="large"
        >
          {{ loading ? 'Saving...' : 'Save & Add' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, defineExpose } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { productDB } from '@/utils/db'
import SkuGenerator from './SkuGenerator.vue'

const props = defineProps({
  productId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['saved', 'cancel'])

// Reactive data
const formRef = ref()
const loading = ref(false)
const fileList = ref([])

const productForm = reactive({
  nameMajor: '',
  productCode: '',
  nameMinor: '',
  vat: '',
  exciseDuty: '',
  otherTax: '',
  status: 'onsale',
  productLabel: '',
  category: '',
  specModel: '',
  shelfLifeMgmt: false,
  batchMgmt: false
})

const specifications = ref([])
const units = ref([])
const generatedSkus = ref([])
const categories = ref([])
const productLabels = ref([])

const isEditMode = computed(() => !!props.productId)

const isFormValid = computed(() => {
  return productForm.nameMajor && productForm.productCode
})

const rules = {
  nameMajor: [
    { required: true, message: 'Please enter product major name', trigger: 'blur' }
  ],
  productCode: [
    { required: true, message: 'Please enter product code', trigger: 'blur' },
    { validator: validateProductCode, trigger: 'blur' }
  ]
}

// Initialize data
onMounted(async () => {
  try {
    await productDB.init()
    await loadCategories()
    await loadProductLabels()
    
    if (isEditMode.value) {
      await loadProductData()
    }
  } catch (error) {
    ElMessage.error('Failed to initialize: ' + error.message)
  }
})

async function loadCategories() {
  try {
    categories.value = await productDB.getAllCategories()
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

async function loadProductLabels() {
  try {
    productLabels.value = await productDB.getAllProductLabels()
  } catch (error) {
    console.error('Failed to load product labels:', error)
  }
}

async function loadProductData() {
  try {
    const product = await productDB.getProduct(parseInt(props.productId))
    if (product) {
      Object.assign(productForm, product)
      specifications.value = product.specifications || []
      units.value = product.units || []
      generatedSkus.value = product.skus || []
    }
  } catch (error) {
    ElMessage.error('Failed to load product data: ' + error.message)
  }
}

async function validateProductCode(rule, value, callback) {
  if (!value) {
    callback(new Error('Please enter product code'))
    return
  }

  if (!isEditMode.value) {
    try {
      const existing = await productDB.getProductByCode(value)
      if (existing) {
        callback(new Error('Product code already exists'))
        return
      }
    } catch (error) {
      console.error('Error checking product code:', error)
    }
  }
  
  callback()
}

const prepareProductDataForSave = () => {
  // Create a clean, serializable object
  const productData = {
    nameMajor: productForm.nameMajor,
    productCode: productForm.productCode,
    nameMinor: productForm.nameMinor,
    vat: productForm.vat,
    exciseDuty: productForm.exciseDuty,
    otherTax: productForm.otherTax,
    status: productForm.status,
    productLabel: productForm.productLabel,
    category: productForm.category,
    specModel: productForm.specModel,
    shelfLifeMgmt: productForm.shelfLifeMgmt,
    batchMgmt: productForm.batchMgmt,
    specifications: specifications.value.map(spec => ({
      name: spec.name,
      values: [...spec.values] // Ensure it's a plain array
    })),
    units: units.value.map(unit => ({
      name: unit.name,
      rate: unit.rate
    })),
    skus: generatedSkus.value.map(sku => ({
      id: sku.id,
      specs: { ...sku.specs },
      specValues: [...sku.specValues],
      skuCode: sku.skuCode,
      barcode: sku.barcode,
      prices: { ...sku.prices },
      stock: sku.stock,
      costPrice: sku.costPrice,
      status: sku.status,
      unit: sku.unit
    })),
    images: fileList.value.map(file => file.name)
  }
  
  return productData
}

const handleImageChange = (file) => {
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('Image size must be less than 2MB!')
    return false
  }
  return true
}

const handleImageRemove = () => {
  // Handle image removal if needed
}

const handleSkuGenerated = (skus) => {
  generatedSkus.value = skus
}

const showStockDialog = (type) => {
  ElMessage.info(`Enter stock for ${type}`)
}

const handleSave = async () => {
  if (!await formRef.value?.validate()) return
  
  loading.value = true
  try {
    const productData = prepareProductDataForSave()

    if (isEditMode.value) {
      await productDB.updateProduct(parseInt(props.productId), productData)
    } else {
      await productDB.addProduct(productData)
    }
    
    ElMessage.success(`Product ${isEditMode.value ? 'updated' : 'saved'} successfully!`)
    emit('saved')
  } catch (error) {
    console.error('Save error:', error)
    ElMessage.error('Failed to save product: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleSaveAndAdd = async () => {
  if (!await formRef.value?.validate()) return
  
  loading.value = true
  try {
    const productData = prepareProductDataForSave()
    await productDB.addProduct(productData)
    ElMessage.success('Product saved successfully!')
    
    // Reset form for new entry
    resetForm()
    
  } catch (error) {
    console.error('Save and add error:', error)
    ElMessage.error('Failed to save product: ' + error.message)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
  specifications.value = []
  units.value = []
  generatedSkus.value = []
  fileList.value = []
  productForm.status = 'onsale'
  productForm.shelfLifeMgmt = false
  productForm.batchMgmt = false
}

const handleCancel = () => {
  emit('cancel')
}

// Expose methods to parent component
defineExpose({
  isFormValid,
  handleSave,
  handleSaveAndAdd,
  handleCancel
})
</script>

<style scoped>
.product-form {
  height: 100%;
  background: #f5f7fa;
}

.form-container {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
}

.form-section {
  margin-bottom: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-section h3 {
  margin-bottom: 20px;
  color: #303133;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.form-actions-mobile {
  display: none;
  padding: 16px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  position: sticky;
  bottom: 0;
  gap: 12px;
}

/* Responsive design */
@media (max-width: 768px) {
  .form-actions-mobile {
    display: flex;
  }
  
  .form-container {
    padding: 16px;
  }
  
  .form-section {
    padding: 16px;
    margin-bottom: 16px;
  }
}

/* Custom scrollbar for form container */
.form-container::-webkit-scrollbar {
  width: 6px;
}

.form-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.form-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.form-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>