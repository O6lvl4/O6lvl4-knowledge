.PHONY: help review sync dashboard daily dev build install-deps doctor

VAULT := $(or $(AWEN_VAULT),$(CURDIR)/vault)
export AWEN_VAULT := $(VAULT)

help:
	@printf "O6lvl4-knowledge — knowledge retention loop\n\n"
	@printf "  make review     — awen review (study session)\n"
	@printf "  make sync       — write retention back to vault frontmatter\n"
	@printf "  make dashboard  — regenerate vault/dashboard.md\n"
	@printf "  make daily      — review + sync + dashboard (the morning ritual)\n"
	@printf "  make dev        — start the graph-garden viewer at :4321\n"
	@printf "  make build      — build the static viewer\n"
	@printf "  make doctor     — verify awen + node are on PATH\n\n"
	@printf "AWEN_VAULT=$(VAULT)\n"

doctor:
	@command -v awen >/dev/null || { printf "✗ awen not found on PATH. Install with:\n  almide install github.com/O6lvl4/awen\n"; exit 1; }
	@command -v node >/dev/null || { printf "✗ node not found on PATH.\n"; exit 1; }
	@printf "✓ awen   $$(awen version)\n"
	@printf "✓ node   $$(node --version)\n"
	@printf "✓ vault  $(VAULT)\n"

review:
	@awen review

sync:
	@node scripts/awen-sync.mjs

dashboard:
	@node scripts/awen-dashboard.mjs

daily: review sync dashboard
	@printf "\nDone. Review the diff before committing.\n"
	@git -C $(CURDIR) status --short vault/

dev:
	@cd viewer && npm run dev

build:
	@cd viewer && npm run build

install-deps:
	@cd viewer && npm ci
