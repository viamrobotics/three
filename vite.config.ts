/// <reference types="vitest" />
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'esnext',
    sourcemap: true,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: 'src/main.ts',
      formats: ['es'],
      // the proper extensions will be added
      fileName: 'ov',
    },
    rollupOptions: {
      /*
       * make sure to externalize deps that shouldn't be bundled
       * into your library
       */
      external: ['three'],
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  test: {},
});
