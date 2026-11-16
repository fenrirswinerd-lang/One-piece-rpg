# Mesa One Piece — plano (decisões do Fenrir, 31/10/2026)

Base: tudo que o Controle do Mestre (/home/claude/site) já faz continua (histórico de rolagens, combate, viagem, diário, etc.).
Hospedagem: Netlify + Firebase Spark (projeto mesa-one-piece). Config em firebase-config.js. Mestre = fenrirsw0@gmail.com. Regras em firestore.rules (já publicadas).
Arquivos (imagem, mp3, PDF) em pedaços no Firestore; medidor de espaço (1 GB), botão apagar.
Fonte: Jersey 20 (números/títulos), Silkscreen (rótulos), Beli Pixel (símbolo ฿ próprio). Já aplicado no Controle.
Regras: TODA regra conferida no livro, com página; colinha de regras com páginas na área do mestre.
Arte: pixel art estilo jogos 2D de One Piece (ref. ONE PIECE: Grand Gourmet). Projeto É de One Piece: usar elementos canônicos. Prompts em mesa/prompts/Prompts_da_Mesa.html (fixos x sob demanda). Itens sob demanda aparecem como silhueta preta trancada.

## Entrada
- Login Google -> escolhe Jogador ou Mestre (mestre só com o e-mail do mestre).
- Jogador escolhe estilo (troca depois), e o site explica o que muda:
  Timão (manual: só automatiza o muito complicado) · Log Pose (padrão: meio a meio) · Engrenagem (automático: tudo + avisos).

## Mesa (todos)
Dado central, painel de imagens (mestre mostra/esconde), trilha (todos) + efeitos (só mestre dispara), volume por jogador,
ilhas descobertas (ícone trocável, silhueta trancada, ilha atual), NPCs por ilha, relógio/clima (só mestre avança: +10min/+1h/+8h),
capitão atual em destaque, ondas animadas, Den Den Mushi toca quando o mestre libera algo.

## Aba do jogador (só dele)
Ficha por link + Atualizar, foto (da ficha ou upload), inventário funcional, diário pessoal com capa da profissão,
lore (escrever no site / anexar PDF: mostra títulos e o que mudou), opção de anexar quadro do Miro (lore/diário),
aba de profissão trancada até a ficha liberar (testes e custos), fundo por profissão.

## Mestre
Tudo do Controle + escudo com selos "não esquece disso", colinha de regras com página, XP no controle,
capitão (jogador ou NPC criado na hora; teste de Vontade no mar — confirmar regra no livro), inimigo e navio rápidos,
gerador de ideias (tabelas do GN), sessão + ícone, relógio, recompensa/caçadores (house rule marcada; LJ 13.5 p.300-301; Caminhos GN p.77),
liberar categorias, lista de jogadores, medidor de espaço, publicar notícias (jornal da News Coo).

## Categorias de todos
Combate (categoria própria, iniciativa etc.), diário de bordo público + resumo automático da sessão (dano, itens, recompensas, ilhas, XP),
Tripulação (trancada até o mestre liberar: nome, resumo, Jolly Roger, recompensa total, como o mundo vê o bando, o que sabem),
Jornal (notícias que chegam pela News Coo), NPCs + bestiário, Guia de lore/wiki (links por espécie do LJ cap. 2 e cultura).
Discord: convite + widget de quem está na call; rolagens no canal por webhook (opcional).

## Andamento (31/10, noite) — app em /home/claude/mesa/app
- Artes: art/process2.py → assets/ (manifest mesclado). Faltam do pacote: fundo prof. grupo 2 (carpinteiro, engenheiro, inventor, cientista → usa p_generico), anim gramofone/newscoo/ampulheta (usa ícone).
- Firebase SDK empacotado: /home/claude/mesa/fb/fb.js (esbuild). Build: `python3 build.py` → dist/site (Netlify) + dist/previa.html (Artifact, modo teste).
- Módulos novos: 31-dados (DB Firebase/Local + Arquivos em pedaços + IDB cache), 32-sessao (login/papel/estilo), 33-mesa (M, ouvintes, casca/nav), 34-sincronia (Controle ↔ segredos/controle, jogadores → party, vivo, combate público),
  60-mesa-tela (tela da mesa, dados, Som2, Avisos), 61-painel-mestre, 66-jogador, 68-mundo, 91-mestre-extra (arquivos, membros, Discord, recompensas/caçadores), 92-publico (bordo, jornal, tripulação, guia, combate jogador), 93-escudo (+ renome GN p.77).
- Cuidado: ordem dos módulos importa (ACT/VIEWS); sem listas dentro de listas no Firestore; nomes de ACT únicos (checar duplicados).
- Testes: scratchpad/m/t2.js (mestre + jogador em duas abas, ?teste). Tudo passando.
- Regras novas: /home/claude/mesa/firestore.rules (precisa republicar).
- Falta: gerador de ideias (GN), ficha rápida de navio, prompts sob demanda nos locais, testar música real, publicar.

## Polimento (01/11, madrugada)
- process3.py: anim newscoo/ampulheta/gramofone + fundo prof. grupo 2; tirado o quadro repetido no fim de bandeira, rei, lampiao, ondas, tentaculos.
- 95-polimento: fundo de cada página (CENAS), menu lateral do mestre (CSS ≥1100px), placas de título, loja com busca. Classe .medidor do Controle colidia → .arq-medidor.
- 62-mesa-extra: tabuleiro de ilhas (escondidas iguais, com cadeado; modal da ilha com NPCs; mestre cria/descobre/adiciona NPC ali), organizar painéis (☰), imagem em tela cheia (local e para todos), dado polido, ondas sincronizadas. Aba NPCs saiu do menu do jogador.
- 96-teste: jogadores prontos (Ana navegadora/Log Pose, Bia cozinheira/Engrenagem, Caio ferreiro/Timão, Duda carpinteira/Engrenagem), "Preencher com exemplos", "Abas dos jogadores" (mestre vê e corrige a aba de cada jogador), Beli animado, eventos do mar (11 animações), "Onde aparece cada animação" em Ajustes.

## Direcionamento do Fenrir (01/11, manhã) — o que ainda falta

Problemas apontados (e vistos nas imagens):
- Madeira em tudo na área do mestre: enjoativo. Precisa de variação de textura e fundo por categoria.
- Menu (mestre e jogador): nomes flutuando, sem fundo nem destaque. Precisa de aba/placa de verdade.
- Categorias por dentro (regras, escudo, mundo, arquivos): design pobre, texto sem contraste, muito vazio.
- Transbordo horizontal nas páginas do mestre (medidor e busca saem da tela).
- Dado: número fora do centro, escala errada, carta da sessão aparecendo por trás.
- Ondas: emenda visível entre os quadros; desconexo com a imagem mostrada.
- Animações do ChatGPT: último quadro igual ao primeiro = dois quadros parados.
- Imagem mostrada pequena fica desconexa: precisa preencher o quadro (carta aberta) ou tela cheia.
- Cartaz de procurados: a animação não casa com o cartaz montado em código. Tem que ser a mesma arte.
- Animação do Beli existe mas não se sabe onde aparece: falta guia de teste.

Decisões novas:
- Janelas da mesa movíveis e redimensionáveis (mestre e jogador), layout salvo por pessoa.
- Mundo + NPCs viram uma página dentro da mesa, com duas abas: Ilhas conhecidas / Pessoas conhecidas. Só entra o que o mestre adicionar (NPC especial, não ferreiro genérico de cada ilha).
- Ícone padrão de ilha bloqueada (silhueta escura + cadeado).
- Presets de ficha com profissão definida para o mestre abrir e conferir a tela.
- Guia de lore: fontes confiáveis em português, não só Fandom (deixado para o fim).
- Controle do mestre mais didático e otimizado.
- Foco: PC. O site substitui o Docs da ficha. É o nosso Foundry/Roll20 do OP RPG.
- Prompts auxiliares: prompts/Prompts_Auxiliares.html (texturas, peças de menu, fundos, cartaz base, ícones de ilha, animações, faixas sem emenda).

