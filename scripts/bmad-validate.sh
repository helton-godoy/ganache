#!/bin/bash

# BMAD Universal Validation Script v4.1 (Guardian)
# Conformidade de Fluxo, Conteúdo, Paridade de Status e Orquestração

clear
set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Identificação Dinâmica do Projeto
PROJECT_NAME="Unknown"
if [ -f "project-context.md" ]; then
    PROJECT_NAME=$(grep -m 1 "# Project Context for AI Agents:" project-context.md | sed 's/.*: //')
    [ -z "$PROJECT_NAME" ] && PROJECT_NAME=$(grep -m 1 "project_name:" project-context.md | awk -F"'" '{print $2}')
fi
if [ "$PROJECT_NAME" == "Unknown" ] && [ -f "docs/analysis/prd.md" ]; then
    PROJECT_NAME=$(grep -i "project_name:" docs/analysis/prd.md | head -1 | awk -F"'" '{print $2}')
fi
[ -z "$PROJECT_NAME" ] && PROJECT_NAME="Ganache Appliance"

echo -e "${BLUE}🛡️  BMAD Diagnostic Validation Script v4.1${NC}"
echo -e "================================================================================"
echo -e "\n\nNOME DO PROJETO: ${YELLOW}\"${PROJECT_NAME}\"${NC}\n"


ERRORS=0
ERROR_LIST=()

# Função auxiliar para validar documento e seção
validate_item() {
    local phase="$1"
    local file="$2"
    local pattern="$3"
    local display_item="$4"
    local detail="$5"

    if [ ! -f "$file" ]; then
        echo -e "\n  ${RED}[✗] ${NC}Documento:${BLUE} '$(basename "$file   ")'${NC} AUSENTE${NC}"
        ERROR_LIST+=("Fase $phase: Arquivo $file não encontrado.")
        ERRORS=$((ERRORS + 1))
        return 1
    fi

    if grep -qi "$pattern" "$file"; then
        echo -e "\n  ${GREEN}[✓] ${NC}Documento:${BLUE} '$(basename "$file")'${NC} $display_item:${BLUE} '$detail'${NC}"
    else
        echo -e "\n  ${RED}[✗] ${NC}Documento:${BLUE} '$(basename "$file")'${NC} $display_item:${BLUE} '$detail'${NC} (AUSENTE)${NC}"
        ERROR_LIST+=("Fase $phase: Arquivo $(basename "$file") não contém a seção/conteúdo '$detail'.")
        ERRORS=$((ERRORS + 1))
    fi
}

# === 1. Concepção ===
echo -e "\n\n=== 1. Concepção ==============================================================="
PRD="docs/analysis/prd.md"
validate_item "1" "$PRD" "Executive Summary" "Seção" "Executive Summary"
validate_item "1" "$PRD" "Project Scoping" "Seção" "Project Scoping"

# === 2. Requisitos ===
echo -e "\n\n=== 2. Requisitos =============================================================="
validate_item "2" "$PRD" "Core Requirements" "Seção" "Core Requirements"
validate_item "2" "$PRD" "Functional Requirements" "Seção" "Functional Requirements"

# === 3. Arquitetura Global ===
echo -e "\n\n=== 3. Arquitetura Global ======================================================"
ARCH="docs/architecture.md"
validate_item "3" "$ARCH" "Backend" "Seção" "Detalhamento Backend"
validate_item "3" "$ARCH" "Frontend" "Seção" "Detalhamento Frontend"
validate_item "3" "$ARCH" "Estratégia de Integração" "Seção" "Estratégia de Integração"
validate_item "3" "$ARCH" "Modelo de Segurança" "Seção" "Modelo de Segurança"

# === 4. Epics & Stories ===
echo -e "\n\n=== 4. Epics & Stories ========================================================="
EPICS="docs/epics.md"
validate_item "4" "$EPICS" "Epic 1" "Seção" "Definição de Épicos"
validate_item "4" "$EPICS" "Acceptance Criteria" "Seção" "Critérios de Aceitação"

# === 5. Sprint Status & Orchestration ===
echo -e "\n\n=== 5. Sprint Status & Orchestration ==========================================="
SPRINT_STATUS="docs/sprint-artifacts/sprint-status.yaml"
if [ -f "$SPRINT_STATUS" ]; then
    LAST_UPDATE=$(grep -m 1 "generated:" "$SPRINT_STATUS" | awk -F': ' '{print $2}' | tr -d '"')
    echo -e "\n  ${GREEN}[✓] ${NC}Documento:${BLUE} 'sprint-status.yaml'${NC} Status:${BLUE} 'Atualizado em $LAST_UPDATE'${NC}"
