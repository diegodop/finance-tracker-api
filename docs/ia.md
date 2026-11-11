# Uso de IA neste projeto

Ferramenta: Claude Code (Anthropic). Uso declarado conforme pedido pelo projeto — a IA sugeriu
alternativas, mas as decisões finais (escopo, stack, trade-offs) foram minhas.

## Prompts que tiveram impacto real na decisão

1. **"preciso fazer um projeto nesses moldes em até 2 dias: [link do enunciado] como podemos fazer?"**
   Impacto: levou à leitura do enunciado completo e à recomendação de ir de **Nível B** em vez de A,
   dado o prazo real de 2 dias — essa foi a decisão estrutural mais importante do projeto.

2. **"você acha bom esse escopo? suficiente pra usarmos tudo que pede lá nos slides para o Projeto B?
   qualquer coisa valide lá novamente"**
   Impacto: forçou uma segunda validação ponto-a-ponto do escopo contra a tabela de entregáveis do
   Nível B (M1–M4), o que revelou duas lacunas que o enunciado deixa em aberto — métrica/SLO concretos
   e o valor-alvo do p95 do k6 — que tiveram que ser fixados explicitamente (não vêm prontos do
   enunciado).

3. Pedido de ajuda para escolher o domínio ("controle financeiro, mas não sei se vai ficar acima do
   escopo"). Impacto: levou ao recorte do domínio para uma única entidade (`Transaction`) com um
   único fluxo (criar → listar → ver summary), evitando orçamentos, metas, multiusuário e recorrência
   — escopo que inflaria o projeto para além do que o Nível B exige.

## Onde a IA ajudou

- Leitura e extração estruturada do enunciado (prazos, tabela de entregáveis, critérios de nota).
- Sugestão de arquitetura (Repository Pattern + Prisma) e justificativa para o ADR.
- Geração do scaffold inicial do projeto (estrutura de pastas, configuração de TypeScript/ESLint/
  Vitest, rotas HTTP, testes unitários e de integração, workflow de CI, script de seed e smoke test
  k6) a partir do design já definido em conversa.

## Onde a decisão foi minha

- Escolha do domínio (controle de gastos pessoais) e do nível (B).
- Validação final de que o escopo cobre a rubrica antes de começar a codar.
- Revisão e execução de todos os comandos (Docker, migrations, testes, CI, push) antes da entrega.
