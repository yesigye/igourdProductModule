<template>
  <div class="product-form-drawer">
    <!-- Header with actions -->
    <div class="drawer-header">
      <div class="header-content">
        <h3>{{ mode === 'add' ? 'Add Product' : `Edit Product - ${productForm.nameMajor}` }}</h3>
        <div class="header-actions">
          <el-button @click="handleCancel">Cancel</el-button>
          <el-button 
            type="primary" 
            @click="handleSave" 
            :loading="loading"
            :disabled="!isFormValid"
          >
            {{ loading ? 'Saving...' : 'Save' }}
          </el-button>
          <el-button 
            v-if="mode === 'add'"
            type="primary" 
            @click="handleSaveAndAdd" 
            :loading="loading"
            :disabled="!isFormValid"
          >
            {{ loading ? 'Saving...' : 'Save & Add Another' }}
          </el-button>
        </div>
      </div>
    </div>

    <div class="drawer-content">
      <ProductForm
        ref="productFormRef"
        :product-id="productId"
        :key="formKey"
        @saved="handleFormSaved"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue' // Added reactive import
import { ElMessage } from 'element-plus'
import ProductForm from './ProductForm.vue'

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: (value) => ['add', 'edit'].includes(value)
  },
  productId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['saved', 'cancel'])

const productFormRef = ref()
const loading = ref(false)
const formKey = ref(0)
const productForm = reactive({ nameMajor: '' }) // Properly defined with reactive

const isFormValid = computed(() => {
  return productFormRef.value?.isFormValid || false
})

// Watch for form updates to get the product name
watch(() => productFormRef.value?.productForm, (newForm) => {
  if (newForm) {
    Object.assign(productForm, newForm)
  }
}, { deep: true, immediate: true })

const handleSave = async () => {
  if (!productFormRef.value) {
    ElMessage.error('Form not ready')
    return
  }
  
  loading.value = true
  try {
    await productFormRef.value.handleSave()
    // The saved event will be emitted from the form component
  } catch (error) {
    ElMessage.error('Failed to save product: ' + error.message)
    loading.value = false
  }
}

const handleSaveAndAdd = async () => {
  if (!productFormRef.value) {
    ElMessage.error('Form not ready')
    return
  }
  
  loading.value = true
  try {
    await productFormRef.value.handleSaveAndAdd()
    // Form will reset itself, we just need to update our key to force re-render if needed
    formKey.value++
  } catch (error) {
    ElMessage.error('Failed to save product: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleFormSaved = () => {
  loading.value = false
  emit('saved')
}

const handleCancel = () => {
  emit('cancel')
}

// Make sure the form is ready when drawer opens
watch(() => props.mode, () => {
  if (props.mode === 'add') {
    formKey.value++ // Force re-render for new form
  }
})
</script>

<style scoped>
.product-form-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 20px 24px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* Custom scrollbar */
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