### Feito na leva 1 do polimento (01/11, 02h)
- Abas do menu com fundo, relevo e rótulo de grupo em placa (mestre e jogador).
- Madeira do topo e da barra lateral em 256px (antes 512px, parecia papel de parede).
- Seções das páginas viram painel translúcido (--painel), com título dentro e borda; a cena da categoria aparece por trás.
- Cabeçalho de seção alinhado: título à esquerda, botões juntos à direita (antes espalhados).
- Seção vazia vira moldura tracejada em vez de texto perdido.
- Imagem mostrada no quadro: fundo da cena escurecida em vez de barra preta, com moldura em volta.
- Conferido: NÃO havia transbordo horizontal (as imagens do Fenrir eram recortes). scrollWidth == clientWidth em todas as 20 páginas a 1080px.

## Decisões (01/11, tarde) — depois do plano de reforma
- Navio: ficha montada pelo mestre; entrega pronta; interruptor "jogadores podem mexer" que abre a loja de melhorias; histórico de quem mudou o quê.
- Loja por ilha: mestre monta (nome, ícone, ilha, categorias/itens que vende, preço alterado por item), liga/desliga na mesa, aparece também na aba do jogador; modelos salvos para reabrir quando voltarem.
- Som ambiente por cena: entra, desligado por padrão, com interruptor.
- Segunda tela: adiado. Atalhos de teclado: entra. Diário de bordo em PDF: entra. Mural de procurados: entra. Gerador de ideias do GN: entra, discreto, com página da tabela.
- Textos do mestre reescritos em português simples, sem perder detalhe, com a página do livro ao lado e o texto do livro recolhido. Por blocos, começando pelos mais usados.
- LORE MUDOU: a campanha começa durante a Guerra dos Maiorais, com o grupo em Mary Geoise. Se o bando do Chapéu de Palha existe está EM ABERTO (antes estava como "não existe").

### Leva 1 concluída (01/11, 14h) — art/process4.py
- 27 artes novas processadas. Saída: 12 texturas (tex2_*, 256px, costuradas sem emenda), 38 peças de ui (com 'fatia' de 9 pedaços no manifesto), 4 tiras, 12 cenas, 16 ícones de ilha, ilha_tranca, dado_parado, cartaz_base (janela transparente), 6 animações alinhadas.
- costurar(): rola pela metade e dissolve o corte com o espelho. Resolveu a emenda de todas as texturas e das 4 tiras.
- anim2(ancora=centro|base|topo|None): dado2 por centro (matou a tremida), selo por base (matou o escorregão), pergaminho por topo.
- Grupos novos no manifesto: tex, ui, tiras. build.py passou a incluí-los.
- CUIDADO: tex_pergaminho.webp antigo (usado por __TEX_PERGAMINHO__ no CSS) foi sobrescrito e restaurado do dist; as texturas novas usam prefixo tex2_.
- ui_divisores é 1 coluna x 4 linhas, não 2x2. Os divisores têm ornamento no meio, então NÃO usar border-image neles.
- Build: site 7,75 MB, prévia 9,5 MB. Prévia abre sem erro de JS.

### Leva 2 + parte da leva 3 (01/11, 14h30)
- Viga de madeira na barra do topo; título da sessão numa placa de madeira; relógio numa placa de pergaminho (ícone + hora + dia/período em linha), empurrado para a direita ao lado dos botões; botões numa bandeja escura com borda de latão. Tudo na mesma altura.
- Abas do menu: ui_aba / ui_aba_on / ui_aba_off por border-image, com plaquinha escura atrás do nome (a veia escura da tábua apagava o texto).
- Placa do título muda por área (madeira / metal / pergaminho / corda), via body[data-placa] definido em aplicarCena.
- 12 cenas novas (cat_*) ligadas às categorias em CENAS.
- Ondas: duas faixas rolando em velocidades diferentes (46s e 27s) + nuvens no alto (150s). Saiu a .ondas-fila.
- Dado: anim_dado2 (16 quadros) + dado_parado no fim. O número fica em left 52,1% / top 53,8%, medido por código no maior vão liso da arte, com contorno grosso. Estrela de crítico no 20 natural.
- CAPITÃO EM DOIS: capitaoOficial() = mesa/tripulacao.capitao (definido na Tripulação, dono do diário do capitão); capitaoAtual() = mesa/estado.capitao (provisório, quem está no leme); noComando() = provisório || oficial, usado no teste do mar.
- REGRAS DO FIREBASE MUDARAM: capitao() agora lê mesa/tripulacao. Precisa republicar regras_firestore.txt.
- Armadilha: o doc da tripulação é mesa/tripulacao, não mesa/trip (M.trip é só o nome em memória).

## Combinado de entrega (01/11)
Toda vez que eu mandar o zip ou a prévia, mandar junto um LOG DE TESTE: o que mudou, onde clicar para ver, o que é o certo, o que ainda NÃO está pronto (para não parecer falha) e o que depende de ação dele (republicar regras, etc.).

### Correções medidas (01/11, 15h)
- Medidor de dificuldade: com lim=[0,0,0,0] (sem jogadores) os 4 rótulos empilhavam no x=0. Agora some e mostra aviso; com valores, rótulos alternam em duas alturas e grudam nas pontas.
- Fatias de 9 pedaços MEDIDAS por código (maior trecho central liso por coluna/linha), guardadas no manifesto e injetadas como --ui-<n>-f / -w / -w55 / -f3 / -w3 / -w3h. Nada de número chutado no CSS.
- placa_papel tinha o selo de cera ocupando 145px da esquerda: por isso duplicava. As placas usam 3 pedaços só na horizontal (-f3), senão o selo repete na vertical.
- ui_aba_on recortada: o brilho virava uma faixa de raios repetidos em volta da aba selecionada. Agora 94x35, só a tábua dourada.
- cartaz_base medido: janela da foto em x13,95% y20,04% w72,09% h34,39%; faixa do nome y57,59% h5,49%; faixa do valor y72,36% h8,44%. Injetado como --cz-*.
- Cartaz pequeno (grupo/ficha) e cartaz grande (aviso) usam a MESMA arte, com a foto encaixada na janela e a animação de pregar (entra torto, bate, poeira).

### Jornal e Tesouro (01/11, 17h)
- jornal.png refeito com "ECONOMIA MUNDIAL" curvo na faixa. Medido: manchete x6,72% y22,08% w87,08% h8,66%; caixa da foto x7,49% y35,87% w85,79% h29,15%. Injetado como --jp-*.
- Notícia agora é a página desenhada: manchete na caixa, imagem na moldura, texto nas colunas, dia em cima do texto. Saiu o "ECONOMIA MUNDIAL · DIA X" escrito por cima (já está na arte).
- Imagem da notícia: escolher arquivo ou enviar na hora, três níveis de pixelação (já é pixel art / um pouco = 150px / bastante = 84px) feitos num canvas sem suavização, e botão de tirar só a imagem.
- Tesouro: botão "Mostrar na mesa e entregar" (só com a mesa aberta). Modal escolhe quem vê (caixas) e de quem é (select). Aviso tipo 'tesouro' só aparece para quem está em dados.verem. Quem recebe tem botão "Pegar e guardar na mochila": entra no inventário com log e a mesa vê "Guardado por Fulano".

### Jornal com layout, sons por aviso, mar e cartaz (01/11, 17h30)
- Colunas do jornal medidas: y 68,2% h 26,68%; três colunas em x 5,43% / 36,95% / 68,48%, ~27% de largura cada.
- jornal_papel.webp: retalho 64x64 de papel limpo, costurado, para o texto cobrir as linhas impressas (era o embolado que o Fenrir viu).
- Notícia tem layout: "imagem no meio" (texto em 3 colunas sobre o retalho) ou "imagem na coluna 1/2/3" (imagem colada sobre a coluna, texto em 2 colunas dentro da moldura do meio). Sem imagem: texto na moldura do meio.
- Som por aviso: mestre escolhe um sfx enviado para recompensa, jornal, tesouro, liberado, ilha, mar, texto e npc, em Painel do mestre › Efeitos. Som2.evento(nome, padrao) usa o escolhido ou o som sintetizado. Guardado em mesa/estado.sons.
- anim_cartaz (o cartaz desenrolando) voltou: é o ícone animado do cabeçalho de Recompensas.
- anim_pergaminho entrou: avisos de texto e de liberação abrem num pergaminho que desenrola, com o texto surgindo depois.
- Eventos do mar saíram do bloco de teste e viraram aba própria "No mar" no painel do mestre.