else
    echo -e "\n  ${RED}[✗] ${NC}Documento:${BLUE} 'sprint-status.yaml'${NC} AUSENTE${NC}"
    ERROR_LIST+=("Fase 5: sprint-status.yaml não encontrado.")
    ERRORS=$((ERRORS + 1))
fi

WFLOW_STATUS="docs/bmm-workflow-status.yaml"
if [ -f "$WFLOW_STATUS" ]; then
    NEXT_STEP=$(grep -A 2 "next_steps:" "$WFLOW_STATUS" | grep "workflow:" | head -1 | awk '{print $NF}' | tr -d '"')
    REASON=$(grep -A 2 "next_steps:" "$WFLOW_STATUS" | grep "reason:" | head -1 | cut -d'"' -f2)
    echo -e "\n  ${GREEN}[✓] ${NC}Documento:${BLUE} 'bmm-workflow-status.yaml'${NC} Próximo Passo:${BLUE} '*$NEXT_STEP'${NC}"
    [ ! -z "$REASON" ] && echo -e "\n  ${BLUE}NOTA:${YELLOW} $REASON${NC}"
else
    echo -e "\n  ${RED}[✗] ${NC}Documento:${BLUE} 'bmm-workflow-status.yaml'${NC} AUSENTE${NC}"
    ERROR_LIST+=("Fase 5: bmm-workflow-status.yaml (Orquestração) não encontrado.")
    ERRORS=$((ERRORS + 1))
fi

# === 6. Contextos de História ===
echo -e "\n\n=== 6. Contextos de História ==================================================="
if [ -f "$SPRINT_STATUS" ]; then
    # Extrair IDs e Status do YAML (Suporta os dois formatos presentes no Ganache)
    # 1. Chave direta: "2-3-90-hard-quota-enforcement: ready-for-dev"
    # 2. Lista estruturada: "- id: \"2-1...\" \n status: \"done\""
    
    # Processar formato chave direta
    grep -E "^  [0-9]-[0-9].*:" "$SPRINT_STATUS" | while read -r line; do
        ID=$(echo "$line" | awk -F':' '{print $1}' | tr -d ' ')
        [[ "$ID" == "generated" || "$ID" == "id" || "$ID" == "status" ]] && continue
        
        YAML_STATUS=$(echo "$line" | awk -F': ' '{print $2}' | tr -d '" ')
        [ "$YAML_STATUS" == "backlog" ] && continue
        
        STORY_FILE=$(ls docs/sprint-artifacts/${ID}*.md 2>/dev/null | head -1)
        if [ -f "$STORY_FILE" ]; then
            FILE_STATUS=$(grep -i "Status:" "$STORY_FILE" | head -1 | sed -E 's/.*Status:[[:space:]]*//i' | tr -d '[:space:]#*')
            if [ "$YAML_STATUS" == "$FILE_STATUS" ]; then
                echo -e "\n  ${GREEN}[✓] ${NC}Documento:${BLUE} '$(basename "$STORY_FILE")'${NC} Status:${BLUE} '$YAML_STATUS'${NC}"
            else
                echo -e "\n  ${RED}[✗] ${NC}Documento:${BLUE} '$(basename "$STORY_FILE")'${NC} Status:${BLUE} '$YAML_STATUS'${NC} (DIVERGENTE: Doc=$FILE_STATUS)${NC}"
                ERROR_LIST+=("Fase 6: Story $ID divergiu. YAML=$YAML_STATUS, Doc=$FILE_STATUS.")
                ERRORS=$((ERRORS + 1))
            fi
        else
            echo -e "\n  ${RED}[✗] ${NC}Documento:${BLUE} 'Story $ID'${NC} AUSENTE${NC}"
            ERROR_LIST+=("Fase 6: Arquivo para Story $ID não encontrado.")
            ERRORS=$((ERRORS + 1))
        fi
    done

    # Processar formato lista id/status
    grep -E "id: \"[0-9]-[0-9].*\"" "$SPRINT_STATUS" | while read -r line; do
        ID=$(echo "$line" | awk -F'"' '{print $2}')
        YAML_STATUS=$(grep -A 5 "id: \"$ID\"" "$SPRINT_STATUS" | grep "status:" | head -1 | awk -F'"' '{print $2}')
        [ "$YAML_STATUS" == "backlog" ] && continue
        
        STORY_FILE=$(ls docs/sprint-artifacts/${ID}*.md 2>/dev/null | head -1)
        if [ -f "$STORY_FILE" ]; then
            FILE_STATUS=$(grep -i "Status:" "$STORY_FILE" | head -1 | sed -E 's/.*Status:[[:space:]]*//i' | tr -d '[:space:]#*')
            if [ "$YAML_STATUS" == "$FILE_STATUS" ]; then
                echo -e "\n  ${GREEN}[✓] ${NC}Documento:${BLUE} '$(basename "$STORY_FILE")'${NC} Status:${BLUE} '$YAML_STATUS'${NC}"
            else
                 # Evitar duplicados se já processado pelo loop acima (IDs são únicos)
                 if ! grep -q "Story $ID divergiu" <<< "${ERROR_LIST[*]}"; then
                    echo -e "\n  ${RED}[✗] ${NC}Documento:${BLUE} '$(basename "$STORY_FILE")'${NC} Status:${BLUE} '$YAML_STATUS'${NC} (DIVERGENTE)${NC}"
                    ERROR_LIST+=("Fase 6: Story $ID divergiu.")
                    ERRORS=$((ERRORS + 1))
                 fi
            fi
        fi
    done
