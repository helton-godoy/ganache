# ============================================================
# GANACHE Makefile
# ============================================================

# Original targets
ui:
	cd ui && npm install && npm run build

install:
	# Instalação do Backend (Stub)
	install -D -m 0755 target/release/ganache-api $(DESTDIR)/usr/sbin/ganache-api
	# Instalação do Frontend
	mkdir -p $(DESTDIR)/usr/share/ganache/www
	cp -r ui/dist/* $(DESTDIR)/usr/share/ganache/www/

# ============================================================
# Code Quality Toolkit
# @REF: Tech-Spec-Code-Standardization
# ============================================================

.PHONY: fmt fmt-check lint security check-all install-dev-tools

# Install all development tools (idempotent)
install-dev-tools:
	@./scripts/code-quality/install-dev-tools.sh

# Format all code (modifies files in-place)
fmt:
	@./scripts/code-quality/fmt.sh

# Check formatting without modifying (for CI)
fmt-check:
	@./scripts/code-quality/fmt-check.sh

# Run all linters
lint:
	@./scripts/code-quality/lint.sh

# Run security scanners
security:
	@./scripts/code-quality/security.sh

# Run all checks (fmt-check + lint + security)
check-all:
	@./scripts/code-quality/check-all.sh

# Validate semantic tags
validate-tags:
	@./scripts/code-quality/validate-tags.sh

# ============================================================
# Help
# ============================================================

.PHONY: help

help:
	@echo "GANACHE Makefile - Targets Disponíveis"
	@echo ""
	@echo "  Code Quality:"
	@echo "    make fmt             - Formata todo o código"
	@echo "    make fmt-check       - Verifica formatação (CI)"
	@echo "    make lint            - Executa linters"
	@echo "    make security        - Scan de segurança"
	@echo "    make check-all       - Executa tudo (fmt-check + lint + security)"
	@echo "    make validate-tags   - Valida semantic tags"
	@echo "    make install-dev-tools - Instala ferramentas de desenvolvimento"
	@echo ""
	@echo "  Build:"
	@echo "    make ui              - Build do frontend"
	@echo "    make install         - Instala backend e frontend"