### Janelas, rolos empilhados e correções (01/11, 18h)
- CAUSA RAIZ dos rolos/cadeados repetidos: border-image-repeat 'round' também vale para as bordas esquerda e direita, que são verticais. Em caixa alta a ponta do pergaminho (e o cadeado da aba trancada) repetia 2-3 vezes. Corrigido com 'fill round stretch' (horizontal repete, vertical estica) em todas as 11 regras.
- .tela-trancada e .mundo-topo/.esc-topo saíram da placa: viraram carta simples / sem fundo. Placa só para título curto de uma linha.
- Jornal sem imagem: texto só na moldura do meio, sem o retalho invadindo as colunas.
- Capitão saiu da linha abaixo do título da sessão (já aparece em "No comando do navio").
- 63-janelas.js: no PC (>=1100px) cada painel da mesa vira janela com alça em cima e canto para esticar.
  O painel é EMBRULHADO num .jan (não recebe as alças dentro), senão o redesenho do painel apagava as alças.
  Posições medidas da grade na primeira vez; depois guardadas em mesa-mt-janelas (localStorage, por pessoa). "Voltar ao lugar de origem" no menu ☰.
  Altura padrão = max(grade, scrollHeight) para a janela não nascer cortada.

### Leitura das regras + janelas por pessoa (01/11, 18h30)
- Layout das janelas e painéis escondidos agora são por UID: mesa-mt-janelas-<uid> e mesa-mt-ocultos-<uid>. Antes, no teste, as abas dividiam o mesmo layout.
- 64-leitura.js: a Colinha ganha sumário fixo à esquerda, montado das seções .regra, com a página do livro e marcação da seção em que se está (IntersectionObserver).
- Escudo: a lista de seções virou coluna fixa à esquerda; cartas em coluna larga (440px) em vez de 360px.
- Separador de corda (ui_div_corda) entre as regras.
- #vista > div > h1:first-child virou :first-of-type, senão o sumário inserido antes do h1 tirava a placa do título.

### Topo 1:1, trava das janelas e guia de publicação (01/11, 19h)
- tira_viga reexportada com 64px de altura (720x64): a barra tem 64px e o navegador desenha 1:1. Antes era auto 100% sobre 48px = escala quebrada = borrado. Texturas voltaram para 256px (tamanho nativo).
- Botão ⇱ no canto do quadro e no menu ☰: trava/solta as janelas (esconde alças e canto). Guardado em mesa-mt-travado-<uid>.
- prompts/Como_Publicar.html: guia de Netlify + Firebase, com o que é cada arquivo, os 6 passos, os erros comuns e o aviso de que login e banco só ele pode testar.

### Combate limpo, barras e ícones (01/11, 19h30)
- Combate: tirada a corda (img 'corda') em volta do retrato. Token virou quadrado 60px com borda, foto inteira.
- Barras PV/PP/XP: moldura = ui_barra em 3 pedaços horizontais (com fatia de cima/baixo a borda comia a altura e o enchimento sumia). Enchimento pintado nas cores da arte; as artes coloridas (barra_pv/pp/xp) já vêm com pontas de latão, então não servem de enchimento.
- Ícones de atributo (ui_at_*) nos rótulos PV/PP da aba do jogador. .at-ic precisa de flex:none (o inline-flex esmagava para 1px) e .vt b largura automática.

## Bloco Opus 5.5 (máx) — fechamento
- Auditoria jogador + mestre por screenshot: título do Navio legível no tema claro, "Sem combate agora" sem placa, jornal centralizado, diário de bordo com nota do capitão oficial.
- Atalhos: 1–9 seguem as categorias VISÍVEIS do menu (respeita grupos dobrados e abas trancadas), M = Mesa, ? / H = lista de atalhos (botão também no menu do nome). D, N, Ctrl+Z, Esc continuam.
- Ícones de condição no combate e na tela da mesa ganharam title com o resumo (CONDI.r).
- Revisão do sistema e de usabilidade: prompts/Revisao_da_Mesa.html. Próximas propostas, em ordem: roteiro do mestre Antes/Durante/Depois; condição com um clique (texto completo + página); regras em blocos; mestre esconde categorias que não usa; backlog aprovado (PDF diário, mural, gerador de ideias, som ambiente); guia de lore por último.
- Deixado de fora de propósito: grade/movimento de token, névoa.

## Bloco seguinte (alto) — pedidos de 02/11
- Tesouro: sempre de UMA pessoa (tirei "do bando"). Bug real: o jogador gravava em mesa/estado (só mestre pode) → erro. Agora marca tesPego na própria ficha. Moeda/nota: botão Resgatar (vira Beli). Joia/arte: "Vender na loja" só com loja aberta. Valor calculado (metade < 11º nível quando a tabela marca).
- Texto solto sobre a cena: medido (Solto em 95-polimento) → faixa escura .solto.
- Título "Sessão N · Nome" do topo é botão para o mestre (ses-editar): nº, nome, ícone, "Começar a sessão N+1". Saiu da aba Comando.
- Painel do mestre: Música + Efeitos + Som dos avisos numa aba "Som" com subpartes.
- No mar: saíram bolhas e cardume como aviso; entraram bandeira, canhão, navio, bússola, gaivota. Cardume/bolhas/gaivota viraram enfeite animado no mar e céu da mesa.
- Ficha do jogador: aba Navegação (Log Pose), mar vem do mestre (mesa/estado.mar), dois botões (navegador / no leme sem navegador). Bug achado: MARES usa "Paradise (Grand Line)" e CD_MAR "Paradise" → CD caía para 15. marChave() resolve.
- Janelas: bug achado, painel tinha 20px cortados embaixo (height calc dupla). Agora janela cresce até caber o conteúdo (se não foi esticada à mão) e as de baixo descem sem sobrepor.
- Colinha do mestre (Consultar): como sobe de nível (marco, barra, etapa), como sobe recompensa (GN p.77 + LJ p.301 + dica da mesa marcada), rolagens rápidas (nomes, encontro no mar, tesouro).
- Pendente: tabelas de ideias do GN (precisa do PDF do GN), roteiro do mestre Antes/Durante/Depois, condição com um clique, banco do bando (futuro), dado 3D (futuro).

## Bloco GN (02/11, alto)
- PDF do GN 2.0 recebido. Página do PDF = página impressa (conferido no rodapé).
- 74-ideias.js: tabelas transcritas — Objetivos urbano/selvagem/outros (p.36), Vilões, Aliados, Introdução (p.37), Clímax (p.38), Dilemas e Reviravoltas (p.43), Missões secundárias (p.44), PdN: Aparência e Atributos (p.50), Dons, Maneirismos, Interação, Vínculos (p.51), Defeitos/Segredos (p.52). Pacotes: PdN completo, Aventura completa, Complicação; "Rolar uma tabela só"; Copiar.
- Roteiro da sessão (Antes/Durante/Depois) no topo da Colinha, marcas por sessão e por aparelho.
- Condição com um toque (cond-info): ficha do jogador, combate e mesa abrem o texto completo + PP + LJ p. 269–273.
- Outras tabelas do GN ainda não usadas (dá para entrar depois): Eventos que abalam o mundo (p.~22), Eventos Fechados d100 (p.~41), Encontros Aleatórios (p.48), Governo d100.

---
## Bloco para o Opus (7 nov): inventário com mochila, técnicas puxadas do livro, peso na compra, desempenho, cartaz com alcunha
Origem: conversa do Fenrir com o Sonnet (análise, sem código mexido). Tudo abaixo foi medido ou lido no código/livro.

### 1. Inventário com recipientes (66-jogador.js `inventario`, 72-lojas.js linha ~181, 20-sheet.js)
- Hoje: lista plana `inv.itens[{id,nome,qtd,peso,nota,ic,resgate,valor}]`. Mochila é item comum; o conteúdo vai como "nota". `pesoTotal` soma peso×qtd. A ficha só importa armas e dinheiro (`inv-importar`). A ficha do Google tem 14 linhas de item (PE!AC5:AM18, nome/Qt./Peso) que NÃO são lidas.
- Livro (LJ, Armazenamento e Transporte, ~linha 14546 do lj.txt): Mochila Pequena 30 kg de equipamento (1 kg, ฿10.000), Média 60 kg (1,5 kg, ฿15.000), Grande 100 kg (2,5 kg, ฿20.000), Baú 150 kg. Itens podem ser presos por fora (saco de dormir, corda). Carga total = 10 × FOR kg (LJ p.12). O livro NÃO tem regra de "espaços/slots"; os 14 espaços são layout da planilha da comunidade.
- Proposta: campo `dentro: idDoRecipiente|null` e `cap` no recipiente (detectar por nome: mochila/baú/bolsa, ou regex "cabe (30kg)"). Peso da mochila = peso próprio + conteúdo. Barra "usado/cap" no recipiente; passar da capacidade avisa (Engrenagem pode impedir, Log Pose avisa, Timão ignora). Botões "guardar em…" e "tirar para fora". Opção "preso por fora". Itens do kit da profissão entram já dentro da mochila inicial.
- Decisão a confirmar com o Fenrir: espaços (casa) ou só peso (livro). Recomendação: só peso, com contador opcional de itens soltos como regra da casa ligável nos Ajustes.
- Importar da ficha: ler AC5:AC18 (nome), AM (qtd), AN (peso), por linha; a linha de mochila vira recipiente; itens seguintes não entram nela sozinhos (perguntar uma vez).

