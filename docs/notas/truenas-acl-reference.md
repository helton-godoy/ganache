# Referência TrueNAS SCALE: ACL, AD Integration & Winbind

**Data:** 2025-12-20  
**Objetivo:** Documentar aprendizados do TrueNAS SCALE para implementação robusta de ACLs NFSv4 e integração AD

---

## 📚 Repositórios-Chave do TrueNAS

### 1. TrueNAS Middleware (Principal)

**URL:** <https://github.com/truenas/middleware>  
**Linguagem:** Python  
**Descrição:** Repositório principal do middleware TrueNAS CORE/Enterprise/SCALE

**Componentes Relevantes:**

- Módulo de gerenciamento de ACLs NFSv4
- Integração com Active Directory via Winbind
- APIs para manipulação de ACLs
- Mapeamento de permissões Windows ↔ POSIX

### 2. nfs4xdr-acl-tools

**URL:** <https://github.com/truenas/nfs4xdr-acl-tools>  
**Linguagem:** C  
**Descrição:** CLI tools para gerenciar ACLs NFSv4.1 em formato XDR compatível com Samba

**Estrutura do Projeto:**

```
nfs4xdr-acl-tools/
├── libnfs4acl/          # Biblioteca core de ACL
├── nfs4xdr_getfacl/     # Utilitário de leitura
├── nfs4xdr_setfacl/     # Utilitário de escrita
├── nfs4xdr_torture/     # Suite de testes
├── nfs4xdr_winacl/      # Conversão Windows ACL
├── include/             # Headers
└── man/                 # Páginas de manual
```

---

## 🔑 Conceitos-Chave Validados

### Formato XDR para ACLs

- **XDR (External Data Representation):** Formato de serialização usado no TrueNAS
- **Armazenamento:** ACLs são guardadas em extended attributes (xattr) do ZFS
- **Compatibilidade:** Formato XDR garante interoperabilidade entre:
  - Samba (SMB/CIFS)
  - NFS v4.1
  - ZFS nativo
  - Ferramentas Linux

### Tools Oficiais

```bash
# Obter ACL (leitura)
nfs4xdr_getfacl /path/to/dataset

# Definir ACL (escrita)
nfs4xdr_setfacl -s "ace_spec" /path/to/dataset

# Formato ACE spec (compact):
# principal:permissions:inherit_flags:type
# Exemplo:
# owner@:rwxpDaARWcCos:-------:allow
```

---

## 🔗 Integração Active Directory (Winbind)

### Componentes Arquiteturais

**1. Samba + Winbind**

- **Samba 4:** Backend de integração AD
- **Winbind:** Daemon que traduz SIDs Windows ↔ UIDs/GIDs Unix
- **Kerberos:** Autenticação (sensível a tempo - max 5min de diferença)

**2. Comandos de Verificação**

```bash
# Listar usuários AD
wbinfo -u

# Listar grupos AD  
wbinfo -g

# Testar conectividade com DC
ping domain-controller.corp.local

# Verificar keytab Kerberos
klist -ke
```

### Pré-Requisitos Críticos (TrueNAS Best Practices)

| Requisito | Descrição | Impacto se Falhar |
|-----------|-----------|-------------------|
| **DNS correto** | Nameservers apontam para DCs AD | Join falha completamente |
| **NTP sincronizado** | Diferença < 5 minutos | Kerberos falha |
| **Hostname FQDN** | Hostname configurado corretamente | Join pode falhar |
| **Firewall** | Portas AD abertas (88, 389, 445, etc) | Timeouts |

### Configuração Samba (smb.conf)

```ini
[global]
   workgroup = WORKGROUP_NAME
   security = ADS
   realm = DOMAIN.LOCAL
   encrypt passwords = yes
   
   # ID Mapping (CRÍTICO)
   idmap config * : backend = tdb
   idmap config * : range = 10000-20000
   idmap config WORKGROUP : backend = rid
   idmap config WORKGROUP : range = 20001-30000
   
   # Winbind
   winbind use default domain = yes
   winbind enum users = yes    # ATENÇÃO: pode ser lento em ADs grandes
   winbind enum groups = yes   # ATENÇÃO: pode ser lento em ADs grandes
```

### Otimizações para ADs Grandes (>100k usuários)

```ini
# Desabilitar enumeração para evitar timeouts
winbind enum users = no
winbind enum groups = no

# Cache agressivo
winbind cache time = 300
```

---

## 🎯 Pesquisa LDAP (Best Practices do TrueNAS)

### Paginação LDAP

