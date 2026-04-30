import { defineConfig } from 'astro/config';
import { remarkWikilinks } from './src/lib/remark-wikilinks';

const BASE = '/O6lvl4-knowledge';

export default defineConfig({
  site: 'https://o6lvl4.github.io',
  base: BASE,
  output: 'static',
  markdown: {
    remarkPlugins: [[remarkWikilinks, { base: BASE }]],
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