### 2. Peso e quantidade na compra
- Catálogo da loja (72-lojas.js) só tem coluna de peso nas tabelas de armas (23 de 26 e 17 de 19 linhas têm peso). Kits, comida, navegação, exploração entram com 0 kg.
- O livro tem ~60 itens com "(Raridade) | X kg" (ex.: Kit Médico 2 kg, Primeiros Socorros 1 kg, Kit de Cozinha 6 kg, Mochila P 1 kg, Cantil 0,5 kg, Corda 3 kg). Extrair do lj.txt para uma tabela `PESOS_LIVRO` e casar por nome na compra. Compra pergunta quantidade e já grava `qtd` e `peso`. Item sem peso no livro entra com 0 e marca "peso a definir".

### 3. Técnicas: puxar do livro, não só da ficha
- A leitura da ficha (`cartoes()` em 20-sheet.js) já traz nome, grau, descrição, PP, duração, alcance, requisito e dano (testado com a ficha da Amy: Kiri Zutsumi, Zansetsu-Gama, Kiri Shigure leem certo). O campo "Ataque Combinado Possível/Impossível" NÃO existe na planilha; está nos livros (LJ tem 158 ocorrências, regra em ATAQUE COMBINADO, lj.txt ~linha 1808) e nos PDFs de frutas.
- Proposta: banco `TECNICAS_LIVRO` (estilos do LJ + estilos exclusivos 2.1 + frutas novas) com nome normalizado (sem acento/espaço), grau, PP, duração, alcance, requisito, dano, ataque combinado e descrição. Casar pelo nome da ficha; se não achar, mostrar o texto da ficha e a marca "não achei no livro".
- Cartão novo na aba Técnicas: faixa com grau + PP, linha de alcance/duração/dano, selo de Ataque Combinado, descrição recolhível. Modo automático já desconta PP no "Usar".

### 4. Desempenho (medido)
- Código comprimido: fb.js 127 KB, app.js 151 KB, dados.js 68 KB, css 27 KB (gzip) = ~373 KB. 221 imagens webp (6,7 MB no total, ~30 KB cada, carregadas sob demanda). Primeira visita é leve; o gargalo real é a leitura da ficha no Google: 41 pedidos (gviz) por ficha, 6 por vez, a cada 5 min para o mestre.
- Propostas por ordem de ganho: (a) guardar a última ficha lida no banco e mostrar na hora, atualizando por trás; (b) juntar os 41 blocos em uma faixa por aba (6 pedidos), testar com ficha real; (c) JS/CSS com `?v=hash` podem ser `immutable` no _headers (hoje `must-revalidate`); (d) carregar `dados.js` só quando abrir Consultar/Loja.

### 5. Cartaz com alcunha
- Cartaz (60-mesa-tela.js linha ~157; CSS `.cz-grande` com variáveis --cz-ny/nh, --cz-vy/vh) tem foto, nome e valor. Alcunha já é lida da ficha (`alcunha`, PE!N6). Precisa de nova arte `cartaz_base` com uma linha extra para a alcunha (entre foto e nome ou abaixo do nome) + variáveis --cz-ay/ah. Prompt de arte a escrever depois.
- Na aba Recompensas o cabeçalho tem o sprite de cartaz vazio sobreposto ao pergaminho (fica estranho); trocar por cartaz real do primeiro jogador ou tirar.

### 6. Material novo (PDFs de 7 nov)
- Frutas: Uo-Uo Seiryu, Wara-Wara, Yami-Yami, Pika-Pika, Zou-Zou Mammoth, Suke-Suke, Suna-Suna, Tama-Tama, Saru-Saru Sun Wukong (cada uma com tabela de técnicas por grau).
- Espécie "Oni" (arquivo) = texto de OGROS: PV base 18, Grande 3–6 m, 120–800 kg, desl. 9/nado 4,5; Sangue de Guerreiro; Fúria Sanguinária (turno com ≤1/3 PV: d6, 6 = fúria); treinamentos Corpo do Ogro (CON 15, dado de vida d12) e Arma Brutal (FOR 16).
- Estilos Exclusivos 2.1: Black Leg, Esgrimista, Herói (BANIDO pelo mestre: cria companheiro), Solfista, Usuário Ínsito (começa já ligado à Akuma no Mi; NÃO contar para a Amy).
- Marcar Herói como "banido" no catálogo (visível só ao mestre) para não aparecer como opção.
# Mesa One Piece — Roteiro de etapas (7 nov)
Regra geral: o site está CONGELADO até você dizer "pode começar o Bloco 1".

## Como cada bloco funciona (vale para todos)
1. Antes: baixar backup do site atual (zip + exportar a mesa pelo Ajustes) e anotar a versão publicada no Netlify (dá para voltar com 1 clique).
2. Durante: um bloco = uma ideia só, poucos arquivos, com o texto do pedido pronto neste arquivo.
3. Depois: teste automático + olhar a visão do jogador + log do que testar e o que ainda NÃO está pronto.
4. Só publica no Netlify depois que você abrir a prévia e aprovar.

## Modelos (resumo)
- Sonnet 5.5: textos, pesquisa, prompts, ajustes pequenos e seguros, arte/CSS simples.
- Opus 5.5: tudo que mexe em dados salvos, leitura da ficha, regras, Firebase. Um bloco Opus por sessão.
- Haiku: só tarefa mecânica (renomear, conferir lista). Quase não vale a pena.
- Esforço: "alto" só no Bloco 1 e 3. Resto: "médio". Textos e prompts: "baixo".

## ETAPA 0 — Sem código (Sonnet, esforço baixo/médio) — fazer já
0.1 Você decide: espaços da mochila (14 corpo; Pequena +6, Média +10, Grande +16, Baú +20), Diário do capitão privado, espécie da Amy (Mink / Oni / mestiça) e nome Oni x Ogro, nerf do Jones/Saru-Saru.
0.2 Testar o Sprite AI: bandeirinha (Prop → Animator). Se ficar boa, o método vale para as outras animações.
0.3 Eu escrevo o Guia de lore em português, com fontes, para você revisar.
0.4 Prompt do cartaz com alcunha + ideia do cabeçalho de Recompensas (arte, não código).
0.5 Eu atualizo o PLANO.md com tudo decidido.

## BLOCO 1 — Leitura da ficha (PRIORIDADE MÁXIMA) — Opus, esforço alto
Por quê: hoje a ficha lida pelo link do Google perde técnicas e traços. Pelo arquivo .xlsx funciona (testado com a Amy).
- Consertar a leitura pelo link (trocar os 41 pedidos picados por leitura mais robusta; precisa de teste no navegador real, não consigo testar o Google daqui).
- Tela de diagnóstico: mostrar o que foi lido e o que faltou.
- Remover o card fantasma "Ataque Combinado Possível".
- TECNICAS_LIVRO: completar descrição/grau/alcance/dano a partir do livro quando a ficha só tem nome e PP.
Fim: Amy e Tontatta aparecem completos pelo link E pelo arquivo.

## BLOCO 2 — Pequenos e seguros — Sonnet, esforço médio
- Herói banido (só o mestre libera).
- Bônus de CR com nome (ex.: "+2 Pequeno Gigante, só com mais da metade da vida").
- Aviso de subir de nível (o que ganha neste nível).
- Modo automático gasta PP corretamente (conferir).
- Limite de 6 pessoas (5 jogadores + mestre) avisado na entrada.