**OID Control:** 1.2.840.113556.1.4.319 (PagedResults Control - RFC 2696)

```bash
# Exemplo ldapsearch com paginação
ldapsearch -LLL \
  -E pr=1000/noprompt \          # Page size 1000, sem prompt
  -b "DC=corp,DC=local" \
  "(&(objectClass=user)(objectCategory=person))" \
  cn distinguishedName objectSid
```

**Recomendações:**

- Page size ideal: **1000** (balanceamento performance/memória)
- Usar `-LLL` para output LDIF limpo (sem comentários)
- Sempre incluir filtro de `objectCategory` além de `objectClass`

### Filtros LDAP Eficientes

```ldap
# Buscar apenas usuários
(&(objectClass=user)(objectCategory=person))

# Buscar apenas grupos
(objectClass=group)

# Buscar por substring (case-insensitive)
(&(objectClass=group)(cn=*Finance*))

# Combinação AND
(&(objectClass=user)(objectCategory=person)(cn=*John*))
```

---

## 🛠️ Implementação de ACLs NFSv4 (Referências TrueNAS)

### Estrutura de ACE (Access Control Entry)

```
Format: principal:permissions:inherit_flags:type

Campos:
┌─────────────┬──────────────┬───────────────┬──────┐
│  Principal  │ Permissions  │ Inherit Flags │ Type │
└─────────────┴──────────────┴───────────────┴──────┘
     14 chars       14 chars       7 chars     allow/deny
```

### Permissions (14 caracteres)

```
r w p x d D c C a A R W o s
│ │ │ │ │ │ │ │ │ │ │ │ │ └─ synchronize
│ │ │ │ │ │ │ │ │ │ │ │ └─── write_owner (chown)
│ │ │ │ │ │ │ │ │ │ │ └────── write_named_attrs (xattr)
│ │ │ │ │ │ │ │ │ │ └───────── read_named_attrs
│ │ │ │ │ │ │ │ │ └────────── write_attributes (timestamps)
│ │ │ │ │ │ │ │ └─────────────── read_attributes (stat)
│ │ │ │ │ │ │ └──────────────── write_acl (chmod)
│ │ │ │ │ │ └───────────────────── read_acl (ls)
│ │ │ │ │ └────────────────────── delete_child (rmdir files)
│ │ │ │ └─────────────────────────── delete
│ │ │ └──────────────────────────────── execute (or traverse dir)
│ │ └───────────────────────────────────── append_data
│ └────────────────────────────────────────── write_data
└───────────────────────────────────────────── read_data
```

### Inherit Flags (7 caracteres)

```
f d i n S F I
│ │ │ │ │ │ └─ inherited (marca que foi herdada)
│ │ │ │ │ └─── failed_access (audit CIFS)
│ │ │ │ └────── successful_access (audit CIFS)
│ │ │ └───────── no_propagate (apenas 1 nível)
│ │ └────────────── inherit_only (não aplica neste dir)
│ └─────────────────── dir_inherit
└────────────────────── file_inherit
```

### Principals Especiais

- `owner@` - Dono do arquivo/diretório
- `group@` - Grupo dono
- `everyone@` - Todos que não são owner/group
- `user:username` - Usuário específico (requer UID mapping)
- `group:groupname` - Grupo específico (requer GID mapping)

---

## ⚠️ Lições Aprendidas do TrueNAS

### Problemas Comuns e Soluções

| Problema | Causa Raiz | Solução TrueNAS |
|----------|-----------|-----------------|
| "Winbind daemon not available" | AD join falhou ou winbind parado | Rebuild directory service cache |
| Usuários/grupos não aparecem | Cache desatualizado | UI: Directory Services > Rebuild Cache |
| Timeouts em AD grande | Enumeração de 100k+ usuários | `winbind enum users/groups = no` |
| "Invalid tag" em setfacl | Sintaxe ACE incorreta | Usar UI ou validar formato rigorosamente |
| ACLs "desaparecem" após chmod | `aclmode=discard` (default) | `zfs set aclmode=passthrough` |

### ZFS ACL Properties (Tuning)

```bash
# Controla herança de ACLs
zfs set aclinherit=passthrough pool/dataset  # Recomendado
zfs set aclinherit=restricted pool/dataset   # Default (remove write_owner/write_acl)
zfs set aclinherit=discard pool/dataset      # Sem herança

# Interação ACL ↔ chmod
zfs set aclmode=passthrough pool/dataset     # chmod não afeta ACEs (RECOMENDADO)
zfs set aclmode=groupmask pool/dataset       # Default (ACEs limitadas ao group mask)
zfs set aclmode=discard pool/dataset         # chmod remove ACEs não-triviais
```

