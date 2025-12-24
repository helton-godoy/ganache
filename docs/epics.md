---
stepsCompleted: [1, 2]
inputDocuments: 
  - docs/analysis/prd.md
  - docs/architecture.md
  - docs/ux-design-specification.md
---

# GANACHE - Decomposição de Épicos

## Visão Geral

Este documento fornece a decomposição completa de épicos e histórias para o GANACHE, decompondo os requisitos do PRD, Design UX (se existir) e requisitos de Arquitetura em histórias implementáveis.

## Inventário de Requisitos

### Requisitos Funcionais

FR1: O usuário pode acionar o assistente de "Modo de Compatibilidade" para configurar automaticamente ZFS-over-DRBD em controladores PERC 6/i.
FR2: O sistema deve auto-ajustar o tamanho do ARC do ZFS com base na faixa de RAM detectada (16GB vs 32GB).
FR3: O usuário pode selecionar uma versão anterior do sistema Ganache no menu de inicialização do GRUB para reverter uma atualização com falha.
FR4: O sistema pode suportar a perda de energia de um único nó com tempo de failover <30s (RTO).
FR5: O sistema deve impor uma cota rígida de 90% no Pool ZFS para evitar o travamento de CoW.
FR6: O usuário pode criar/excluir Datasets ZFS para separação de compartilhamento de arquivos.
FR7: O sistema deve registrar cada alteração de configuração (Rede, Usuários, Compartilhamentos) como um commit do Git.
FR8: O administrador pode visualizar uma linha do tempo das alterações de configuração (Quem, Quando, O quê).
FR9: O administrador pode "Reverter" a configuração do sistema para qualquer commit anterior do Git através da interface do usuário (UI).
FR10: Usuários Auditores (com restrição de permissão) podem pesquisar/filtrar logs de acesso a arquivos via o "Visual Audit Manager".
FR11: O sistema deve registrar todas as execuções de comandos SSH com carimbos de data/hora e nomes de usuário ("Deep Bash Audit").
FR12: O administrador pode habilitar uma conta de administrador local "Break-Glass" para acesso de emergência durante falha do AD.
FR13: O usuário pode ingressar o appliance em um domínio do Active Directory via UI.
FR14: O sistema deve mapear grupos do AD para permissões de compartilhamento SMB implementando a lógica ACL NFSv4 do TrueNAS.

### Requisitos Não Funcionais

NFR1: (Taxa de Transferência SMB) O sistema deve saturar um link de rede 1GbE (110MB/s) para gravações sequenciais de arquivos grandes.
NFR2: (Tempo de Inicialização) O appliance deve inicializar de "Power On" até "Pronto" em < 3 minutos no hardware Dell 2950.
NFR3: (Limite de Recursos) Middleware + SO não devem exceder 4GB de uso de RAM.
NFR4: (Velocidade de Failover) O failover de Alta Disponibilidade deve ser concluído em < 30 segundos após a falha do nó primário.
NFR5: (Recuperação) Um estado degradado claro de "Split Brain" deve ser visível na UI se a interconexão do cluster falhar.
NFR6: (Integridade da Auditoria) Os logs de auditoria devem ser imutáveis (o usuário não pode editá-los via UI).
NFR7: (Sessão SSH) Todas as sessões SSH interativas devem exibir um banner "Este sistema é auditado" ao fazer login.
NFR8: (Clareza do Assistente) 100% das "Ações Destrutivas" devem exigir uma confirmação digitada ("CONFIRMAR").
NFR9: (Mensagens de Erro) Os erros devem fornecer uma explicação "Legível por Humanos" + um "Código Técnico".

### Requisitos Adicionais

Da Arquitetura:

- Inicializar o projeto usando o scaffold T3-Lite (Next.js, tRPC, Tailwind) via `npm create t3-app@latest`.
- Implementar modelo de segurança usando lista de permissões sudo em `/etc/sudoers.d/ganache`.
- Implementar sincronização de estado em tempo real via Short Polling (2-5s) usando React Query.
- Implementar fluxo de recuperação "Panic Mode" para failover de emergência.
- Estratégia de API: Usar tRPC + React Query para camada de API Type-Safe.
- Componentes a serem implementados em `src/components/features` (Smart) vs `src/components/ui` (Dumb).