## BLOCO 3 — Inventário com mochila e peso — Opus, esforço alto
Mexe nos dados salvos dos jogadores. Precisa migrar o inventário antigo sem perder nada.
- Recipientes (mochila, baú), item "guardado em…", capacidade em kg e/ou espaços (você escolhe o modo).
- Compra na loja já vem com peso e quantidade (tabela PESOS_LIVRO, ~60 itens do LJ).
- Barra de carga (10 × FOR kg) e aviso de sobrecarga.
Fim: inventário antigo abre igual; itens novos têm peso.

## BLOCO 4 — Cartaz e Recompensas — Sonnet, esforço médio (+ arte)
- Alcunha (vulgo) no cartaz de procurado.
- Cabeçalho novo da aba Recompensas (quadro de madeira / pergaminho curto).
- Mural de procurados (entra aos poucos).
- Arte nova: Sprite AI e/ou geração de imagem; eu só encaixo no site.

## BLOCO 5 — Diário e lore — Opus (regras Firebase) + Sonnet (textos)
- Diário do capitão privado, com botão "publicar" para a mesa. Precisa republicar as regras do Firestore (eu te passo o passo a passo).
- Guia de lore: entra o texto aprovado na Etapa 0.3.
- Exportar o diário de bordo em PDF.

## BLOCO 6 — Conteúdo do Guia do Narrador — Sonnet, esforço médio
- Tabelas: eventos que abalam o mundo, eventos fechados d100, encontros aleatórios, governo d100.
- Catálogo de frutas já descobertas (+ as 9 frutas novas, Oni, estilos exclusivos).
- Opção do mestre de esconder categorias.

## BLOCO 7 — Regras reescritas em blocos — Opus, esforço máximo (só se sobrar crédito)
- Revisão geral das regras do site contra o Livro 2.1. É o maior risco de erro, então fica depois do resto estar estável.

## BLOCO 8 — Enfeites (último) — Sonnet / Opus
- Dado 3D (d20 primeiro; o 2D atual continua como reserva).
- Animação do marcador (se o teste do Sprite AI der certo) e outras.
- Som ambiente desligado por padrão.
- Segunda tela: adiado.

## O que eu acrescentaria (sugestões novas)
1. Backup e restaurar mesa (exportar/importar um arquivo). É o que protege você do medo de "fuder o site". Eu faria junto do Bloco 1.
2. Bestiário do Manual dos Inimigos: o mestre escolhe o inimigo e ele entra no combate com PV, CR, ataques e técnicas prontos.
3. Montador de encontro: soma o nível do grupo e sugere quantos inimigos usar.
4. Recompensa automática: o bando ganha recompensa (Berries do cartaz) conforme eventos marcados pelo mestre.
5. Ficha do navio e da tripulação: casco, canhões, comida, moral, com dado de evento no mar.
6. Haki e frutas: ficha rápida do que cada um treinou e quando pode subir.
7. Diário de sessão: resumo curto no fim de cada sessão ("na última vez…"), que aparece para todos ao entrar.
8. Rolagens salvas: atalho de rolagem para ataques de cada técnica (Usar já gasta PP e rola).
9. Banco do bando: dinheiro comum separado do pessoal.
10. Relação Docs x site: ficha continua no Docs; o site só lê. Evitar escrever de volta, é isso que mantém seguro.

## Ordem em uma linha
Etapa 0 → Bloco 1 → Bloco 2 → Bloco 3 → Bloco 4 → Bloco 5 → Bloco 6 → Bloco 7 (opcional) → Bloco 8.
Por que essa ordem: primeiro conserta o que está quebrado (leitura), depois o que é pequeno e seguro, depois o que mexe em dados, e por último o que é enfeite.

# ===== ETAPA 0 (7 nov) =====
# Etapa 0 — respostas e decisões (7 nov)

## 1. O site se adapta ao nível? (conferi no código)
Adapta sozinho, a partir do nível que vem da ficha do Docs:
- Dificuldade do encontro (fácil/médio/difícil/mortal): usa o nível de cada jogador (GN p. 45). O mestre pode forçar um nível manual só para o encontro.
- XP por dia que o grupo aguenta (GN p. 46).
- Tamanho da Barra de Bônus: muda a cada nível (LJ p. 13).
- Tesouro: o valor de moedas/joias é cortado pela metade quando o nível médio é menor que 11 e o baú está marcado como "metade".
- PV, CR, PP, ataque e CD de cada jogador: tudo recalculado da ficha.
- Atualização: a leitura automática do mestre roda a cada 5 minutos.

NÃO se adapta (e por quê):
- O nível em si não sobe sozinho. Quem sobe é o jogador, na ficha do Docs. A Barra cheia só mostra "pode subir".
- Mares: a CD é fixa por mar (East Blue 15 … Novo Mundo 24). Isso é de propósito: o mar define o perigo, não o nível do grupo.
- Lojas e preços não mudam por nível.
- Inimigos têm ND fixo; o site compara o ND com o grupo, mas não "escala" o inimigo.
- Ainda não existe o aviso "você subiu de nível, ganhou isto" (está no Bloco 2).
Ressalva: conferi quais partes usam o nível, mas não conferi cada número contra o livro nesta rodada (isso é o Bloco 7).

## 2. Bloco 2 revisado
- TIRADO: Herói banido (os jogadores já sabem).
- TIRADO: aviso do limite de 6 pessoas.
- FICA: aviso de subir de nível (mostra o que ganha naquele nível, tirado do livro).
- FICA: Bônus de CR com nome; conferir o gasto de PP no modo automático.

## 3. Jones e a Saru-Saru (Sun Wukong)
O que a fruta dá, por nível (do PDF):
| Nível do Jones | O que ele tem |
| 1–2 | Heavy Point (PV passam a vir da tabela: 42 no nv 1, 86 no nv 3, 103 no nv 4, 120 no nv 5) + aspectos inatos (pulo de 12 m, bastão Ruyi Jingu Bang 1d12 com alcance 6 m, vê longe) |
| 3–5 | + God Point: Worship, 3 vezes por dia transforma falha em sucesso (dele ou de um aliado) |
| 6–8 | + The Monkey King (3d6 em área de 6 m) e Jindouyun (voo) |
| 9–11 | + Boundless Strike (8d8 em linha de 27 m) |
| 12+ | + Immortal Point (+80 PV, volta com 1 PV) e 72 Bian |
Para comparar: a Amy no nível 3 tem 42 PV.

Conclusão: a fruta já é "travada por nível". Se o Jones ficar 1–2 níveis acima do grupo (nv 4–5), ele NÃO tem nenhuma técnica de grau 3 ou maior. O perigo real são 3 coisas: a vida alta do Heavy Point (120 PV no nv 5), o Worship (3x/dia) e o bastão com alcance 6 m.

Opções de nerf (você escolhe uma ou mais; nenhuma mexe na regra do livro, são regras da sua mesa):
1. Nível: grupo +1 nas primeiras aparições, no máximo grupo +2. Ao entrar no bando, ele iguala o nível do grupo.
2. Worship: 1x por dia (não 3) e só nele mesmo, até o fim do arco.
3. PV: como NPC, não precisa seguir a tabela inteira; limite fixo (ex.: 70–80 PV) até virar jogador-aliado.
4. Fraqueza de lore: ele ficou preso por anos. Começa com Exaustão 2 (o site já aplica −2 por nível em todo d20) e perde 1 nível a cada descanso longo com comida boa. Some sozinho e conta uma história.
5. Heavy Point só em forma híbrida/animal (já é a regra) e você decide que ele ainda "não domina" a forma até o fim de Casca Branca.
Minha sugestão: 1 + 2 + 4. É a mais fácil de explicar a mesa e não precisa de ficha especial.
Carpinteiro existe no Livro (p. 140), então a profissão combina com ele sem mudar nada.