fi

# === 7. Contexto do Projeto ===
echo -e "\n\n=== 7. Contexto do Projeto ====================================================="
CTX="project-context.md"
validate_item "7" "$CTX" "Documentation Methodology" "Seção" "Metodologia de Documentação"
validate_item "7" "$CTX" "Anti-Fragmentation Rules" "Seção" "Regras Anti-Fragmentação"

# === 8. Integration Guidelines ===
echo -e "\n\n=== 8. Integration Guidelines =================================================="
if [ -f "scripts/integration-validator.sh" ]; then
    if ./scripts/integration-validator.sh > /dev/null 2>&1; then
       echo -e "\n  ${GREEN}[✓] ${NC}Integration Validator:${BLUE} 'Passed'${NC}"
    else
       echo -e "\n  ${RED}[✗] ${NC}Integration Validator:${BLUE} 'Failed'${NC}"
       ERROR_LIST+=("Fase 8: Integration Guidelines validation failed.")
       ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "\n  ${BLUE}[i] ${NC}Integration Validator script not found (Optional)"
fi

# === 9. Documentation Coverage ===
echo -e "\n\n=== 9. Documentation Coverage =================================================="
DOC_ERRORS=0
# Rust
if [ -x "tests/docs/test_rust_doc_coverage.sh" ]; then
    if ./tests/docs/test_rust_doc_coverage.sh > /dev/null 2>&1; then
        echo -e "\n  ${GREEN}[✓] ${NC}Rust Documentation:${BLUE} 'Pass'${NC}"
    else
        echo -e "\n  ${RED}[✗] ${NC}Rust Documentation:${BLUE} 'Fail'${NC} (Check ./tests/docs/test_rust_doc_coverage.sh output)"
        ERROR_LIST+=("Fase 9: Rust documentation gaps found.")
        ERRORS=$((ERRORS + 1))
        DOC_ERRORS=$((DOC_ERRORS + 1))
    fi
fi

# React
if [ -x "tests/docs/test_react_doc_coverage.sh" ]; then
    if ./tests/docs/test_react_doc_coverage.sh > /dev/null 2>&1; then
        echo -e "\n  ${GREEN}[✓] ${NC}React Documentation:${BLUE} 'Pass'${NC}"
    else
        echo -e "\n  ${RED}[✗] ${NC}React Documentation:${BLUE} 'Fail'${NC} (Check ./tests/docs/test_react_doc_coverage.sh output)"
        ERROR_LIST+=("Fase 9: React documentation gaps found.")
        ERRORS=$((ERRORS + 1))
        DOC_ERRORS=$((DOC_ERRORS + 1))
    fi
fi

# Traceability
if [ -x "tests/docs/test_trace_coverage.sh" ]; then
    if ./tests/docs/test_trace_coverage.sh > /dev/null 2>&1; then
        echo -e "\n  ${GREEN}[✓] ${NC}Traceability Matrix:${BLUE} 'Pass'${NC}"
    else
        echo -e "\n  ${RED}[✗] ${NC}Traceability Matrix:${BLUE} 'Fail'${NC}"
        ERROR_LIST+=("Fase 9: Traceability matrix issue.")
        ERRORS=$((ERRORS + 1))
        DOC_ERRORS=$((DOC_ERRORS + 1))
    fi
fi

if [ $DOC_ERRORS -eq 0 ]; then
    echo -e "\n  ${GREEN}[✓] ${NC}All documentation coverage tests passed.${NC}"
fi


echo ""
echo -e "\n--------------------------------------------------------------------------------"
if [ $ERRORS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 VALIDATION SUCCESS! Todos os critérios BMAD 6 foram atendidos.${NC}\n\n"
    exit 0
else
    echo -e "\n${RED}💥 VALIDATION FAILED! Foram detectadas $ERRORS desconformidades.${NC}\n\n"
    for err in "${ERROR_LIST[@]}"; do
        echo -e "\n  - $err"
    done
    exit 1
fi