Do Design UX:

- Implementar tema "Ganache SAFE" (Slate Blue/Emerald) com suporte a Modo Escuro.
- Implementar Componente Personalizado: Server Blade Card (com arrastar e soltar).
- Implementar Componente Personalizado: Twin-View Sync Ring (Visualizando saúde de DRBD/ZFS).
- Implementar Componente Personalizado: Zpool Topology Tree (Hierarquia Visual VDEV).
- Garantir conformidade WCAG AA (Acessibilidade).
- O Assistente de Configuração deve ser 100% navegável via teclado.
- Implementar visualização "Twin-View Topology" para configuração do cluster.

### Mapa de Cobertura de FR

FR1: Epic 1 - Assistente de Instalação Compatível
FR2: Epic 1 - Auto-Ajuste de RAM/ARC
FR3: Epic 1 - Rollback de Inicialização via GRUB
FR4: Epic 2 - Failover de Nó (<30s)
FR5: Epic 2 - Imposição de cota de 90%
FR6: Epic 2 - Gestão de Datasets ZFS
FR7: Epic 3 - Backend Git para Configuração
FR8: Epic 3 - Linha do Tempo de Auditoria
FR9: Epic 3 - Rollback via UI
FR10: Epic 5 - Visual Audit Manager
FR11: Epic 5 - Deep Bash Audit (SSH)
FR12: Epic 5 - Conta Break-Glass
FR13: Epic 4 - Ingressar no Active Directory
FR14: Epic 4 - Mapeamento de ACLs Winbind

## Lista de Épicos

### Épico 1: O Núcleo do Appliance Confiável

Permitir que os usuários transformem hardware legado em um cluster de "Modo de Compatibilidade" seguro com feedback visual claro e ajuste automático de hardware.
**FRs cobertos:** FR1, FR2, FR3

### Épico 2: Armazenamento HA Resiliente

Estabelecer uma camada de armazenamento robusta que garanta a sobrevivência dos dados durante falhas de hardware através de ZFS sobre DRBD e failover automatizado.
**FRs cobertos:** FR4, FR5, FR6

### Épico 3: Máquina do Tempo de Configuração

Eliminar a ansiedade de configuração tratando o estado do sistema como código versionado, fornecendo histórico completo e capacidades de rollback instantâneo.
**FRs cobertos:** FR7, FR8, FR9

### Épico 4: Integração Corporativa

Integrar perfeitamente com redes Windows existentes, garantindo autenticação correta e mapeamento de permissões sem fricção.
**FRs cobertos:** FR13, FR14

### Épico 5: Escudo de Conformidade

Fornecer rastreabilidade de nível HIPAA para todos os acessos e modificações do sistema, garantindo responsabilidade e integridade do acesso de emergência.
**FRs cobertos:** FR10, FR11, FR12

### Épico 6: Melhorias no Processo de Qualidade

Implementar melhorias técnicas e de processo identificadas na retrospectiva do Épico 5 para aumentar a eficiência do desenvolvimento e a qualidade do código.
**Melhorias:** Otimização de processos, robustez técnica, documentação

## Épico 1: O Núcleo do Appliance Confiável

Permitir que os usuários transformem hardware legado em um cluster de "Modo de Compatibilidade" seguro com feedback visual claro e ajuste automático de hardware.

### História 1.1: Detectar Hardware RAID e Recomendar Modo

Como um SysAdmin Júnior,
Eu quero que o sistema detecte se estou executando em qualquer Controlador RAID,
Para que eu seja guiado automaticamente para o "Modo de Compatibilidade" seguro sem precisar conhecer especificações de hardware.

**Critérios de Aceitação:**

**Dado** que o sistema está iniciando pela primeira vez
**Quando** a varredura de hardware detecta QUALQUER controlador RAID suportado (ex: PERC 6/i, H700, etc.)
**Então** a tela de boas-vindas do Assistente deve recomendar por padrão o "Modo de Compatibilidade"
**E** exibir um selo "Hardware Detectado: [Nome do Controlador]"
**E** mostrar uma dica (tooltip) explicando por que o Modo de Compatibilidade é recomendado (RAID detectado)