## 4. Amy: Mink → Oni (Ogro)
Fatos do PDF "Espécie Oni 2.0" (o texto dentro chama a espécie de "Ogros"; o PDF não traz texto de lore, só regras):
- PV base 18 (Mink 12). Tamanho Grande, 3 a 6 m, 120 a 800 kg.
- Sangue de Guerreiro, Superioridade do Ogro (treinamento Guerreiro Nato), treinamento Corpo do Ogro (dado de vida sempre d12, exige CON 15).
- Dificuldade: Fúria Sanguinária (com 1/3 dos PV ou menos, d6; em 6 ele ataca a criatura mais próxima).
Troca pura = mais forte e quebra a lore dela: a Casa Oto é Mink, ela é "Mink raposa", a mesma raça de Zou. Perderia Electro, a forma Sulong e a cultura Mink. Além disso, Tamanho Grande e a Fúria não combinam com uma médica de campo que se preocupa com as consequências do combate.
Mestiça Mink + Ogro (regra do LJ p. 27): PV base = média das duas (12+18)/2 = 15; tamanho = média dos menores (1,3 e 3,0 → 2,15 m, Médio); escolhe 1 benefício de cada espécie (se escolher Electro precisa de 1 dificuldade extra); 1 dificuldade só; 1 treinamento de cada lista. É bem menos forte que a troca pura e cabe na lore (um ancestral Oni na família). Atenção: o Corpo do Ogro (d12) exige CON 15.
Minha sugestão: manter Mink. Se ela quiser mais força, mestiça com limite de 1 treinamento de Ogro, ou só um traço de aparência/lore (chifre pequeno, sem regra). Decidam juntos na sessão zero.
Nome: no LJ aparece "Ogro". "Oni" é o nome de Wano. Para o site eu usaria "Ogros (Oni)" no Guia, para ninguém se perder.

## 5. Fila do Bloco 1 (sem mexer agora)
Leitura do link, técnicas do livro, backup. O resto segue o ROTEIRO.md.

## Textos do Guia de lore (rascunho para revisão)
Ver GUIA_LORE_textos.md (arquivo separado, não colado aqui).

# ===== JONES (7 nov) =====
# Jones (Saru-Saru Sun Wukong) — plano em 3 fases
Lembrete do que o PDF dá por nível: 1–2 Heavy Point | 3–5 + God Point (Worship) | 6–8 + Monkey King e Jindouyun | 9–11 + Boundless Strike | 12+ + Immortal Point e 72 Bian.
Grupo começa no nível 3.

## Fase 1 — Mary Geoise (fuga): bufado, momentos épicos
- Nível: 5 (grupo +2). Tem Heavy Point (120 PV pela tabela) e God Point (Worship 3x/dia, pode dar o sucesso a um aliado).
- Para o momento épico: UM golpe de "último fôlego" do Boundless Strike (8d8 em linha de 27 m, grau 4) só nesta fuga. É uma exceção de roteiro, não vira regra.
- Não resolve tudo: um Pacifista continua sendo problema, como você quer.

## Fase 2 — Casca Branca: acompanha o grupo, +2 níveis, balanceado
- Nível: grupo +2 (ex.: grupo 4 → Jones 6; grupo 5 → Jones 7). Atenção: no nível 6 ele ganha Monkey King (3d6 em área) e Jindouyun (voo). Se isso for demais, trave em grupo +1 até o fim do arco.
- Ele é NPC aliado, quem decide a ação é você. Uma regra simples: ele só age quando você precisa de um empurrão, e some do combate quando o grupo está bem (cair, ser carregado, ficar "cuidando do navio").
- Dials de balanço (escolha 2 ou 3):
  1. Worship 1x por dia e só nele mesmo.
  2. PV fixo de NPC (ex.: 70–80), sem usar a tabela inteira do Heavy Point.
  3. Exaustão 1 ou 2 por conta dos anos presos; some com descanso e comida.
  4. Ruyi Jingu Bang só com "ação bônus" (já é a regra) e alcance reduzido para 3 m enquanto ele estiver ferido.
  5. Ele não recebe Pontos de Poder cheios; os PP dele ficam baixos, então não spamma técnica.
- Inimigos de Casca Branca: para PV alto não virar problema, misture:
  - 1 inimigo forte que dá dano em área ou joga condição (Salvaguarda), para o PV não resolver;
  - vários capangas para dividir a atenção;
  - alvos que fogem ou atacam à distância/voam;
  - um objetivo (proteger algo, impedir uma fuga), para ele não só "bater e aguentar";
  - Kairoseki ou Haki de Armamento de um vilão, para ele sentir a ameaça.
- No site: ponha o Jones como NPC, fora da Mesa. Se ele entrar como jogador da mesa, o cálculo de dificuldade passa a contá-lo no nível do grupo; use "nível manual" para ele não estragar as contas.

## Fase 3 — Depois de Casca Branca (na tripulação): nerf para o RPG normal
- Nível: igual ao do grupo, nunca acima. Como as técnicas são travadas por nível, isso já corta tudo que ele ainda não deveria ter.
- Explicação de lore para o nerf (escolha uma): a forma Heavy Point já não responde como antes; ou o preço dos anos presos aparece de vez; ou ele perde algo em Casca Branca.
- Papel na mesa: carpinteiro do navio, apoio e história, não o "tanque". Worship 1x por dia, só nele.
- Se um dia você quiser reverter, é só subir de nível; nada foi apagado da ficha.

## O que eu preciso de você
Só uma decisão: o nerf da Fase 3 vai ser explicado dentro da história (lore) ou só em regra? Isso muda o texto do arco, não o site.

# ===== Ajustes de 7 nov (tarde) =====
- Jones: fica só 1 nível acima do grupo até entrar de fato na tripulação (decisão do Fenrir). Mary Geoise bufado "por conta do mestre". Depois entra na ficha no Docs.
- Amy: provavelmente será Ogro (confirmar mestiça x pura na sessão zero).
- NOVO no Bloco 2 (Encontro): marcar QUEM participa de cada encontro. Hoje o Encontro conta TODOS os jogadores com ficha (nível médio e divisão de XP). Precisa: caixa "participa" por pessoa e marca "NPC aliado" (como o Jones), que não entra no XP nem na média, a menos que participe. Arquivos: 55-inimigos.js (niveisGrupo, enc-vitoria), 40-mesa.js (adicionar jogador como NPC).
- Guia de lore: tudo que o Livro não tem vem da Wiki de One Piece (buscar item por item; só abre páginas que aparecem numa busca).
- PROMPT_chat_de_lore.md: texto para o Fenrir colar no chat de lore (mecânicas do site). Atualizar quando surgir recurso novo.

# ===== BLOCO 1 FEITO (7 nov, Opus) =====
Causa achada: o Google (gviz) PULA as linhas totalmente vazias dentro da faixa pedida. O site contava a linha pela posição, então tudo depois de uma linha vazia subia (grau virava "2 PP", PP sumia, o "Ataque Combinado" virava cartão fantasma, traços e antecedente vinham vazios). Reproduzido no teste com a versão antiga.
Conserto (20-sheet.js): gviz() devolve as linhas cruas; lerFaixa() só confia na posição quando veio tudo ou nada; cartões O14:BF57 são decodificados pelos rótulos do modelo (Nome:, grau, PP, Duração, Requisito); listas: 1 pedido confere se o resto está vazio; se houver vazio no meio, divide a faixa. blocks.json: listas separadas (B13:B17, B21:B34, poderes da fruta em 4, T em 5, antecedente em 3 células). 41 → ~51–64 pedidos.
Extra: cartão com nome "Ataque Combinado…" é ignorado; Ajustes mostra "O que veio da ficha" (contagem por parte + nº de pedidos); backup em arquivo (Baixar / Abrir arquivo de backup) em Ajustes; texto "3 minutos" corrigido para 5.
Testado: Amy, Tontatta e Lucco_3 com Google simulado (pula linhas; letras relativas e reais; sem pular) → link = arquivo, 0 diferenças. Visão do jogador (link pelo Personagem) ok. 31 abas sem erro.
NÃO feito de propósito: TECNICAS_LIVRO. As fichas reais já têm os cartões completos; com a leitura certa, não precisa. Fica no backlog se alguma ficha vier sem descrição.
Visto e não mexido: jogador de teste com PV 42/36 (vida antiga maior que o máximo da ficha nova; o site não corta a vida atual quando a ficha muda). Avaliar no Bloco 2.
Backup do código antes do bloco: /home/claude/mesa/backups/antes_bloco1_20261107_1422

