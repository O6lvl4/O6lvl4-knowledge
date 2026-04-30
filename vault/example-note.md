---
title: Example Note
tags: [example, demo]
---

This is an example note demonstrating features.

## Wikilinks

You can link to other notes like [[index|Home]] or [[Getting Started]].

## Code Blocks

```python
def hello():
    print("Hello, World!")
```

## Formatting

- **Bold text**
- *Italic text*
- `inline code`

> Blockquotes work too.

## Mermaid Diagrams

```mermaid
graph LR
    A[Obsidian] -->|push| B[GitHub]
    B -->|build| C[Astro]
    C -->|deploy| D[GitHub Pages]
    D -->|view| E[Viewer]
```

```mermaid
sequenceDiagram
    participant U as User
    participant O as Obsidian
    participant G as GitHub
    participant V as Viewer
    U->>O: Write note
    O->>G: git push
    G->>V: Deploy
    V->>U: Read note
```
