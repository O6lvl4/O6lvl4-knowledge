import { defineConfig } from 'astro/config';
import graphGarden from '@o6lvl4/graph-garden';

export default defineConfig({
  site: 'https://o6lvl4.github.io',
  base: '/O6lvl4-knowledge',
  integrations: [
    graphGarden({
      vault: '../vault',
      title: 'O6lvl4 Knowledge',
    }),
  ],
});