# ===== BLOCO 2 FEITO (7 nov, Sonnet) =====
- Encontro: caixa "participa" por pessoa (Quem está neste encontro). NPC aliado (marca em Grupo › Editar) fica fora do nível médio, do XP, da Barra de Bônus, da Colinha e do resumo do Grupo; só entra no encontro se marcado (e nunca recebe XP da Barra). "Levar para a luta" só põe quem participa. Funções: pcsMesa(s), participaEnc(s,p) em 20-sheet.js.
- CR: bônus com nome (ligar/desligar/tirar) na janela "CR ±" (live.crNom; calc soma crNomTotal). Passa por cima da ficha só no site.
- PV: vida atual não passa do máximo (ao ler ficha nova e no cabeçalho do jogador).
- PP no automático: conferido; achado e corrigido: técnica Auxiliar sem PP no lado do jogador podia usar "Sobrecarga" de graça (grau 0). Agora bloqueia (Sobrecarga é só para Técnicas de Combate, LJ p. 36–37).
- Aviso de subir de nível: quando a ficha lida tem nível maior, toast + faixa no cartão do Grupo + janela "o que ganha" (+Dado de Vida, atributos nos níveis 4/8/12/16/20, Bônus de Proficiência da ficha, 3 PT nos níveis pares até 10, remete ao Estilo no cap. 3). NÃO lê as características do estilo por nível (não está em dados do site).
- Texto "3 minutos" corrigido para 5 (Bloco 1).
Backup antes: /home/claude/mesa/backups/antes_bloco2_20261107_1437

## BLOCO 3 FEITO (7 nov, Opus)
Parte A, Fichas do mestre (aba "Fichas do mestre", em Preparar):
- PDM = registro em s.party com pdm:true; noGrupo (aparece no Grupo como aliado), vilao (aparece no Encontro, XP pelo ND escolhido), nota (só mestre).
- Mesma ficha 2.0 (link/.xlsx), relê junto (Sync.todos). Luta como inimigo (c.inimigo: jogadores só veem o estado) ou aliado.
- Helpers: naMesa(p), grupoDe(s), pcsMesa exclui pdm, participaEnc respeita naMesa. monPorId('pdm:id') → monDePdm.
- Tirado o "Jones" fixo dos textos. Nada depende de Amy/Tontatta.
- Dado de vida: vem da ficha (AM34:AQ36); se faltar, DV_ESTILO (LJ cap. 3). Aviso de nível usa isso.
Parte B, Inventário (67-inventario.js):
- Ficha: lê as 14 linhas AC5:AN18 (sheet.itens). blocks.json ganhou AC5:AN18.
- Recipientes LJ p. 245 (Mochila P/M/G 30/60/100, Algibeira 3, Saco 10, Cesto 20, Baú 150). Pesos de Algibeira/Saco/Cesto sugeridos.
- Item.em = id do recipiente | 'navio' | null. Navio não pesa. Conteúdo pesa em quem carrega.
- Carga: Max da ficha; acima = arrastar 1,5 m (até 20×FOR); Variação Sobrecarga 3×/6× FOR só como aviso.
- PESO_LJ: ~75 itens (LJ p. 246–251); peso vazio usa o livro; loja usa o livro quando a tabela não tem kg.
- "Trazer da ficha": 14 linhas + armas + dinheiro, guarda na 1ª mochila se couber. Mestre vê inventário da ficha e do site na ficha completa.
Backup: backups/antes_bloco3_20261107_1455

## Ajuste 8 nov: mochila abre e fecha
- Recipiente com coisas dentro tem botão "▸ Abrir (N itens)" / "▾ Fechar"; "Abrir todos / Fechar todos". Começa fechado; lembra por navegador (lembrar('inv-aberto')).
- Mover item para dentro de um recipiente abre ele (o item não some da vista).

## BLOCO 4 FEITO (8 nov)
- Alcunha: ficha PE N6; mestre troca em Recompensas (M.estado.alcunhas[uid]). Aparece como faixa "entre aspas" no pé da foto: cartaz pequeno (Grupo), cartaz que cai na tela, mural.
- Recompensas: cabeçalho de quadro de madeira com bando inteiro, procurados, maior cartaz, faixa de caçadores, botão "Ver o mural".
- Mural de procurados (aba "mural", mestre e jogadores): M.estado.mural [{id, uid?, pdm?, nome, alcunha, valor, ret, em, oculto}].
  Publicar recompensa prega/atualiza o cartaz. Mestre prega NPC (livre ou das Fichas do mestre), edita, esconde, tira. Selo "novo" por 3 dias. Cartazes com prego e leve inclinação.
- Sem regra nova no Firestore (tudo em mesa/estado, que só o mestre escreve).
- Arte nova (Sprite AI) é opcional: o quadro usa a textura de madeira que já existe.

## BLOCO 5 FEITO (8 nov)
- Diário do capitão PRIVADO: capitaes/{uid}/entradas (69-capitao.js). Só o dono e o mestre leem. Escreve quem é o capitão oficial (Tripulação).
  Publicar = cópia em mesa/capitao/entradas (campo de = id privado; privado guarda pub = id público). Despublicar apaga a cópia. Editar atualiza as duas.
  Ex-capitão continua lendo/editando/apagando as dele (aba aparece se tiver páginas). Mestre vê o privado do capitão atual no Diário de bordo.
  REGRAS DO FIRESTORE NOVAS: bloco match /capitaes/{uid}/entradas/{id} (arquivo firestore.rules). Precisa publicar no console do Firebase.
- Guia de lore (97-lore.js): textos aprovados de espécies + 12 temas do mundo (Livro com página; Wiki com link). Busca, abre/fecha, aviso de linha do tempo (antes de Marineford).
- PDF (98-pdf.js): página de impressão + window.print (Salvar como PDF). Diário de bordo (com opções), diário pessoal, diário do capitão (inteiro).
- PROMPT_chat_de_lore.md atualizado com Blocos 3, 4 e 5.
Backup das regras: backups/firestore.rules.antes_bloco5

## BLOCO 6 FEITO (8 nov, Sonnet médio)
- Tabelas do Narrador (75-tabelas-gn.js, data/tabelas_gn.json, gerado por tools/gn_tabelas.py a partir do texto do GN 2.0): eventos que abalam o mundo (com segunda rolagem automática), personalidade, perdido, invasor, descoberta, calamidade, organização, eventos fechados d100, governo d100, encontros aleatórios (selvagem d20, urbano d12, mar, submerso d10, batalha d6). Só o mestre vê. Rola, copia, mostra a tabela inteira com a faixa sorteada.
- Catálogo (76-catalogo.js, catalogo.js carregado sob demanda): 10 frutas lidas dos PDFs (tools/parse_frutas.py → data/frutas.json), 5 estilos exclusivos, espécie Ogro/Oni. Kumo-Kumo ficou de fora (PDF fora do padrão).
- Visibilidade: M.estado.catalogo = {esconder:{frutas,estilos,especies,guia_especies,guia_mundo}, descobertas:{fruta:true}, liberados:{heroi:true}}. Fruta nasce ESCONDIDA dos jogadores até o mestre revelar. Herói é BANIDO (cria companheiros): só aparece se o mestre liberar.
- Controle "O que os jogadores enxergam" em Ajustes e no topo do Catálogo (mestre). Esconder categoria não apaga nada. Vale ao vivo.
- Sem regra nova no Firestore.
- Pendências: nome Ogro x Oni (decisão do mestre); Kumo-Kumo à mão; textos vieram dos PDFs por programa (conferir por amostragem).

## BLOCO 7 FEITO (8 nov, Opus máximo)
- Conferência das regras do site contra o LJ 2.1 e o GN 2.0: relatório em AUDITORIA_REGRAS_B7.md (o que foi conferido, com página, e as 7 correções).
- Cartaz de procurado: a foto agora encaixa na janela em qualquer tamanho (icFit + fotoCartaz; texto do cartaz em cqw). Retrato em pixel aparece inteiro; foto enviada cobre a janela com o rosto no terço de cima.
- Guia de lore reescrito com o mundo de One Piece (One Piece Wiki, com link) + Livro (com página). Oni completo (o que a obra mostra: Kaido, Yamato, Onigashima, pistas de Elbaf). Novos temas: linha do tempo, Mary Geoise, Sabaody, Impel Down, Wano, Supernovas.
- Catálogo: revelação em dois níveis por item (descobertas[id] / estilos[id] = 'ideia' | 'tudo'); tudo começa escondido (inclusive os exclusivos: o Usuário Ínsito não aparece mais sozinho para a Amy). Ideia escrita à mão para cada fruta (+ "Na obra" e nota só do mestre). Kumo-Kumo (nossa, do .docx) entrou. Os 12 estilos do LJ entraram (tools/estilos_livro.py: ideia, números, características por nível, tabela e 130 cartões de técnica). Botão "Revelar os estilos do grupo".
- Tabelas do Narrador: "Para que serve", "Quando usar" e exemplo em cada tabela e grupo.
- Ícones prontos para trocar sozinhos quando a arte chegar (icOu): frutas:<id>, estilos:<id>, especies2:oni_guerreiro.
- Prompts da terceira leva (prompts/Prompts_Terceira_Leva.html, artefato): frutas, estilos, Oni e espécies, retratos de NPC, mural, fundos, 3 animações, kit de barras.
- Ordem para regerar os dados do catálogo: tools/parse_frutas.py → tools/catalogo_b7.py → tools/estilos_livro.py.