### História 1.2: Assistente de Configuração do Modo de Compatibilidade

Como um Administrador de Sistemas,
Eu quero uma explicação guiada da arquitetura do "Modo de Compatibilidade",
Para que eu entenda e confie na segurança do ZFS-over-DRBD antes de confirmar.

**Critérios de Aceitação:**

**Dado** que o usuário seleciona o "Modo de Compatibilidade"
**Quando** prosseguindo pelas etapas de configuração
**Então** a UI deve exibir "Dicas Educativas" explicando a arquitetura (RAID -> DRBD -> ZFS)
**E** exigir uma ação de "CONFIRMAR" digitada antes de criar o cluster
**E** visualizar os nós gêmeos se conectando em tempo real

### História 1.3: Auto-Ajuste de Recursos do Sistema

Como um Administrador de Sistemas,
Eu quero que o sistema ajuste automaticamente os limites do ZFS ARC com base na minha RAM instalada,
Para que o sistema permaneça estável sem ajuste manual de memória.

**Critérios de Aceitação:**

**Dado** o processo de inicialização do sistema
**Quando** a RAM é detectada
**Então** definir o Máximo de ZFS ARC para 50% da RAM Total se < 32GB
**E** definir o Máximo de ZFS ARC para 2GB a menos que a RAM Total se > 32GB
**E** garantir que pelo menos 4GB sejam reservados para o SO/Middleware

### História 1.4: Rollback do Ambiente de Inicialização

Como um Administrador de Sistemas,
Eu quero selecionar versões anteriores do sistema no menu de inicialização,
Para que eu possa me recuperar de uma atualização com falha imediatamente.

**Critérios de Aceitação:**

**Dado** uma atualização de sistema ou configuração com falha
**Quando** o servidor reinicia e o menu do GRUB aparece
**Então** eu devo ver uma lista de "Ambientes de Inicialização" (snapshots) anteriores
**E** selecionar um deve iniciar o sistema exatamente como estava naquele ponto
**E** a UI deve indicar "Iniciado a partir de [Nome do Snapshot]" após o login

## Épico 2: Armazenamento HA Resiliente

Estabelecer uma camada de armazenamento robusta que garanta a sobrevivência dos dados durante falhas de hardware através de ZFS sobre DRBD e failover automatizado.

### História 2.1: Inicialização do Cluster de Dois Nós

Como um Administrador de Sistemas,
Eu quero inicializar o link de replicação entre meus dois nós,
Para que eles comecem a se comportar como um único cluster de Alta Disponibilidade.

**Critérios de Aceitação:**

**Dado** dois nós provisionados com IPs estáticos
**Quando** eu inicio o processo de "Ingresso no Cluster"
**Então** o Sistema deve verificar a troca de chaves SSH
**E** configurar os recursos DRBD no disco secundário
**E** iniciar a sincronização inicial em nível de bloco

### História 2.2: Criação de Pool ZFS sobre DRBD

Como um Administrador de Sistemas,
Eu quero que o pool de armazenamento ZFS seja criado sobre o dispositivo replicado,
Para que todos os meus dados sejam automaticamente espelhados para o segundo nó.

**Critérios de Aceitação:**

**Dado** que o recurso DRBD está em estado 'UpToDate'
**Quando** o sistema inicia a "Formatação de Armazenamento"
**Então** ele deve executar `zpool create` direcionado a `/dev/drbdX` (NÃO ao disco bruto)
**E** habilitar compressão (lz4) por padrão
**E** verificar se o pool está visível apenas no nó Primário

### História 2.3: Imposição de Cota Rígida de 90%

Como um Administrador de Sistemas,
Eu quero que o sistema me impeça de preencher o disco acima de 90%,
Para que a lógica de Copy-on-Write do ZFS nunca falhe por falta de espaço (Espiral da Morte).

**Critérios de Aceitação:**

**Dado** que o pool ZFS está ativo
**Quando** o pool é criado ou redimensionado
**Então** o sistema deve aplicar automaticamente `refquota=90%` ao dataset raiz
**E** o painel da UI deve mostrar o espaço livre com base nesta cota, não na capacidade bruta do disco

### História 2.4: Gestão de Datasets

