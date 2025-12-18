import { defineConfig } from 'orval';

export default defineConfig({
  ganache: {
    output: {
      mode: 'tags-split',
      target: 'src/api/generated/ganache.ts',
      schemas: 'src/api/generated/model',
      client: 'react-query',
      mock: false,
      baseUrl: 'http://localhost:3005',
    },
    input: {
      target: './docs/openapi.json',
    },
  },
});
