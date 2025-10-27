<template>
  <div id="app">
    <el-container>
      <!-- Navigation Sidebar -->
      <el-aside width="200px" style="background-color: #545c64; min-height: 100vh;">
        <el-menu
          default-active="/products"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          router
        >
          <el-menu-item index="/products">
            <el-icon><Box /></el-icon>
            <span>Product Management</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- Main Content -->
      <el-container>
        <el-header style="background-color: #fff; border-bottom: 1px solid #e6e6e6;">
          <div class="header-content">
            <h2>Product Management System</h2>
            <div class="header-actions">
              <el-button type="primary" @click="exportData">
                <el-icon><Download /></el-icon>
                Export Data
              </el-button>
              <el-button @click="recreateSampleDataHere" type="warning">
                <el-icon><Refresh /></el-icon>
                Reset Sample Data
              </el-button>
            </div>
          </div>
        </el-header>

        <el-main>
          <router-view v-if="appReady" />
          <div v-else class="loading-fallback">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <p>Loading application...</p>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Box, Download, Refresh, Loading } from '@element-plus/icons-vue'
import { productDB } from '@/utils/db'
import { initializeSampleData, recreateSampleData } from '@/utils/initDB'

const appReady = ref(false)

onMounted(async () => {
  try {
    await initializeDatabase()
  } catch (error) {
    console.error('App initialization failed:', error)
    ElMessage.error('Application initialization failed. Please refresh the page.')
  } finally {
    appReady.value = true
  }
})

async function initializeDatabase() {
  // Initialize the database
  await productDB.init()
  
  // This will create sample data only if no data exists
  await initializeSampleData()
  
  console.log('Database initialized successfully')
}

const recreateSampleDataHere = async () => {
  try {
    await ElMessageBox.confirm(
      'This will delete all existing data and recreate sample products. Continue?',
      'Reset Sample Data',
      {
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
    
    await recreateSampleData()
    ElMessage.success('Sample data recreated successfully!')
    
    // Refresh the page to show updated data
    window.location.reload()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to recreate sample data')
    }
  }
}

const exportData = async () => {
  try {
    const products = await productDB.getAllProducts()
    const dataStr = JSON.stringify(products, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `products-export-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    ElMessage.success('Data exported successfully')
  } catch (error) {
    ElMessage.error('Failed to export data: ' + error.message)
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  height: 100vh;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header-content h2 {
  color: #303133;
  font-weight: 500;
}

.el-header {
  padding: 0 20px;
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.loading-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #606266;
}

.loading-icon {
  font-size: 40px;
  margin-bottom: 16px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>