Como um Administrador de Armazenamento,
Eu quero criar, renomear e destruir datasets ZFS,
Para que eu possa organizar meus dados logicamente (ex: separando Departamentos ou Backups).

**Critérios de Aceitação:**

**Dado** um pool de armazenamento ativo
**Quando** eu crio um novo "Compartilhamento" na UI
**Então** o backend deve criar um dataset filho ZFS correspondente
**E** herdar propriedades padrão (compressão, acls) do pai

### História 2.5: Failover Automatizado (Lógica de Pânico)

Como um Proprietário de Negócio,
Eu quero que o sistema mude automaticamente para o nó de backup se o primário falhar,
Para que meus funcionários possam continuar trabalhando com o mínimo de interrupção (<30s).

**Critérios de Aceitação:**

**Dado** um estado de cluster saudável
**Quando** o nó Primário perde energia (Simulação de "Puxar o Cabo")
**Então** o nó Secundário deve detectar a perda em até 5 segundos
**E** promover-se a Primário
**E** importar o pool ZFS
**E** assumir o endereço IP Virtual
**E** o tempo de inatividade total deve ser inferior a 30 segundos

## Épico 3: Máquina do Tempo de Configuração

Eliminar a ansiedade de configuração tratando o estado do sistema como código versionado, fornecendo histórico completo e capacidades de rollback instantâneo.

### História 3.1: Motor de Configuração Baseado em Git

Como um Desenvolvedor/Administrador de Sistemas,
Eu quero que o sistema faça commit automático de cada alteração de configuração em um repositório Git local,
Para que eu tenha um histórico imutável de quem alterou o quê e quando, sem esforço manual.

**Critérios de Aceitação:**

**Dado** que o middleware do sistema está em execução
**Quando** qualquer arquivo de configuração em `/etc/ganache` ou entrada de banco de dados é modificado via UI/API
**Então** o sistema deve acionar uma operação de `git commit`
**E** incluir o nome de usuário autenticado e o carimbo de data/hora na mensagem do commit
**E** garantir que o repositório permaneça consistente mesmo se ocorrerem edições simultâneas

### História 3.2: UI da Linha do Tempo de Configuração

Como um Administrador de Sistemas,
Eu quero visualizar uma linha do tempo cronológica de todas as mudanças do sistema,
Para que eu possa auditar atividades recentes ou diagnosticar onde um problema começou.

**Critérios de Aceitação:**

**Dado** a página do painel de "Histórico"
**Quando** eu carrego a visualização
**Então** eu devo ver uma lista de commits com Data, Autor e um breve resumo
**E** clicar em um commit deve mostrar um "Diff" simples (comparação visual de mudanças)
**E** a visualização deve permitir filtrar por usuário ou intervalo de datas

### História 3.3: Rollback de Configuração em Um Clique

Como um Administrador de Sistemas,
Eu quero reverter a configuração do sistema para um ponto anterior no tempo,
Para que eu possa me recuperar instantaneamente de uma alteração de configuração que quebrou algo (ex: configuração de rede ruim).

**Critérios de Aceitação:**

**Dado** um commit selecionado na UI da Linha do Tempo
**Quando** eu clico no botão "Reverter para este Ponto" e confirmo
**Então** o sistema deve fazer o checkout desse estado específico de commit do git
**E** aplicar os arquivos de configuração ao sistema em tempo real
**E** reiniciar quaisquer serviços que foram afetados pelas mudanças
**E** criar um novo "Commit de Rollback" para documentar esta ação

## Épico 4: Integração Corporativa

Integrar perfeitamente com redes Windows existentes, garantindo autenticação correta e mapeamento de permissões sem fricção, usando camadas de Integração de Sistema de alto desempenho.

### História 4.1: Ingresso no Domínio Active Directory (Middleware Rust)

Como um SysAdmin,
Eu quero ingressar o appliance Ganache em um domínio Active Directory existente via UI,
Para que eu possa atribuir usuários e grupos existentes do AD a compartilhamentos SMB sem gestão manual de usuários.

**Critérios de Aceitação:**

