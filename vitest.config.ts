import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  test: {
    globals: true,
    environment: 'jsdom',
    deps: {
      inline: ['vuetify']
    },
  }
});
