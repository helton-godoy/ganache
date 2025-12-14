#!/bin/bash

# BMAD Validation Script
# Valida conformidade total com padrões BMAD para projetos web+backend

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

echo -e "${BLUE}🔍 BMAD Validation Script v1.0${NC}"
echo "=================================="
echo "Projeto: Ganache Enterprise NAS"
echo "Data: $(date)"
echo "Compliance Target: Web + Backend"
echo ""

# Função para logging
log_check() {
	local check_name="$1"
	local status="$2"
	local message="$3"

	TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

	if [ "$status" = "PASS" ]; then
		echo -e "${GREEN}✅ PASS${NC} - $check_name: $message"
		PASSED_CHECKS=$((PASSED_CHECKS + 1))
	else
		echo -e "${RED}❌ FAIL${NC} - $check_name: $message"
		FAILED_CHECKS=$((FAILED_CHECKS + 1))
	fi
}

# Função para verificar se arquivo existe
check_file_exists() {
	local file_path="$1"
	local check_name="$2"

	if [ -f "$file_path" ]; then
		log_check "$check_name" "PASS" "Arquivo encontrado: $file_path"
	else
		log_check "$check_name" "FAIL" "Arquivo não encontrado: $file_path"
	fi
}

# Função para verificar diretório
check_directory_exists() {
	local dir_path="$1"
	local check_name="$2"

	if [ -d "$dir_path" ]; then
		log_check "$check_name" "PASS" "Diretório encontrado: $dir_path"
	else
		log_check "$check_name" "FAIL" "Diretório não encontrado: $dir_path"
	fi
}

# Função para validar meta-informações YAML
validate_yaml_frontmatter() {
	local file_path="$1"
	local check_name="$2"

	if [ ! -f "$file_path" ]; then
		log_check "$check_name" "FAIL" "Arquivo não encontrado: $file_path"
		return
	fi

	# Verificar se tem frontmatter YAML
	if head -n 1 "$file_path" | grep -q "^---$"; then
		log_check "$check_name" "PASS" "Frontmatter YAML presente"
	else
		log_check "$check_name" "FAIL" "Frontmatter YAML ausente"
	fi
}

# Função para verificar nomenclatura BMAD
validate_bmad_naming() {
	local file_path="$1"
	local check_name="$2"

	if [ ! -f "$file_path" ]; then
		log_check "$check_name" "FAIL" "Arquivo não encontrado: $file_path"
		return
	fi

	local filename=$(basename "$file_path")
	local dirname=$(dirname "$file_path")

	# Padrões BMAD válidos
	local bmad_patterns=(
		"project-overview-"
		"architecture-"
		"development-"
		"validation-"
		"handoff-"
		"api-"
		"deployment-"
		"setup-"
		"index\.md$"
	)

	local is_valid=false
	for pattern in "${bmad_patterns[@]}"; do
		if echo "$filename" | grep -qE "$pattern"; then
			is_valid=true
			break
		fi
	done

	if [ "$is_valid" = true ]; then
		log_check "$check_name" "PASS" "Nomenclatura BMAD válida: $filename"
	else
		log_check "$check_name" "FAIL" "Nomenclatura não BMAD: $filename"
	fi
}

echo -e "${YELLOW}📁 Validando Estrutura de Diretórios BMAD${NC}"
echo "============================================"

# Verificar estrutura BMAD obrigatória
check_directory_exists "docs" "Estrutura Base"
check_directory_exists "docs/architecture" "Architecture Directory"
check_directory_exists "docs/development" "Development Directory"
check_directory_exists "docs/validation" "Validation Directory"
check_directory_exists "docs/validation/reports" "Validation Reports Directory"
check_directory_exists "docs/handover" "Handover Directory"
check_directory_exists "docs/assets" "Assets Directory"
check_directory_exists "docs/assets/diagrams" "Diagrams Directory"
check_directory_exists "docs/assets/templates" "Templates Directory"
check_directory_exists "scripts" "Scripts Directory"

echo ""
echo -e "${YELLOW}📄 Validando Documentos Obrigatórios BMAD${NC}"
echo "==============================================="

# Verificar documentos obrigatórios
check_file_exists "docs/index.md" "Master Documentation Index"
check_file_exists "docs/project-overview.md" "Project Overview (BMAD Template)"
check_file_exists "docs/architecture/architecture.md" "Architecture Documentation"
check_file_exists "docs/architecture/source-tree-analysis.md" "Source Tree Analysis (BMAD Template)"
check_file_exists "docs/development/development-guide.md" "Development Guide"
check_file_exists "docs/development/setup-instructions.md" "Setup Instructions"
check_file_exists "docs/validation/reports" "Validation Reports Directory"
check_file_exists "docs/handover/technical-specs.md" "Technical Specifications"
check_file_exists "docs/handover/deployment-guide.md" "Deployment Guide"
check_file_exists "docs/handover/maintenance-manual.md" "Maintenance Manual"
check_file_exists "docs/handover/api-documentation.md" "API Documentation"

echo ""
echo -e "${YELLOW}🛠️ Validando Scripts de Automação BMAD${NC}"
echo "=========================================="

