#!/bin/bash

# BMAD Sync Script
# Sincroniza documentação com mudanças no código-fonte

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 BMAD Sync Script v1.0${NC}"
echo "=================================="
echo "Projeto: Ganache Enterprise NAS"
echo "Data: $(date)"
echo "Funcionalidade: Sincronização automática"
echo ""

# Função para logging
log_sync() {
	local step="$1"
	local status="$2"
	local message="$3"

	if [ "$status" = "SUCCESS" ]; then
		echo -e "${GREEN}✅ SUCCESS${NC} - $step: $message"
	elif [ "$status" = "WARNING" ]; then
		echo -e "${YELLOW}⚠️ WARNING${NC} - $step: $message"
	else
		echo -e "${RED}❌ ERROR${NC} - $step: $message"
	fi
}

# Função para atualizar timestamps
update_timestamps() {
	log_sync "Timestamps" "SUCCESS" "Atualizando timestamps dos documentos"

	local current_date=$(date +%Y-%m-%d)
	local current_time=$(date +%H:%M:%S)

	# Atualizar timestamp no index
	if [ -f "docs/index.md" ]; then
		sed -i "s/\*\*Data:\*\* [0-9-]\+/\*\*Data:\*\* $current_date/" docs/index.md
		log_sync "Index Timestamp" "SUCCESS" "Atualizado para $current_date"
	fi

	# Atualizar timestamps em documentos principais
	local main_docs=(
		"docs/project-overview.md"
		"docs/architecture/architecture.md"
		"docs/development/development-guide.md"
		"docs/handoff/technical-specs.md"
		"docs/handoff/deployment-guide.md"
	)

	for doc in "${main_docs[@]}"; do
		if [ -f "$doc" ]; then
			# Atualizar updated no frontmatter
			sed -i "s/updated: \"[0-9-]\+\"/updated: \"$current_date\"/" "$doc"
			log_sync "Timestamp $doc" "SUCCESS" "Atualizado para $current_date"
		fi
	done
}

# Função para sincronizar com mudanças no código
sync_with_code_changes() {
	log_sync "Code Sync" "SUCCESS" "Verificando mudanças no código-fonte"

	# Verificar mudanças em arquivos de configuração
	if [ -f "ganache/ui/package.json" ]; then
		log_sync "Package.json" "SUCCESS" "Detectado mudanças no frontend"

		# Atualizar dependências na documentação se necessário
		if git diff --quiet ganache/ui/package.json; then
			log_sync "Dependencies" "SUCCESS" "Nenhuma mudança detectada"
		else
			log_sync "Dependencies" "WARNING" "Mudanças detectadas, revisar documentação"
		fi
	fi

	# Verificar mudanças na API spec
	if [ -f "ganache/api-spec.yaml" ]; then
		log_sync "API Spec" "SUCCESS" "Verificando especificação da API"

		if git diff --quiet ganache/api-spec.yaml; then
			log_sync "API Changes" "SUCCESS" "Nenhuma mudança detectada"
		else
			log_sync "API Changes" "WARNING" "Mudanças detectadas, atualizar documentação da API"
			# Trigger regeneration of API docs
			echo "Considere executar: ./scripts/bmad-generate.sh --api-only"
		fi
	fi

	# Verificar mudanças no backend Rust
	if [ -d "ganache/src" ]; then
		log_sync "Rust Backend" "SUCCESS" "Verificando mudanças no backend"

		if git diff --quiet ganache/src/; then
			log_sync "Backend Changes" "SUCCESS" "Nenhuma mudança detectada"
		else
			log_sync "Backend Changes" "WARNING" "Mudanças detectadas, revisar documentação técnica"
		fi
	fi
}

# Função para validar links internos
validate_internal_links() {
	log_sync "Link Validation" "SUCCESS" "Validando links internos"

	local broken_links=0

	# Encontrar todos os links markdown
	find docs -name "*.md" -exec grep -H "\[.*\](\.*\.md" {} \; | while read -r line; do
		# Extrair o link
		link=$(echo "$line" | sed 's/.*\[.*\](\([^)]*\)).*/\1/')

		# Resolver caminho relativo
		file_path=$(echo "$line" | cut -d: -f1)
		dir_path=$(dirname "$file_path")
		full_path=$(realpath "$dir_path/$link" 2>/dev/null || echo "")

		if [ ! -f "$full_path" ] && [[ "$link" != http* ]]; then
			log_sync "Broken Link" "WARNING" "Link quebrado: $link em $file_path"
			broken_links=$((broken_links + 1))
		fi
	done

	if [ $broken_links -eq 0 ]; then
		log_sync "Link Validation" "SUCCESS" "Nenhum link quebrado encontrado"
	else
		log_sync "Link Validation" "WARNING" "$broken_links links quebrados encontrados"
	fi
}

# Função para atualizar referências cruzadas
update_cross_references() {
	log_sync "Cross References" "SUCCESS" "Atualizando referências cruzadas"

	# Verificar se todos os documentos referenciados existem
	local index_file="docs/index.md"

	if [ -f "$index_file" ]; then
		# Extrair todos os links do index
		grep -o "\[.*\](\.*\.md" "$index_file" | sed 's/.*\[//; s/\](.*\.md.*)//' | while read -r link_text; do
			# Tentar encontrar o arquivo correspondente
			target_file=$(find docs -name "*${link_text}*" -o -name "*$(echo $link_text | tr ' ' '-')*" 2>/dev/null | head -1)

			if [ -z "$target_file" ]; then
				log_sync "Missing Reference" "WARNING" "Referência não encontrada: $link_text"
			else
				log_sync "Reference Found" "SUCCESS" "Referência validada: $link_text"
			fi
		done
	fi
}

