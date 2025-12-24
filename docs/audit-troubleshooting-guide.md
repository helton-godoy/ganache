# Guia de Solução de Problemas para Recursos de Auditoria

## Introdução

Este guia fornece procedimentos de diagnóstico e solução para problemas relacionados aos recursos de auditoria do Ganache (Epic 5 - Compliance Shield). O público-alvo inclui Engenheiros de QA, Administradores de Sistema e Desenvolvedores.

O sistema de auditoria do Ganache agrega eventos de múltiplas fontes:

- **SSH/TTY**: Comandos executados no terminal (via `pam_tty_audit`).
- **Samba**: Acesso a arquivos (open, read, write, delete).
- **Git**: Alterações de configuração em `/etc/ganache`.
- **Autenticação**: Tentativas de login SSH e console.

> [!IMPORTANT]
> **Arquitetura de Cache Volátil:** O `ganache-core` mantém um cache de eventos **em memória** (últimas 24h) para alimentar a UI. Se o serviço for reiniciado, a Dashboard ficará vazia até novos eventos ocorrerem. Os dados históricos **persistem** no `systemd-journald` do sistema operacional.

## Diagnóstico

### Fluxo de Diagnóstico

1. **Problema na UI?** Verifique a API.
2. **Problema na API?** Verifique o serviço `ganache-core`.
3. **Problema no Serviço?** Verifique os logs brutos no `journald`.

### Ferramentas de Diagnóstico

#### 1. Verificação de Status do Serviço

Verifique se o backend está coletando eventos:

```bash
# Em produção:
systemctl status ganache-core

# Em desenvolvimento (se rodando via cargo):
ps aux | grep ganache-core
```

Acompanhe os logs do serviço em tempo real em busca de erros de parsing:

```bash
journalctl -u ganache-core -f
```

#### 2. Consulta de Logs Brutos (Source of Truth)

Se o evento não aparece na UI, verifique se ele foi gerado no sistema.

**Auditoria TTY (Comandos):**

```bash
# Verifique se o módulo audit está ativo
lsmod | grep audit

# Consulte logs de auditoria
journalctl _TRANSPORT=audit
```

**Auditoria Samba (Arquivos):**

```bash
journalctl -u smbd
```

**Auditoria SSH (Logins):**

```bash
journalctl -u ssh
```

#### 3. Teste da API

Consulte o endpoint de eventos diretamente para isolar problemas de Frontend:

```bash
# Dica: Instale 'jq' para formatar o JSON (apt install jq)
curl -s http://localhost:3000/api/v1/security/events | jq .
# Ou sem jq:
curl -s http://localhost:3000/api/v1/security/events
```

## Soluções Comuns

### 1. Logs desapareceram da Dashboard após restart

**Sintoma:** A lista de eventos em `/audit` está vazia após reiniciar o servidor ou o serviço.
**Causa:** O cache de eventos é em memória (`EVENT_CACHE` em `security_event_service.rs`) e não é persistido em disco pelo `ganache-core`.
**Solução:**

- Isso é o comportamento esperado (by design para performance).
- Para auditoria forense histórica, utilize o `journalctl` no terminal.
- Eventos novos começarão a aparecer automaticamente.

### 2. Comandos SSH não são registrados

**Sintoma:** Comandos digitados no terminal não geram eventos `SshCommand`.
**Causa Possível:** O módulo PAM não está configurado corretamente.
**Validação:**
Verifique `/etc/pam.d/common-session`:

```bash
grep "pam_tty_audit.so" /etc/pam.d/common-session
```

Deve retornar linha ativa (sem `#`).

**Solução:**
Habilite o módulo:

```bash
echo "session required pam_tty_audit.so disable=* enable=root,admin" >> /etc/pam.d/common-session
```

### 3. Erros de Parsing "Malformed Samba audit log"

**Sintoma:** Logs do `ganache-core` mostram warnings de parsing.
**Causa:** O formato do log do Samba mudou ou contém caracteres inesperados (ex: pipes `|` no nome do arquivo).
**Solução:**

- O parser espera 5 campos separados por pipe.
- Verifique a configuração `full_audit:prefix` no `smb.conf`. Deve ser `%u|%I|%m|%S`.
- Atualize o `ganache-core` para versão com parser robusto (Story 6.3/6.5).

### 4. Timestamp incorreto nos logs

**Sintoma:** Eventos aparecem com hora errada.
**Causa:** Divergência de Timezone ou falha no parsing do timestamp do audit log (fallback para `Now`).
**Solução:**

- Verifique `timedatectl`.
- Se o log contém `Using current time as fallback`, o formato do timestamp do journald pode ser incompatível com o parser atual. Reporte como bug para o time de Backend.

## FAQ - Perguntas Frequentes

**Q: Posso exportar logs de 30 dias atrás?**
R: Pela UI, apenas as últimas 24h (cache). Pelo terminal (`journalctl --since "30 days ago"`), você tem acesso a todo o histórico retido pelo sistema.

**Q: O sistema detecta acesso via SFTP?**
R: Sim, o Samba/CIFS é monitorado. SFTP (via SSH) gera logs de sessão, mas a transferência de arquivos específica depende do nível de log do subsistema sftp-server.

## Referências e Recursos

- **Story 5.1:** [Deep SSH Audit Logging](docs/sprint-artifacts/5-1-deep-ssh-audit-logging.md)
- **Story 5.2:** [Visual Audit Manager](docs/sprint-artifacts/5-2-visual-audit-manager.md)
- **Código Fonte:** `core/ganache-lib/src/system/security_event_service.rs`
- **Documentação Oficial:** `man journalctl`, `man pam_tty_audit`
