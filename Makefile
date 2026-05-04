.PHONY: help review sync dashboard daily lint dev build install-deps doctor

VAULT := $(or $(AWEN_VAULT),$(CURDIR)/vault)
export AWEN_VAULT := $(VAULT)

help:
	@printf "O6lvl4-knowledge — knowledge retention loop\n\n"
	@printf "  make review     — awen review (study session)\n"
	@printf "  make sync       — write retention back to vault frontmatter\n"
	@printf "  make dashboard  — regenerate vault/dashboard.md\n"
	@printf "  make lint       — premaid lint --fix on every vault note (mermaid syntax)\n"
	@printf "  make daily      — lint + review + sync + dashboard (the morning ritual)\n"
	@printf "  make dev        — start the graph-garden viewer at :4321\n"
	@printf "  make build      — build the static viewer\n"
	@printf "  make doctor     — verify awen + node + premaid are on PATH\n\n"
	@printf "AWEN_VAULT=$(VAULT)\n"

doctor:
	@command -v awen >/dev/null || { printf "✗ awen not found on PATH. Install with:\n  almide install github.com/O6lvl4/awen\n"; exit 1; }
	@command -v node >/dev/null || { printf "✗ node not found on PATH.\n"; exit 1; }
	@command -v premaid >/dev/null || { printf "✗ premaid not found on PATH. Install with:\n  npm i -g premaid\n  (skip if you don't need mermaid linting)\n"; }
	@printf "✓ awen     $$(awen version)\n"
	@printf "✓ node     $$(node --version)\n"
	@command -v premaid >/dev/null && printf "✓ premaid  $$(premaid --version 2>/dev/null || echo installed)\n" || true
	@printf "✓ vault    $(VAULT)\n"

review:
	@awen review

sync:
	@node scripts/awen-sync.mjs

dashboard:
	@node scripts/awen-dashboard.mjs

lint:
	@command -v premaid >/dev/null || { printf "premaid not on PATH; skipping mermaid lint\n"; exit 0; }
	@premaid lint --fix vault/*.md 2>&1 | tail -3

daily: lint review sync dashboard
	@printf "\nDone. Review the diff before committing.\n"
	@git -C $(CURDIR) status --short vault/

dev:
	@cd viewer && npm run dev

build:
	@cd viewer && npm run build

install-deps:
	@cd viewer && npm ci