---

## 📋 Checklist de Implementação (TrueNAS-Inspired)

### Fase 1: Setup AD Integration

- [ ] Configurar DNS para apontar para DCs
- [ ] Sincronizar NTP (max 5min diferença)
- [ ] Configurar smb.conf com idmap correto
- [ ] Executar `net ads join -U Administrator`
- [ ] Verificar com `wbinfo -u` e `wbinfo -g`
- [ ] Testar `getent passwd` e `getent group`

### Fase 2: ACL Core Functions

- [ ] Wrapper para `nfs4xdr_getfacl`
- [ ] Parser de output ACL (compact + verbose)
- [ ] Wrapper para `nfs4xdr_setfacl`
- [ ] Validação de sintaxe ACE
- [ ] Conversão bidirecional (struct ↔ string)

### Fase 3: LDAP Search

- [ ] Implementar paginação (OID 1.2.840.113556.1.4.319)
- [ ] Parser de LDIF output
- [ ] Filtros por objectClass + objectCategory
- [ ] Substring matching case-insensitive
- [ ] Cache de resultados (opcional mas recomendado)

### Fase 4: API Endpoints

- [ ] `GET /api/v1/acl/search` - Pesquisa AD principals
- [ ] `GET /api/v1/acl/{path}` - Obter ACL
- [ ] `PUT /api/v1/acl/{path}` - Atualizar ACL
- [ ] Autenticação e autorização
- [ ] Rate limiting para LDAP queries

### Fase 5: Testing

- [ ] Testes unitários (parsers, conversões)
- [ ] Testes de integração (contra AD real)
- [ ] Testes E2E (fluxo completo UI → Backend → ZFS)
- [ ] Teste de performance (1000+ ACEs, AD com 100k users)
- [ ] Teste de edge cases (ACLs malformadas, AD timeout, etc)

---

## 🔍 Áreas para Estudo Detalhado no Código TrueNAS

### Módulos Prioritários (Python)

1. **filesystem/acl.py** - Lógica principal de ACL management
2. **directoryservice/activedirectory.py** - AD integration
3. **smb/**.py - Samba configuration
4. **idmap/** - UID/GID mapping logic
5. **kerberos.py** - Kerberos ticket management

### Buscar Por (GitHub Code Search)

```
# ACL Management
repo:truenas/middleware path:filesystem acl

# AD Integration
repo:truenas/middleware path:directoryservice activedirectory

# Winbind
repo:truenas/middleware path:smb winbind

# ID Mapping
repo:truenas/middleware idmap rid
```

---

## 📚 Documentação de Referência

### RFCs

- **RFC 7530:** NFSv4 Protocol
- **RFC 2696:** LDAP Control Extension for Simple Paged Results
- **RFC 4506:** XDR: External Data Representation Standard

### TrueNAS Docs

- [NFSv4 ACL Primer](https://www.truenas.com/docs/scale/scaletutorials/storage/datasets/permissionsscale/)
- [AD Integration Guide](https://www.truenas.com/docs/scale/scaletutorials/credentials/directoryservices/configadscale/)
- [API Documentation](https://www.truenas.com/docs/api/)

### Tools Man Pages

- `man nfs4xdr_getfacl`
- `man nfs4xdr_setfacl`
- `man wbinfo`
- `man net`

---

## ⚡ Próximos Passos para GANACHE

### Imediato (Story 4-2)

1. ✅ ~Modelos OpenAPI~ (Concluído)
2. ✅ ~AclService core~ (Concluído)
3. 🚧 **Estudar código TrueNAS** (Este documento)
4. ⏳ Implementar endpoints HTTP
5. ⏳ Testes de integração

### Melhorias Futuras (Inspiradas no TrueNAS)

- **Cache Winbind:** Implementar cache local para queries AD frequentes
- **Rebuild Cache API:** Endpoint para forçar atualização do cache
- **ACL Templates:** Templates pré-configurados (similar ao TrueNAS UI)
- **Validation Stricta:** Validar ACLs antes de aplicar (evitar "invalid tag")
- **Audit Logging:** Registrar todas as mudanças em ACLs
- **Bulk Operations:** Aplicar ACLs em múltiplos paths de uma vez

---

**Documento atualizado em:** 2025-12-20  
**Versão:** 1.0  
**Autor:** Dev Agent (GANACHE Project)  
**Referências:** TrueNAS SCALE, nfs4xdr-acl-tools, Samba4 docs
