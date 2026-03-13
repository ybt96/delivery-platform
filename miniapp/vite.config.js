import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

const srcPath = path.resolve(__dirname, 'src')

// https://vitejs.dev/config/
export default defineConfig({
  
  plugins: [
    uni(),
  ],
  resolve: {
    alias: {
      '@': srcPath,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 压制 Dart Sass @import 废弃警告
        silenceDeprecations: ['import', 'legacy-js-api'],
      },
    },
  },
})