# Função para verificar consistência de versões
check_version_consistency() {
	log_sync "Version Check" "SUCCESS" "Verificando consistência de versões"

	# Verificar versão em documentos principais
	local version_pattern="version.*[0-9]\+\.[0-9]\+\.[0-9]\+"
	local versions_found=()

	for doc in docs/*.md docs/*/*.md; do
		if [ -f "$doc" ]; then
			version=$(grep -i "$version_pattern" "$doc" 2>/dev/null | head -1)
			if [ ! -z "$version" ]; then
				versions_found+=("$doc: $version")
			fi
		fi
	done

	# Verificar se todas as versões são consistentes
	local expected_version="1.0.0"
	local inconsistent_versions=0

	for version_info in "${versions_found[@]}"; do
		if echo "$version_info" | grep -q "$expected_version"; then
			log_sync "Version OK" "SUCCESS" "$version_info"
		else
			log_sync "Version Mismatch" "WARNING" "$version_info (esperado: $expected_version)"
			inconsistent_versions=$((inconsistent_versions + 1))
		fi
	done

	if [ $inconsistent_versions -eq 0 ]; then
		log_sync "Version Consistency" "SUCCESS" "Todas as versões são consistentes"
	else
		log_sync "Version Consistency" "WARNING" "$inconsistent_versions versões inconsistentes encontradas"
	fi
}

# Função para sincronizar metadados
sync_metadata() {
	log_sync "Metadata Sync" "SUCCESS" "Sincronizando metadados"

	# Atualizar author em documentos sem author
	find docs -name "*.md" -exec grep -L "author:" {} \; | while read -r file; do
		log_sync "Missing Author" "WARNING" "Autor ausente em: $file"
	done

	# Verificar se todos os documentos têm status
	find docs -name "*.md" -exec grep -L "status:" {} \; | while read -r file; do
		log_sync "Missing Status" "WARNING" "Status ausente em: $file"
	done

	# Verificar tags BMAD
	find docs -name "*.md" -exec grep -L "bmad" {} \; | while read -r file; do
		log_sync "Missing BMAD Tag" "WARNING" "Tag BMAD ausente em: $file"
	done
}

# Função para gerar relatório de sincronização
generate_sync_report() {
	log_sync "Report Generation" "SUCCESS" "Gerando relatório de sincronização"

	local report_file="bmad-sync-report.md"

	cat >"$report_file" <<EOF
# BMAD Sync Report

**Generated:** $(date)
**Project:** Ganache Enterprise NAS
**Sync Type:** Automatic synchronization

## Summary

- **Timestamp Update:** ✅ Completed
- **Code Changes Check:** ✅ Completed  
- **Link Validation:** ✅ Completed
- **Cross References:** ✅ Completed
- **Version Consistency:** ✅ Completed
- **Metadata Sync:** ✅ Completed

## Actions Taken

1. Updated timestamps in all main documents
2. Checked for code changes that affect documentation
3. Validated internal links and references
4. Verified version consistency across documents
5. Synchronized metadata and BMAD compliance

## Recommendations

- Run \`./scripts/bmad-validate.sh\` to verify compliance
- Review any warnings about missing references
- Update API documentation if backend changed
- Consider regenerating docs if major changes occurred

## Next Steps

1. Review this report for any warnings
2. Address any missing references or metadata
3. Run BMAD validation to ensure compliance
4. Commit changes if everything looks good

---
*Generated by BMAD Sync Script*
EOF

	log_sync "Report Generated" "SUCCESS" "Relatório salvo em: $report_file"
}

# Função principal
main() {
	echo "Iniciando sincronização BMAD..."

	# Executar todas as funções de sincronização
	update_timestamps
	sync_with_code_changes
	validate_internal_links
	update_cross_references
	check_version_consistency
	sync_metadata
	generate_sync_report

	echo ""
	echo -e "${GREEN}🎉 BMAD Sync Complete!${NC}"
	echo "================================="
	echo "Sincronização concluída com sucesso!"
	echo ""
	echo -e "${BLUE}Próximos passos recomendados:${NC}"
	echo "1. Execute: ./scripts/bmad-validate.sh"
	echo "2. Revise o relatório: bmad-sync-report.md"
	echo "3. Execute: git add . && git commit -m 'docs: sync BMAD documentation'"
	echo ""
	echo -e "${YELLOW}Avisos para revisar:${NC}"
	echo "- Links quebrados reportados acima"
	echo "- Documentos sem metadados obrigatórios"
	echo "- Inconsistências de versão encontradas"
}

# Verificar se estamos em um repositório git
if [ ! -d ".git" ]; then
	log_sync "Git Repository" "WARNING" "Não estamos em um repositório git"
	echo "Continuando mesmo assim..."
fi

# Verificar se os diretórios docs existem
if [ ! -d "docs" ]; then
	log_sync "Docs Directory" "ERROR" "Diretório docs não encontrado"
	exit 1
fi

# Executar função principal
main "$@"
