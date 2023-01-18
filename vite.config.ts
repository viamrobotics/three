/// <reference types="vitest" />
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: true,
    target: 'esnext',
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: 'src/main.ts',
      name: 'OrientationVector',
      // the proper extensions will be added
      fileName: 'ov',
    },
  },
  test: {}
})
