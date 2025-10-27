// deploy.js
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('Building the application...')

try {
  // Build the application
  execSync('npm run build', { stdio: 'inherit' })
  
  // Create a simple HTML fallback for SPA routing
  const distDir = path.join(__dirname, 'dist')
  const indexHtml = path.join(distDir, 'index.html')
  const fallbackHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Management System</title>
    <script>
        // Simple redirect to handle SPA routing
        window.location.href = '/';
    </script>
</head>
<body>
    <noscript>
        <p>Please enable JavaScript to use this application.</p>
    </noscript>
</body>
</html>
  `
  
  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true })
  }
  
  console.log('Build completed successfully!')
  console.log('Output directory: dist/')
  
} catch (error) {
  console.error('Build failed:', error)
  process.exit(1)
}