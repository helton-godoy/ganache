# Exemplos de Treinamento para Revisão Adversarial

## Visão Geral

Este documento fornece exemplos práticos de problemas comuns encontrados durante revisões adversárias e suas correções recomendadas.

## Exemplos de Problemas e Correções

### 1. Tratamento de Erros em Rust

#### Problema: Uso de `.unwrap()`

```rust
// CÓDIGO PROBLEMÁTICO
fn read_file(path: &str) -> String {
    std::fs::read_to_string(path).unwrap()
}
```

#### Correção: Tratamento de Erros Adequado

```rust
// CÓDIGO CORRIGIDO
fn read_file(path: &str) -> Result<String, String> {
    std::fs::read_to_string(path)
        .map_err(|e| format!("Failed to read file: {}", e))
}
```

### 2. TODOs/FIXMEs Pendentes

#### Problema: Comentários Pendentes

```typescript
// CÓDIGO PROBLEMÁTICO
// TODO: implement validation
export function validateUser(user: User) {
    return true;
}
```

#### Correção: Implementação Completa

```typescript
// CÓDIGO CORRIGIDO
export function validateUser(user: User): boolean {
    if (!user.email || !user.email.includes('@')) {
        return false;
    }
    if (!user.password || user.password.length < 8) {
        return false;
    }
    return true;
}
```

### 3. Cobertura de Testes

#### Problema: Função sem Testes

```rust
// CÓDIGO PROBLEMÁTICO
pub fn calculate_quota(size: u64) -> u64 {
    size * 90 / 100
}
```

#### Correção: Função com Testes

```rust
// CÓDIGO CORRIGIDO
pub fn calculate_quota(size: u64) -> Result<u64, String> {
    if size == 0 {
        return Err("Size cannot be zero".to_string());
    }
    Ok(size * 90 / 100)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_quota() {
        assert_eq!(calculate_quota(100).unwrap(), 90);
    }

    #[test]
    fn test_calculate_quota_zero() {
        assert!(calculate_quota(0).is_err());
    }
}
```

### 4. Segurança: Hardcoded Secrets

#### Problema: API Key Hardcoded

```typescript
// CÓDIGO PROBLEMÁTICO
const API_KEY = "sk-1234567890abcdef";
export function callAPI() {
    fetch("https://api.example.com", {
        headers: { "Authorization": `Bearer ${API_KEY}` }
    });
}
```

#### Correção: Uso de Variáveis de Ambiente

```typescript
// CÓDIGO CORRIGIDO
const API_KEY = process.env.API_KEY || throw new Error('API_KEY not set');
export function callAPI() {
    fetch("https://api.example.com", {
        headers: { "Authorization": `Bearer ${API_KEY}` }
    });
}
```

### 5. Segurança: SQL Injection

#### Problema: String Concatenation em Queries

```typescript
// CÓDIGO PROBLEMÁTICO
function getUser(username: string) {
    const query = "SELECT * FROM users WHERE username = '" + username + "';";
    return db.execute(query);
}
```

#### Correção: Parameterized Queries

```typescript
// CÓDIGO CORRIGIDO
function getUser(username: string) {
    const query = "SELECT * FROM users WHERE username = ?;";
    return db.execute(query, [username]);
}
```

## Como Usar o Motor de Sugestões

### Exemplo de Uso

```bash
# Verificar um arquivo específico
./scripts/suggest-fixes.sh --check-all src/example.rs

# Verificar apenas tratamento de erros
./scripts/suggest-fixes.sh --check-error-handling src/example.rs

# Verificar apenas TODOs
./scripts/suggest-fixes.sh --check-todos src/example.ts
```

### Saída de Exemplo

```
=== Checking Error Handling ===
⚠ Found .unwrap() calls (potential panic risk)
  Line: 10:    let data = read_file(path).unwrap();

💡 Suggestion: Replace .unwrap() with proper error handling:
   // Instead of:
   let data = read_file(path).unwrap();

   // Use:
   let data = read_file(path).map_err(|e| format!("Failed to read: {}", e))?;

=== Checking for TODOs/FIXMEs ===
✓ No TODOs found

=== Checking Test Coverage ===
✓ Test module found in file

=== Checking Security Issues ===
✓ No obvious security issues found

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ All checks passed! Code looks good for review.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Integração com Git Hooks

### Exemplo de Uso com git-classify

```bash
# Executar validação completa antes do commit
./scripts/git-classify.sh --validate

# Saída de exemplo
=== Git Change Classification Report ===

[FEAT/FIX] 2 file(s)
  src/example.rs
  src/another.rs

Suggestion: git add <files> && git commit -m "feat: description..."

=== Running Code Integrity Validations ===

→ Checking Rust compilation...
✓ Rust code compiles

→ Checking for TODOs/FIXMEs...
✓ No TODOs found

→ Running automated suggestion engine...
💡 Suggestions available for: src/example.rs
   Run: ./scripts/suggest-fixes.sh --check-all src/example.rs

✓ All validations passed!
```

## Conclusão

Estes exemplos demonstram como identificar e corrigir problemas comuns encontrados durante revisões adversárias. Ao seguir estas práticas e usar as ferramentas automatizadas, a equipe pode reduzir significativamente o número de iterações de revisão e melhorar a qualidade do código.