---
title: templex
tags: [llm, content, template, library, typescript]
---

任意のテキストから書き方の「型」を抽出して再利用する。記事や投稿の構造・説得技法を template として取り出し、別トピックで同じパターンの新規コンテンツを生成。

## Core Idea

「書き方の recipe を学ぶ」ライブラリ。コピーではなく、文書構造・流れ・説得技法を抽象化する。

```
原典記事 → TemplateExtractor → 構造化テンプレート → ArticleGenerator → 新トピックで生成
```

## 抽出されるテンプレートの構造

```ts
{
  name: string;           // "Problem-Solution"
  formula: string;        // "[Hook] + [Problem] + [Solution]"
  components: [{
    name: string;         // "Hook"
    purpose: string;      // "Grab attention"
    examples: string[];
    patterns: string[];
    weight: number;
  }],
  flow: string;          // "Linear", "Circular"
  persuasionTechniques: string[];  // ["urgency", "social proof"]
}
```

## 使用例

### 抽出

```ts
import { TemplateExtractor } from '@aid-on/templex';
import { generate } from '@aid-on/unillm';

const provider = {
  chat: async (systemPrompt, userPrompt) => {
    const result = await generate('gemini:gemini-2.0-flash', [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { geminiApiKey: process.env.GEMINI_API_KEY });
    return result.text;
  }
};

const extractor = new TemplateExtractor({
  provider,
  language: 'en',
  extractPatterns: true,
  extractKeywords: true
});

const result = await extractor.extract(article);
console.log(result.template, result.confidence);
```

### 生成

```ts
import { ArticleGenerator } from '@aid-on/templex';

const generator = new ArticleGenerator('gemini:gemini-2.0-flash', {
  apiKeys: { geminiApiKey: process.env.GEMINI_API_KEY }
});

const newArticle = await generator.generate(
  result.template.abstractTemplate,
  {
    topic: 'Cloud Migration',
    fearHook: 'Is your on-premise infrastructure draining your budget?',
    solution: 'Cloud services that scale with your needs',
    cta: 'Get a free cloud assessment'
  }
);
```

### 既存パターンから直接生成

```ts
const article = await generator.generateFromPattern('problem-solution', {
  topic: 'Remote Work Productivity',
  problem: 'Teams struggling with collaboration',
  solution: 'Integrated communication platform',
  benefits: ['30% faster decisions', 'Better work-life balance']
});

const fearArticle = await generator.generateFromPattern('fear-driven', {
  topic: 'Cybersecurity',
  fearHook: 'Your data could be stolen right now',
  evidence: 'Cyber attacks increased 40% this year',
  solution: 'AI-powered threat detection',
  urgency: 'Limited time offer'
});
```

## 設定オプション

| Option | Description |
|---|---|
| `provider` | LLM provider |
| `language` | 'en' / 'ja' |
| `extractPatterns` | 文章パターン抽出 |
| `extractKeywords` | キーワード抽出 |
| `maxDepth` | refinement の反復回数 |
| `useIterativeRefinement` | 多段精錬を有効化 |

## 依存関係

- [[unillm]] — LLM provider 抽象
- [[fractop]] — 長文ドキュメントの fractal 処理
- [[iteratop]] — 反復精錬

## 関連

- [[fractop]] / [[iteratop]] — 同じ Aid-On *oP 系列
- [[unillm]] — provider 抽象

## Links

- [GitHub](https://github.com/Aid-On/templex)
- [npm](https://www.npmjs.com/package/@aid-on/templex)
