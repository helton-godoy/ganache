# Pacote Completo para Protótipo de Interface Visual de Alta Fidelidade - GANACHE

## 1. Requisitos Funcionais e Não Funcionais

### Requisitos Funcionais (FR)

- **FR1:** Wizard de instalação inteligente para configuração ZFS-over-DRBD
- **FR2:** Auto-tuning do ZFS ARC baseado na RAM detectada
- **FR5:** Aplicação de Quota Rígida de 90% para prevenir travamento CoW
- **FR7:** Registro de toda mudança de configuração via Git Commits

### Requisitos Não Funcionais (NFR)

- **NFR1:** Saturação de link 1GbE (110MB/s) em escritas sequenciais
- **NFR4:** Tempo de failover (RTO) inferior a 30 segundos
- **NFR6:** Logs de auditoria imutáveis

### Especificações Técnicas

- **Arquitetura:** ZFS sobre DRBD sobre Hardware RAID
- **API Pattern:** Type-Safe OpenAPI / REST (Next.js + Rust)
- **Backend:** Git-Driven Backend + Rust Daemon

## 2. Mapa de Jornada do Usuário

### Personas

- **Administrador de Sistemas Junior:** Necessita de orientação clara e segurança para evitar erros
- **Administrador de Sistemas Sênior:** Busca eficiência e controle detalhado sobre a configuração

### Cenários de Uso

1. **Configuração Inicial:** Usuário precisa configurar um cluster HA a partir de hardware legado
2. **Monitoramento Diário:** Verificação rápida do status do sistema
3. **Recuperação de Falhas:** Promoção de nó secundário em caso de falha

### Pontos de Dor

- Ansiedade com hardware legado
- Medo de perda de dados
- Complexidade na configuração de ZFS sobre DRBD

## 3. Arquitetura da Informação

### Sitemap

```yaml
- Dashboard
  - Visão Geral
  - Status do Cluster
  - Saúde do Sistema
- Configuração
  - Wizard de Setup
  - Gerenciamento de Discos
  - Configuração de Rede
- Monitoramento
  - Logs do Sistema
  - Métricas de Desempenho
  - Alertas de Segurança
- Administração
  - Gerenciamento de Usuários
  - Configurações Avançadas
```

### Taxonomia

- **Cluster:** Conjunto de nós primário e secundário
- **Pool:** Grupo de dispositivos de armazenamento ZFS
- **Dataset:** Subdivisão de um pool ZFS
- **DRBD:** Dispositivo de replicação de blocos distribuídos

### Hierarquia de Conteúdo

1. **Nível 1:** Dashboard (Visão geral do sistema)
2. **Nível 2:** Configuração (Setup e gerenciamento)
3. **Nível 3:** Monitoramento (Logs e métricas)
4. **Nível 4:** Administração (Usuários e configurações avançadas)

## 4. Guias de Estilo e Design System

### Paleta de Cores

- **Primária:** Slate Blue (#0F172A)
- **Sucesso:** Emerald (#10B981)
- **Aviso:** Amber (#F59E0B)
- **Erro:** Rose (#F43F5E)
- **Fundo:** Cool grays (slate-50 a slate-900)

### Tipografia

- **Headings:** Inter (Bold/Black)
- **Body/UI:** Inter (Regular/Medium)
- **Code/Logs:** JetBrains Mono

### Componentes UI

- **Server Blade Card:** Representação visual de um nó
- **Twin-View Sync Ring:** Visualização do status de replicação DRBD
- **Zpool Topology Tree:** Hierarquia visual do pool ZFS

### Padrões de Interação

- **Drag & Drop:** Para configuração de discos
- **Feedback Imediato:** Animações e mensagens de sucesso
- **Progressive Disclosure:** Informações detalhadas sob demanda

## 5. Wireframes e Mockups Existentes

### Wireframes Disponíveis

- **Setup Flow:** Fluxo de configuração do cluster
- **Dashboard Monitoring:** Painel de monitoramento
- **Mobile Recovery:** Interface de recuperação móvel

### Feedback Consolidado

- Necessidade de feedback visual mais claro durante a configuração
- Melhoria na hierarquia visual dos componentes
- Adição de dicas contextuais para ações críticas

## 6. Documentação Técnica

### APIs

- **Base URL:** `http://localhost:8080/api/v1`
- **Autenticação:** Bearer Token (JWT)
- **Endpoints Principais:**
  - `/system/hardware`: Informações de hardware
  - `/cluster/status`: Status do cluster
  - `/storage/pools`: Gerenciamento de pools ZFS
  - `/security/events`: Eventos de segurança

### Integrações

- **DRBD:** Replicação de blocos distribuídos
- **ZFS:** Gerenciamento de pools e datasets
- **Active Directory:** Integração com domínio
- **Git:** Controle de versão de configurações

### Limitações de Backend

- Tempo de resposta para operações de disco
- Limitações de hardware legado
- Necessidade de validação de configurações antes da aplicação

## 7. Benchmarking e Referências Visuais

### Exemplos de Interfaces Similares

- **TrueNAS Scale:** Gerenciamento de pools ZFS
- **Proxmox VE:** Visualização de recursos
- **Synology DSM:** Simplicidade e usabilidade

### Melhores Práticas

- **Linear Setup Wizard:** Configuração passo a passo
- **Health Rings:** Indicadores visuais de status
- **Contextual Help:** Dicas contextuais para ações complexas

## 8. Plano de Validação

### Critérios de Aceitação

- **Funcionalidade:** Todos os fluxos de usuário devem ser completados sem erros
- **Usabilidade:** Interface deve ser intuitiva e fácil de usar
- **Desempenho:** Tempo de resposta adequado para operações críticas

### Métricas de Usabilidade

- **Taxa de Sucesso:** Porcentagem de usuários que completam o fluxo de configuração
- **Tempo de Conclusão:** Tempo médio para completar a configuração do cluster
- **Taxa de Erro:** Número de erros cometidos durante a configuração

### Testes Planejados

- **Testes de Usabilidade:** Avaliação com usuários reais
- **Testes de Desempenho:** Verificação de tempo de resposta
- **Testes de Acessibilidade:** Garantia de conformidade com WCAG AA

## Conclusão

Este pacote completo fornece todas as informações necessárias para o desenvolvimento de um protótipo de interface visual de alta fidelidade para o projeto GANACHE. O protótipo deve focar na usabilidade, segurança e clareza visual, garantindo que os usuários possam configurar e monitorar o sistema de forma eficiente e segura.