**Dado** credenciais válidas de Controlador de Domínio e configurações de DNS
**Quando** eu envio o formulário "Ingressar no Domínio"
**Então** a Camada de Integração do Sistema deve executar a sequência de ingresso de forma segura
**E** atualizar a configuração do Samba (`smb.conf`) para o modo de segurança "ADS"
**E** refatorar/portar a lógica comprovada de Ingresso no Domínio do TrueNAS SCALE (Python) para Rust (Ganache Core)
**E** a lógica de cache deve ser implementada no backend tRPC eficiente para desempenho
**E** persistir o estado do serviço AD através de reinicializações

### História 4.2: Mapeador de ACL (Implementação Rust Core)

Como um SysAdmin,
Eu quero navegar pelos grupos do Active Directory ao configurar permissões de compartilhamento,
Para que eu possa restringir facilmente o acesso a departamentos específicos (ex: "Grupo-Financeiro").

**Critérios de Aceitação:**

**Dado** um domínio AD ingressado com sucesso
**Quando** eu configuro o "Gestor de ACL" de um Dataset
**Então** eu devo ver uma lista pesquisável de Usuários e Grupos do AD via uma API de backend
**E** a lógica de aplicação de ACL deve ser portatada do TrueNAS SCALE (Python) para Rust para garantir a correção
**E** as permissões aplicadas devem ser validadas contra a saída do `getfacl`
**E** listar "Administradores do Domínio" e outros grupos sem timeouts

### História 4.3: Gestão de ACL para Compartilhamentos

Como um Administrador de Sistemas,
Eu quero aplicar permissões compatíveis com Windows (ACLs) aos meus datasets,
Para que o controle de acesso funcione exatamente como um Windows Server nativo.

**Critérios de Aceitação:**

**Dado** um dataset compartilhado via SMB
**Quando** eu edito permissões na UI
**Então** o backend deve aplicar ACLs NFSv4/POSIX compatíveis com o Windows Explorer
**E** a lógica de aplicação de ACL deve ser portatada do TrueNAS SCALE (Python) para Rust para garantir a correção
**E** suportar aplicação recursiva de permissões de forma eficiente

## Épico 5: Escudo de Conformidade

Fornecer rastreabilidade de nível HIPAA para todos os acessos e modificações do sistema, garantindo responsabilidade e integridade do acesso de emergência.

### História 5.1: Auditoria Profunda de Logs SSH

Como um Oficial de Segurança,
Eu quero que o sistema registre cada comando executado no terminal (SSH/Console), não apenas eventos de login,
Para que eu possa realizar uma análise forense completa em caso de violação ou acidente.

**Critérios de Aceitação:**

**Dado** uma sessão SSH ativa por qualquer usuário
**Quando** um comando é executado (ex: `rm -rf`, `sudo vi`)
**Então** o sistema deve capturar o comando, argumentos, carimbo de data/hora e o ID do usuário real
**E** enviar esses dados para o log de auditoria do sistema à prova de adulteração
**E** capturar comandos mesmo se o usuário tentar burlar o registro (ex: dentro de scripts ou sub-shells)

### História 5.2: Gestor de Auditoria Visual (Visual Audit Manager)

Como um Auditor,
Eu quero um motor de busca para logs de acesso a arquivos para responder "Quem acessou o arquivo sensível X?",
Para que eu possa responder rapidamente a solicitações de conformidade sem usar grep em arquivos de texto.

**Critérios de Aceitação:**

**Dado** a página do painel de "Auditoria"
**Quando** eu pesquiso por um nome de arquivo (ex: "registros_pacientes.xls")
**Então** os resultados devem mostrar cada evento de Abrir/Ler/Gravar/Excluir para aquele arquivo
**E** exibir o Usuário, IP do Cliente e Carimbo de Data/Hora para cada evento
**E** permitir a exportação do relatório como PDF/CSV

### História 5.3: Administrador de Emergência Break-Glass

Como um CIO/Diretor de TI,
Eu quero uma conta de administrador local segura que fique normalmente desativada, mas possa ser ativada se o Active Directory estiver fora do ar,
Para que nunca fiquemos bloqueados de nosso próprio sistema de armazenamento durante um desastre.

**Critérios de Aceitação:**

