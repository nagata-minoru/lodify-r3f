/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages ではサブパス /lodify-r3f/ で公開するため、ビルド時だけ base を変える
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/lodify-r3f/' : '/',
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    // gh-pages -d build でデプロイしているので、CRA と同じ出力先にする
    outDir: 'build',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
}));
