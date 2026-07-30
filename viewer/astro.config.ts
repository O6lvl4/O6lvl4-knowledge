import { defineConfig } from 'astro/config';
import type { AstroIntegration } from 'astro';
import graphGarden from '@o6lvl4/graph-garden';

const customStyles: AstroIntegration = {
  name: 'custom-styles',
  hooks: {
    'astro:config:setup': ({ injectScript }) => {
      injectScript('page-ssr', `import '/src/styles/custom.css';`);
    },
  },
};

export default defineConfig({
  site: 'https://o6lvl4.github.io',
  base: '/O6lvl4-knowledge',
  integrations: [
    graphGarden({
      vault: '../vault',
      title: 'O6lvl4 Knowledge',
      navLinks: [{ label: 'Recent', href: 'recent' }],
    }),
    customStyles,
  ],
});
