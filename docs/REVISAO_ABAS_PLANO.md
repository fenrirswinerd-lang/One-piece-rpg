# Revisão e compactação das abas (plano, nada mexido ainda)

Objetivo: menos repetição, mais prático, **mesma estética**, e fácil de acrescentar coisa nova.

## 1. O que o site tem hoje

**Mestre (27 abas):**
- **Ao vivo:** Mesa, Grupo, Combate, Mapa de combate
- **Preparar:** Fichas do mestre, Inimigos, Mundo, Arquivos, Ateliê de arte
- **Para a mesa:** Abas dos jogadores, Jornal, Tripulação, Recompensas, Diário de bordo
- **Lore e sessão:** Escudo de lore, Guia de lore, Diário da sessão, Onde acho o quê
- **Regras:** Pergunte ao livro, Colinha do mestre, Regras com página, Tabelas do Narrador, Catálogo
- **Mar e progresso:** Viagem, Barra de Bônus, Batalha naval
- (escondidas, abrem por botão dentro de outra aba: Regras, Encontro, Lojas, Navio, Procurados, Tesouro)
- Ajustes

**Jogador (12):** Mesa, Personagem, Combate, Mapa de combate, Diário de bordo, Jornal, Tripulação, Procurados, Guia de lore, Catálogo, Batalha naval, Pergunte ao livro.

## 2. Onde eu vejo repetição (para o Fable confirmar)

- **Regras em 5 lugares:** Pergunte ao livro, Colinha do mestre, Regras com página, Tabelas do Narrador, Catálogo. Provável fusão em **uma aba "Regras"** com busca (Pergunte ao livro) e as outras como seções.
- **Lore e sessão em 5 lugares:** Escudo de lore, Guia de lore, Diário da sessão, Diário de bordo, Onde acho o quê. Dá para ter **2**: "Lore" (consulta) e "Sessão" (diário, resumo, bordo).
- **Mar em 6 lugares:** Viagem, Batalha naval, Navio, Lojas, Tesouro, Tripulação/Recompensas. Dá para ter um **grupo "Navio e mar"** com Navio, Banco, Tripulação, Viagem e Batalha.
- **"Onde acho o quê"** existe porque o site cresceu e ninguém decora. Se as abas forem compactadas, ele encolhe ou some.
- Escudo e Colinha: o Fable confere o que **se repete** e o que é **único** de cada um.

## 3. O que melhorar além de compactar

- **Aba de lore dos jogadores** (Guia de lore): você disse que o resumo está fraco. O Fable lê o que os jogadores veem hoje, diz o que está fraco e propõe um formato mais claro (menos texto corrido, o que importa primeiro).
- **Resumo da sessão**: precisa de um lugar para escrever e guardar. Hoje há "Copiar resumo" no Diário. Falta decidir se basta, ou se vira um registro fixo por sessão que os jogadores também leem.
- **Resumo da sessão 1**: quando você mandar as anotações, o Claude escreve o texto. Sem inventar nada além do que você disse.
- **Adaptável:** tudo que entra novo no site entra por uma lista fácil (como `MAPA_ABAS` e `NAV`), para você acrescentar sem mexer em código espalhado.
- **Útil de verdade:** cada aba responde a "quando eu uso isso?" em uma linha. O que ninguém abre sai do menu.

## 4. Como fazer (ordem)

1. **Auditoria só leitura.** O Fable abre todas as abas, mede o que se repete e te entrega uma tabela: *aba · para que serve · repete com · proposta (manter, fundir, esconder)*.
2. **Você aprova** cada fusão.
3. **Só então** ele mexe, com testes (fumaça e macaco) e **log**.
4. **Nada de perder dado:** o que está salvo (diário, notas, recompensas) continua no lugar.

## 5. Perguntas para você
1. Posso **esconder** uma aba que repete outra (ela fica acessível por botão), em vez de apagar?
2. Os **jogadores** devem ver menos abas ainda (ex.: sem Catálogo)? Ou o contrário, mais?
3. O **Escudo e a Colinha** do mestre são úteis na sessão? Qual você realmente abre?
4. Quer que as fusões mantenham o **mesmo caminho** (link) das abas antigas para nada quebrar?
