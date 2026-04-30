import { defineConfig } from 'astro/config';
import { remarkWikilinks } from './src/lib/remark-wikilinks';
import { readFileSync } from 'node:fs';

const BASE = '/O6lvl4-knowledge';
const almideGrammar = JSON.parse(
  readFileSync(new URL('./src/grammars/almide.tmLanguage.json', import.meta.url), 'utf-8')
);

export default defineConfig({
  site: 'https://o6lvl4.github.io',
  base: BASE,
  output: 'static',
  markdown: {
    remarkPlugins: [[remarkWikilinks, { base: BASE }]],
    shikiConfig: {
      theme: 'github-dark',
      langs: [{ ...almideGrammar, aliases: ['almd'] }],
    },
  },
});
