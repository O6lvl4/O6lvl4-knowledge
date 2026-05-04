---
title: Welcome
tags: [meta]
---

O6lvl4 Knowledge — markdown vault paired with [awen](https://github.com/O6lvl4/awen) (SM-2 spaced repetition CLI).

## The loop

1. Write a note: `vault/<slug>.md`
2. Capture flashcards: `awen add <slug>`
3. Review what's due: `make review` (`awen review` under the hood)
4. Sync retention back into vault frontmatter: `make sync`
5. Refresh the dashboard: `make dashboard` → `vault/dashboard.md`

`make daily` runs review → sync → dashboard in one go.

## What gets stored where

- **Notes** — `vault/<slug>.md` — markdown, hand-written, public
- **Cards** — `vault/.srs/<slug>/<card-id>.json` — SM-2 state per card, managed by awen, committed
- **Frontmatter sync** — managed keys (`srs_state`, `retention`, `card_count`, `reviewed_count`, `last_reviewed`, `next_due`) get rewritten by `make sync`. User keys (`title`, `tags`, etc.) are preserved.
- **Dashboard** — `vault/dashboard.md` — auto-generated, marked `public: false` so the viewer can hide it

## Setup once

```bash
curl -fsSL https://raw.githubusercontent.com/almide/almide/main/tools/install.sh | sh
almide install github.com/O6lvl4/awen
make doctor   # confirms awen + node are on PATH
```
