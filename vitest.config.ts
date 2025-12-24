import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './tests/setup.ts',
        include: ['tests/**/*.test.{ts,tsx}'],
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    resolve: {
        alias: [
            { find: '@', replacement: path.resolve(__dirname, './src') },
            { find: /^.*\.css$/, replacement: path.resolve(__dirname, './tests/__mocks__/styleMock.js') },
        ],
    },
});