# Verificar scripts de automação
check_file_exists "scripts/bmad-validate.sh" "BMAD Validation Script"
check_file_exists "scripts/bmad-generate.sh" "BMAD Generation Script"
check_file_exists "scripts/bmad-sync.sh" "BMAD Sync Script"

echo ""
echo -e "${YELLOW}✅ Validando Meta-informações BMAD${NC}"
echo "======================================"

# Validar meta-informações nos documentos principais
validate_yaml_frontmatter "docs/index.md" "Index Meta-informations"
validate_yaml_frontmatter "docs/project-overview.md" "Project Overview Meta-informations"
validate_yaml_frontmatter "docs/architecture/architecture.md" "Architecture Meta-informations"

echo ""
echo -e "${YELLOW}🏷️ Validando Nomenclatura BMAD${NC}"
echo "================================="

# Validar nomenclatura BMAD para documentos principais
validate_bmad_naming "docs/index.md" "Index Naming"
validate_bmad_naming "docs/project-overview.md" "Project Overview Naming"
validate_bmad_naming "docs/architecture/architecture.md" "Architecture Naming"
validate_bmad_naming "docs/development/development-guide.md" "Development Guide Naming"
validate_bmad_naming "docs/handover/technical-specs.md" "Technical Specs Naming"

echo ""
echo -e "${YELLOW}🔍 Validando Templates BMAD${NC}"
echo "==============================="

# Verificar se templates BMAD oficiais existem
check_file_exists ".bmad/bmm/workflows/document-project/templates/project-overview-template.md" "BMAD Project Overview Template"
check_file_exists ".bmad/bmm/workflows/document-project/templates/deep-dive-template.md" "BMAD Deep Dive Template"
check_file_exists ".bmad/bmm/workflows/document-project/documentation-requirements.csv" "BMAD Requirements CSV"

echo ""
echo -e "${YELLOW}🔗 Validando Navegação Cruzada${NC}"
echo "================================"

# Verificar se links cruzados existem (básico)
if grep -q "\[.*\](.*\.md)" "docs/index.md"; then
	log_check "Cross References" "PASS" "Links cruzados detectados no index"
else
	log_check "Cross References" "FAIL" "Nenhum link cruzado detectado no index"
fi

echo ""
echo -e "${YELLOW}📊 Validação de Compliance Web + Backend${NC}"
echo "==========================================="

# Verificar patterns específicos para projetos web+backend
if grep -q "web" "docs/project-overview.md"; then
	log_check "Web Project Classification" "PASS" "Classificação web presente"
else
	log_check "Web Project Classification" "FAIL" "Classificação web ausente"
fi

if grep -q "backend" "docs/project-overview.md"; then
	log_check "Backend Project Classification" "PASS" "Classificação backend presente"
else
	log_check "Backend Project Classification" "FAIL" "Classificação backend ausente"
fi

if grep -q "OpenAPI" "docs/project-overview.md"; then
	log_check "API Specification" "PASS" "Especificação OpenAPI mencionada"
else
	log_check "API Specification" "FAIL" "Especificação OpenAPI não mencionada"
fi

echo ""
echo -e "${YELLOW}🚀 Validando CI/CD BMAD${NC}"
echo "=========================="

# Verificar workflows de CI/CD
check_directory_exists ".github/workflows" "GitHub Workflows Directory"
if [ -f ".github/workflows/docs-bmad.yml" ]; then
	log_check "BMAD CI/CD Workflow" "PASS" "Workflow BMAD encontrado"
else
	log_check "BMAD CI/CD Workflow" "FAIL" "Workflow BMAD não encontrado"
fi

echo ""
echo "==============================================="
echo -e "${BLUE}📈 RESUMO DA VALIDAÇÃO BMAD${NC}"
echo "==============================================="
echo "Total de Verificações: $TOTAL_CHECKS"
echo -e "✅ Aprovadas: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "❌ Reprovadas: ${RED}$FAILED_CHECKS${NC}"

# Calcular percentage
if [ $TOTAL_CHECKS -gt 0 ]; then
	PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
	echo "Taxa de Compliance: $PERCENTAGE%"
fi

echo ""

# Determinar status final
if [ $FAILED_CHECKS -eq 0 ]; then
	echo -e "${GREEN}🎉 BMAD COMPLIANCE: 100% TOTAL${NC}"
	echo -e "${GREEN}✅ Projeto totalmente conforme com padrões BMAD${NC}"
	exit 0
elif [ $PERCENTAGE -ge 80 ]; then
	echo -e "${YELLOW}⚠️ BMAD COMPLIANCE: $PERCENTAGE% PARCIAL${NC}"
	echo -e "${YELLOW}⚠️ Projeto parcialmente conforme, ações corretivas necessárias${NC}"
	exit 1
else
	echo -e "${RED}❌ BMAD COMPLIANCE: $PERCENTAGE% INSUFICIENTE${NC}"
	echo -e "${RED}❌ Projeto não conforme com padrões BMAD, reorganização necessária${NC}"
	exit 2
fi
