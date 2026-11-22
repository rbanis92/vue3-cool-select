import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'Vue3CoolSelect',
      formats: ['es', 'umd'],
      fileName: format => format === 'es' ? 'vue3-cool-select.mjs' : 'vue3-cool-select.umd.js'
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: { vue: 'Vue' }
      }
    }
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.spec.js']
  }
})