## DADO 3D (para o Bloco 8): decidido e com protótipo
- Protótipo: scratchpad/dado3d.html (artefato "Teste do Dado 3D"). three.js r128, icosaedro sem índice, atlas de números em canvas, render em resolução baixa (1/3) ampliado com pixelated.
- O resultado vem antes (rolarPublico/Firestore); a animação gira e faz slerp até a face do número virar para a câmera, com giro para o número ficar em pé. Todo mundo vê a mesma face. Sem física (física diverge entre aparelhos).
- No site: carregar three só na 1ª rolagem (lazy), d4/d6/d8/d10/d12 por geometria (d10 = trapezoedro feito à mão), cores por jogador, crítico/falha com brilho; reserva = dado 2D atual; prefers-reduced-motion = só mostra o número.
## IDEIAS NOVAS (propostas, nada feito)
1 Pedido de teste do mestre (todos/um, secreto ou público) → botão na tela do jogador → resultado volta ao mestre.
2 Comida e água do navio (LJ p. 280: 0,5 kg comida e 3 L água por pessoa/dia) descontando do "No navio" a cada dia de viagem; exaustão se faltar.
3 Cofre do bando (Beli comum) com histórico.
4 Reputação com facções (Marinha, Revolucionários, Cipher Pol, Imperadores, ilhas).
5 Condições com duração em rodadas que somem sozinhas.
6 Discord: mandar cartaz, jornal e resumo da sessão pelo webhook que já existe.
7 Linha do tempo da campanha (eventos do mundo antes de Marineford).
8 Celular: instalar como app (PWA) e aviso "sua vez" com vibração.
## ASSETS que faltam
Ícone de espécie Ogro/Oni e Mestiço; ícones de algibeira, saco, cesto; retratos de NPC (almirante, vice-almirante, caçador, pirata rival, okama, gigante, homem-peixe, mink, tenryuubito guarda); placa de madeira para cabeçalhos; fundo de quadro de cortiça/madeira para o mural.

## LEVA 3 INTEGRADA (08/11/2026, à noite)
Chegaram 12 folhas (6 no zip + 6 no chat). Script: `app/art/process5.py` (lê `raw/leva3/`, escreve em `app/assets/` e no manifest).
- Ícones: `frutas` (11 + genérica + 4 baús), `estilos` (16, com Black Leg, Esgrimista, Solfista, Usuário Ínsito), `especies2` (16 bustos: 4 Oni, mestiços, minks, tritão, etc.). Cada ícone tem paleta própria (com uma paleta só, o roxo virava cinza).
- Cenas: 12 cenas de fruta (`f_<id com _>`, na faixa do topo da página da fruta) + 4 fundos de página (`cat_mural`, `cat_catalogo`, `cat_tabelas`, `cat_recompensas`).
- Interface: moldura do mural (9 fatias, desenhada por cima), prego e tachinha, fita "novo", fita de papel da alcunha, pinos de exaustão, cadeado do Catálogo, barra do casco do navio.
- Animações: `fruta` (aviso "Akuma no Mi descoberta"), `cartaz_vento` (mural vazio), `evento` (jornal que gira ao rolar "Eventos que abalam o mundo", toca uma vez).
- Cartazes do mural balançam em CSS (a arte `cartaz_vento` é um papel liso, não tem o WANTED).
- Prontas e SEM lugar na tela ainda: barras de Haki e de fama (`ui_barra_haki/fama` + `enche_*`), etiqueta de couro, marcador de página, carimbo vazio.
- Ainda não chegaram: `retratos2.png` (16 bustos de NPC), `tex_mural.png`, Jones e Billy (opcionais).
- Falta (Bloco 8): dado 3D (protótipo no artifact 5U7VnESxDPXFLaURTJe7E8), animação do marcador, som ambiente desligado por padrão.

## BLOCO 8 INTEGRADO (08/11, noite)
- Dado 3D (d20): src/app/63-dado3d.js, WebGL feito à mão (sem three.js), icosaedro com números, resolução baixa ampliada. O número vem de r.nat (gravado); giro sorteado por semente (r.em), então igual para todos. Reserva 2D: sem WebGL, interruptor "Dado 3D na mesa" (por aparelho, lembrar('dado3d')), ou expressão que não é d20. Movimento reduzido: dado parado já na face certa.
- Som ambiente: src/app/64-ambiente.js, sintetizado, por cena do relógio/clima (Relogio.cena()), desligado por padrão, interruptor e volume por pessoa no painel de som da Mesa; respeita o botão de som geral.
- Fita (ui_marcador) balançando no Diário e na linha de quem tem a vez no Combate (CSS, sem arquivo novo).
- Teste: scratchpad/m/l9.js (matemática do dado, 2 abas, reservas, ambiente, fita). window.__expor deixa objetos internos à mão só nos testes.
- Pendente/ideias: d4..d12 em 3D; barras de Haki/fama, etiqueta e carimbo sem lugar na tela; sons gravados reais se o Fenrir mandar.

## ESCUDO DE LORE NO SITE (08/11, noite)
- `data/lore_notion.json` (cópia do Notion de 09/11) → `window.LORE` via build.py.
- `src/app/77-escudo-lore.js`: rota `#escudolore` (mestre). Abas Agora/Cenas/Elenco/Decisões/Minhas notas; estado em `estado.lore`; janela extra para 2º monitor; busca; exportar.
- Para atualizar o conteúdo: reler os 3 bancos do Notion, regravar o JSON, `python3 build.py`, zipar.
- Testes: `scratchpad/m/l10.js` (TUDO OK) + regressão limpa.
- Notion "Prompts e ilustrações": serve para prompts prontos de copiar (ícone de ilha, de Akuma no Mi...), não para retratar todos.

## ESCUDO DE LORE v2 + MAPA + LIMPEZA (08–09/11)
- 77-escudo-lore.js refeito: abas Agora/Arcos/Gente/Rápido/Pendências/Notas; arcos e cenas próprios (estado.lore.arcos/extras); sorteios com listas em lore_notion.json › gerador (+ listas do mestre em estado.lore.ger); janela solo (window.name==='escudolore' → body.el-solo).
- 78-mapa.js: "Onde acho o quê" (MAPA_ABAS, MAPA_DUVIDAS, MAPA_PARECIDAS; acrescentar linha ao criar aba nova).
- Menu do mestre: Lore e sessão / Regras / Mar e progresso. Rota `regras` oculta (ROTAS.push). Colinha sem sorteios (foram para o Rápido).
- Testes: scratchpad/m/l11.js (TUDO OK). l10.js é do escudo antigo, descartar.
- Notion "Prompts e ilustrações": agora tem modelos copiar/colar (ilhas, frutas da campanha, 7 modelos).


## ENXUGAR (09/11, pedido: "menos controle, só faísca")
- Escudo de lore: 6 → 4 abas (Agora, Arcos, Rápido, Notas). Gente e Pendências foram absorvidas; "Pessoa pronta", Ordem da sessão, Entregas, tamanho e "Fixo ou livre" saíram da tela (dados seguem em lore_notion.json).
- Botão "Copiar tudo para mandar ao chat de lore" em Notas (ACT el-copiar-notas).
- Abas irmãs (98-irmas.js + OCULTAS em 33-mesa.js): Inimigos+Encontro, Mundo+Lojas, Tripulação+Navio, Recompensas+Procurados, Viagem+Tesouro. Menu do mestre 29 → 23.
- Colinha sem bloco de recompensa. Mapa atualizado. Teste: scratchpad/m/l12.js (regressão reg12.log limpa).
- Regra de ouro daqui para frente: o site dá faíscas e lembretes; nunca roteiro, tempo de sessão, falas prontas nem conteúdo de personagem de jogador.