**Dado** que o controlador do AD está inacessível
**Quando** um administrador aciona a ativação "Break-Glass" (console físico ou URL secreta específica)
**Então** o sistema deve habilitar a conta local `emergency_admin`
**E** forçar uma redefinição de senha no primeiro login
**E** enviar um alerta crítico de "Alta Prioridade" para todos os canais de notificação configurados (E-mail/SMS)
**E** registrar firmemente quem acionou a ativação

## Épico 6: Melhorias no Processo de Qualidade

Implementar melhorias técnicas e de processo identificadas na retrospectiva do Épico 5 para aumentar a eficiência do desenvolvimento e a qualidade do código.

### História 6.1: Otimizar o Processo de Revisão Adversarial

Como uma Equipe de Desenvolvimento,
Eu quero que o processo de revisão de código adversarial seja mais eficiente,
Para que possamos atingir alta qualidade com menos rodadas de revisão.

**Critérios de Aceitação:**

**Dado** uma alteração de código pronta para revisão
**Quando** o processo de revisão adversarial é executado
**Então** ele deve identificar problemas na primeira passagem de forma mais eficaz
**E** fornecer sugestões automatizadas para correções comuns
**E** reduzir o número médio de iterações de revisão por história

### História 6.2: Diretrizes para Integração de Histórias

Como uma Equipe de Desenvolvimento,
Eu quero diretrizes claras para integrar múltiplas histórias,
Para que evitemos sobreposição de funcionalidades e garantamos uma implementação coesa.

**Critérios de Aceitação:**

**Dado** múltiplas histórias em um épico que compartilham funcionalidades
**Quando** planejando a implementação
**Então** as diretrizes devem fornecer padrões para serviços compartilhados
**E** definir limites claros entre as responsabilidades de cada história
**E** incluir pontos de verificação de coordenação durante o desenvolvimento

### História 6.3: Melhorias na Robustez de Log Parsing

Como um Desenvolvedor Backend,
Eu quero robustez aprimorada nas funções de análise de logs (parsing),
Para que casos de borda sejam tratados graciosamente sem quebrar o sistema.

**Critérios de Aceitação:**

**Dado** dados de log malformados ou inesperados
**Quando** as funções de análise os processam
**Então** elas devem tratar erros graciosamente
**E** fornecer valores de fallback quando possível
**E** registrar falhas de análise para depuração sem travar o sistema

### História 6.4: Testes de Regressão SSR Automatizados

Como um Desenvolvedor Frontend,
Eu quero testes automatizados para evitar regressões de SSR,
Para que problemas de renderização no lado do servidor do Next.js sejam detectados precocemente.

**Critérios de Aceitação:**

**Dado** uma alteração no frontend que afeta o SSR
**Quando** os testes automatizados são executados
**Então** eles devem detectar falhas de SSR
**E** fornecer mensagens de erro claras sobre o que quebrou
**E** impedir a implantação de funcionalidades de SSR quebradas

### História 6.5: Guia de Solução de Problemas para Recursos de Auditoria

Como um Engenheiro de QA,
Eu quero um guia abrangente de solução de problemas para recursos de auditoria,
Para que eu possa diagnosticar e resolver rapidamente problemas relacionados à auditoria.

**Critérios de Aceitação:**

**Dado** um problema com o registro de auditoria ou monitoramento
**Quando** eu consulto o guia de solução de problemas
**Então** ele deve fornecer procedimentos de diagnóstico passo a passo
**E** incluir modos de falha comuns e soluções
**E** referenciar locais de código e logs relevantes

### História 6.6: Geração Automatizada de Documentação

Como uma Equipe de Desenvolvimento,
Eu quero um sistema de geração automatizada de documentação,
Para que possamos manter uma documentação consistente e atualizada com o mínimo esforço manual.

**Critérios de Aceitação:**

**Dado** alterações de código com comentários semânticos e anotações apropriadas
**Quando** o processo de geração de documentação é executado
**Então** ele deve extrair e formatar automaticamente a documentação a partir do código
**E** gerar documentação de API a partir de especificações OpenAPI
**E** criar documentação de componentes a partir de anotações de componentes React
**E** garantir que toda a documentação gerada siga os padrões de documentação semântica do projeto
**E** integrar-se com o pipeline de compilação de documentação existente
