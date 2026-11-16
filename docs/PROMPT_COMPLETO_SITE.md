# PROMPT COMPLETO: Mesa One Piece (site da mesa de RPG)

> Cole este texto inteiro numa IA e anexe as imagens da pasta `prints/` (o nome de cada print está citado abaixo).
> Tudo aqui foi conferido no código e na prévia do site em 14/11/2026. O que ainda NÃO existe está marcado como "FALTA".

---

## 1. O que é

Site de mesa de RPG online para o **OP RPG** (sistema de One Piece em PT-BR: **Livro do Jogador 2.1 = LJ** e **Guia do Narrador 2.0 = GN**; também **Manual dos Inimigos** e Resumo de Técnicas).
Dono e mestre: **Fenrir** (brasileiro, fala português simples). Grupo pequeno: **4 jogadores** (um 5º só como exceção), nível inicial 3, mestre narra pelo Discord e usa o site como "mesa ao vivo" + controle do mestre.
Visual: **pixel art pirata** (madeira, pergaminho, cartazes de procurado, mar e céu que mudam pela hora do jogo). Sem personagens ou símbolos oficiais de One Piece na arte; nomes do mundo só no texto.

## 2. Como foi feito (técnico)

- **JS puro, sem framework.** Módulos em `src/app/*.js` (00-core até 99-main) são concatenados em ordem alfabética por `build.py` dentro de uma única função. CSS em `src/style.css` e `src/mesa.css`.
- **Build:** `python3 build.py` gera `dist/site/` (pasta para a Netlify: index.html, estilo.css, app.js, dados.js, fb.js, config.js, assets/, fonts/) e `dist/previa.html` (tudo embutido, só modo de teste, para ver no Claude).
- **Hospedagem:** Netlify (o Fenrir sobe o zip à mão). **Banco e login:** Firebase (login com Google, Firestore). As **regras do Firestore** ficam em `dist/regras_firestore.txt` e o Fenrir as publica à mão no console.
- **Papéis:** *mestre* (e-mail fixo no código) e *jogador* (só quem o mestre libera na lista de e-mails, `config/membros`). Jogador removido (lista "fora") some de todas as abas.
- **Segurança de dados:** `segredos/*` só o mestre lê (mundo completo, controle, webhook do Discord). A mesa só recebe o que foi descoberto ou liberado. Diário do capitão privado: só o capitão e o mestre.
- **Arquivos (imagens, trilhas, efeitos, PDFs):** quebrados em pedaços de 900 KB no Firestore (limite do plano grátis: 1 GiB, o site mostra um medidor), com cache no IndexedDB. Fotos de jogador reduzidas a 640 px, ícones a 256 px.
- **Modo de teste:** `?teste` no endereço (ou a prévia do Claude) roda tudo no navegador, sem Firebase, e cada aba escolhe se é mestre ou jogador.
- **Ficha:** lê a **ficha 2.0** do Google Planilhas por **link** (gviz) ou por **arquivo .xlsx** (leitor próprio, lê também as notas das células) e por .docx (inimigo, no formato do Manual dos Inimigos). No Artifact/prévia só o arquivo funciona.
- **Arte:** `art/*.py` transformam PNGs em webp + `assets/manifest.json` (grupos icons, anims, images, tex, ui, tiras). Só o que o manifest cita entra no build. Fundo magenta #FF00FF é removido (chroma-key) nos sprites de navio.
- **Extras:** backups antigos em `backups/`, logs de teste `LOG_*.md`, Playwright usado nos testes.

## 3. Menu e abas (as imagens estão na ordem do menu)

### 3.1 Menu do MESTRE (grupos)
- **Ao vivo:** Mesa, Grupo, Combate
- **Preparar:** Fichas do mestre, Inimigos, Mundo, Arquivos
- **Para a mesa:** Abas dos jogadores, Jornal, Tripulação, Recompensas, Diário de bordo
- **Lore e sessão:** Escudo de lore, Guia de lore, Diário da sessão, Onde acho o quê
- **Regras:** Colinha do mestre, Regras com página, Tabelas do Narrador, Catálogo
- **Mar e progresso:** Viagem, Barra de Bônus, **Batalha naval**
- **Ajustes**
- Abas "irmãs" (abrem por botão dentro de outra aba): Encontro, Lojas, Navio, Regras rápidas, Tesouro, Mural.

### 3.2 Menu do JOGADOR
Mesa, Personagem, Combate, Diário de bordo, Jornal*, Tripulação*, Mural, Guia de lore, Catálogo. (*o mestre pode trancar Jornal e Tripulação; a aba aparece com cadeado.)

### 3.3 Cada aba
(arquivo do print entre parênteses)

1. **Mesa** (`01_mesa.png`): tela ao vivo. Céu e relógio do jogo; quadro central (o mestre mostra imagem ou rola dados); painéis que cada um liga/desliga, arrastáveis e redimensionáveis; **Ilhas** (tabuleiro com NPCs de cada ilha, descobertas/ocultas); **No comando do navio** (quem é o capitão da vez); **Rolar dados** (d4…d100, vantagem/desvantagem, secreta, histórico visível para todos, dado 3D d20 opcional); **Música** (trilha em loop + efeitos, volumes separados, som ambiente por cena); **Painel do mestre** (abas Quadro, Som, Tempo, No mar, Comando, Enviar imagens).
   - **Controles de som SÓ PARA MIM (novo):** Pausar/Voltar música, Parar efeitos, Silenciar efeitos. Valem só no aparelho, não afetam os outros.
2. **Grupo** (`02_grupo.png`): cartões dos jogadores (retrato/pôster, ficha conectada, PV, PP, condições). Adicionar jogador. Trocar retrato ou ficha pelo clique no pôster.
3. **Combate** (`03_combate.png`): iniciativa, turnos, ataques automáticos, turba, calculadoras, registro do combate; entram jogadores, inimigo do Manual ou criatura rápida; o combate é publicado para a mesa.
4. **Fichas do mestre / PdN** (`04_pdm.png`): personagens que o mestre narra, com ficha 2.0 própria. Filtros Todas / No Grupo / Vilões / Guardadas. Cada cartão tem: retrato (**botão verde "Trocar retrato" com envio da própria imagem**), PV/PP/CR/CD/ataque, recompensa, "No Grupo (aliado)", "Vilão" (+ND e XP), campo de anotação secreta, botões Ficha, Trocar ficha, Reler, + Encontro, + Luta (inimigo ou aliado), Desc. longo.
5. **Inimigos** (`05_inimigos.png`): biblioteca do **Manual dos Inimigos** por categoria (Marinha, Pacifistas, Cipher Pol, Piratas, Animais globais/exóticos…), criar criatura própria, importar ficha .docx; botões + Encontro e + Luta.
6. **Mundo** (`06_mundo.png`): ilhas, NPCs e criaturas do mestre; cada ilha tem loja. O que o grupo descobre vai aparecendo na Mesa.
7. **Arquivos** (`07_arquivos.png`): imagens, trilhas, efeitos, fotos dos jogadores, PDFs de lore, ícones; ouvir antes de usar; medidor de espaço.
8. **Abas dos jogadores** (`08_personagem.png`): o mestre abre a aba "Personagem" de qualquer jogador. A aba do jogador tem ficha por link, foto, vida, inventário com recipientes e carga, diário pessoal, lore, profissão e diário do capitão.
9. **Jornal** (`09_jornal.png`): Jornal da Economia Mundial (imagem nova, "mandar pela News Coo").
10. **Tripulação** (`10_tripulacao.png`): capitão do bando, como o mundo vê o bando, o que sabem, aliados, inimigos, Marinha e Governo, território e navio, Jolly Roger.
11. **Recompensas** (`11_recompensas.png`): cartazes, caçadores de recompensa, ajustar a tabela, ganhar renome (GN p. 77), mural de Procurados (`30_mural.png`).
12. **Diário de bordo** (`12_bordo.png`): diário público, diário do capitão (público e privado), resumo da sessão, PDF.
13. **Escudo de lore** (`13_escudolore.png`) *(só mestre)*: cena da vez, arcos, fixados, regras de bolso, "não esquecer", sorteios, pendências de lore.
14. **Guia de lore** (`14_guia.png`): espécies (Humanos, Celestiais, Gigantes, Lunarianos, Minks, Povo do Mar, Oni, Mestiços…) e o mundo (Mary Geoise, Marinha, Revolucionários, CP, Sabaody, Impel Down, Wano, Supernovas, Reis dos Mares, Haki, Poneglyphs), com página do livro e link da wiki.
15. **Diário da sessão** (`15_diario.png`): anotações por sessão, copiar resumo, nova sessão.
16. **Onde acho o quê** (`16_mapa.png`): índice de todas as abas ("minha dúvida é…").
17. **Colinha do mestre** (`17_colinha.png`): checklist antes/durante/depois da sessão, como o grupo sobe de nível, quanto de ND posso pôr, sorteios.
18. **Regras com página / Escudo do narrador** (`18_escudo.png`): todas as regras do LJ/GN com página, busca e selos "não esquece disso", em cartões (Nossa mesa, Turno e ações, Ataque/dano/morte, Vantagem e exaustão, Condições, Testes e CDs, Técnicas/Akuma/Haki, Inimigos, Níveis e XP, Mar e navegação, Batalha naval, Profissões, Viagem e descanso, Loja e preços, Tesouros, Dúvidas frequentes). Inclui as regras "Diferente do D&D" (ex.: não existe ataque de oportunidade como regra geral).
19. **Tabelas do Narrador** (`19_tabelas.png`): eventos que abalam o mundo (d8), eventos fechados (d100), governo, encontros aleatórios; rolagem direto no site.
20. **Catálogo** (`20_catalogo.png`): Akuma no Mi, estilos de combate (com técnicas por nível), espécie Oni, itens "escondido / só a ideia / com técnicas".
21. **Viagem** (`21_viagem.png`): teste de navegação, atraso sem navegador (1d4 meses), clima do dia, dano e conserto, tesouro (abrir baú d100) (`29_tesouro.png`).
22. **Barra de Bônus** (`22_barra.png`): regra da casa de XP (ver seção 4).
23. **Batalha naval** (`23_naval.png`): ver seção 5.
24. **Ajustes** (`24_ajustes.png`): jogadores liberados (liberar/tirar), Discord (webhook), regras da casa, o que os jogadores enxergam, backup (baixar/copiar/colar/apagar), atalhos, onde aparece cada animação.
25. **Navio** (`25_navio.png`): ficha do navio do bando (ícone, armas, cômodos e melhorias, anotações, histórico, dano/conserto).
26. **Lojas** (`26_lojas.png`): cada ilha tem a sua; loja com busca (ex.: pistola, rum).
27. **Montar encontro** (`27_encontro.png`): escolhe inimigos, conta XP/ND, leva para a luta, registra vitória.
28. **Regras rápidas** (`28_regras.png`): condições, exaustão, morte, descansos, crítico/cobertura/concentração, turba, dano improvisado, mares, iniciativa.
29. **NPCs** (`31_npcs.png`).

## 4. Regras da casa (decididas pelo Fenrir)

- Grupo de 4; nível inicial **3** (Proficiência +2).
- **Nível sobe por marco** (fim de arco, mini-arco ou grande feito = +1 para todos).
- **XP só de encontro improvisado** (que não estava no roteiro). Ele enche a **Barra de Bônus**; barra cheia = +1 nível extra no próximo marco (máx. 1 por arco). **Teto: +2 níveis por arco.**
- Kits de profissão: com pelo menos 1 kit dá para usar.
- **Haki do Rei:** só por atitude e decisão do personagem, nunca prêmio automático.
- Técnica com requisito de outra coisa ativa (ex.: ROOM): o desconto de PP já está no custo impresso.
- **Em aberto** (aparece no site como "Ainda a decidir"): ROOM some se a usuária desmaiar?; Uso Alternativo (Paramecia) vale só para a fruta?; Kiri Shigure (rola salvaguarda e depois reduz o dano); Dificuldade Inefável no 6º nível (+2 ou +3 de CD); CD das técnicas de Akuma no Mi ("atributo apropriado", definir por fruta).
- Regras úteis conferidas: acerto = d20 + mod + Proficiência ≥ CR do alvo; **20 natural acerta sempre e é crítico** (todos os dados de dano ×2, modificadores 1 vez); 1 natural erra; técnica sai pela **Ação Poderosa** (1 técnica por turno; separada da Ação, então dá para atacar e usar técnica); **não há ataque de oportunidade geral**; CD de técnica = 8 + Proficiência + mod; salvaguarda = d20 + mod (+ Prof. se proficiente).

## 5. Batalha naval (aba do mestre; protótipo bem avançado)

- Ordem (LJ p. 314): iniciativa (capitão rola Presença), movimento (2 nós = 1,5 m por rodada), turno do navio (1 Ação de Manobra + 1 de Combate), personagens agem normal.
- Manobras: acelerar/desacelerar (até 6 nós), virar até 45°, âncora; ataque do navio: d20 + Presença/Destreza + bônus da arma ≥ CR; canhões, bombardeio, tiro de teste, área, arpão, colisão, BR da madeira, velocidade mínima 8 nós, PV 0 = não navega.
- **Regras da casa da naval:** tiro lateral com chave; mastro destruído corta a velocidade pela metade; **crítico dobra os dados de dano**; tamanho do navio é só visual.
- **Visual:** mapa com navios (sprites top-down: pirata, marinha, mercante, e o do bando como reserva) que mudam por estado (inteiro, danificado, mastro quebrado, afundando), anel de cor por lado, esteira na água, efeitos (tiro, acerto, respingo, explosão, arpão). Jogadores veem mapa, lista e log se o mestre ligar **"Mostrar esta aba para os jogadores"**, mas **não** veem os efeitos de tiro.
- Publicação do mapa em `mesa/naval` no Firestore. Registro da batalha e "evento do mar (d6)".

## 6. O que foi feito por último

- Aba naval reformada com sprites e efeitos; retrato próprio (upload) para PdN, aliados e jogadores; correção de legibilidade (cartão da ficha do mestre no tema escuro e caixas de escolha da naval); controles de som só para o próprio aparelho; botão "Trocar retrato" nas fichas do mestre (Versão 22).
- Notion: fichas de jogo (Tsukyo/Amy, Morita Roman/Drakma, Gen Sarutōryō NPC), página "Atualizações do site", decisão aberta REV-01 (Revolucionário).

## 7. O que FALTA / limites conhecidos

- Pausar música **para todos** (hoje só "Parar", que volta do começo).
- Efeitos de tiro da naval não aparecem para os jogadores; efeito de fogo (efx 4) sem uso.
- Imagem própria do navio da tripulação (o mercante está de reserva); Canhão de Energia, tripulação mínima e Reparo Emergencial não implementados.
- Catálogo de inimigos sem upload de retrato; apagar um PdN não apaga a imagem enviada.
- Fichas ainda inexistentes: Elias/Revolucionário (ideia solta: velho, Rokushiki, sem fruta, pouca intriga; **não é lore oficial**), Billy, Grisk, Kaolin.
- Netlify: o deploy é manual (zip). Regras do Firestore: publicadas à mão.
- Dúvida levantada pelo Fenrir e não esclarecida: "os outros não tocam quando eu tocar efeito/música" (pode ser bug de som para jogadores, a investigar).

## 8. Regras para qualquer IA que for ajudar neste projeto (preferências do Fenrir)

- Responder **curto, em português simples**. Só desenvolver se ele pedir "desenvolva".
- No RPG: dar só **2 ou 3 faíscas** curtas e abertas; **não inventar** tempo de sessão, falas prontas, cenas roteirizadas nem sequência de eventos; **não criar conteúdo de personagem de jogador** (só NPCs e lugares).
- As anotações dele são **ideias soltas** e só viram lore oficial quando ele disser.
- **Perguntar antes de criar estrutura nova** (tabela, lista, categoria, controle).
- Papel da IA: conectar as ideias dele, **checar o cânone de One Piece** e as regras do LJ/GN com página, e dar faíscas. As decisões são dele; não deixá-lo dependente nem assumir o controle.
- Ao entregar arquivo/build: mandar junto **um log** do que testar, o resultado certo e o que ainda não está pronto.
- Ao parar entre blocos de trabalho: dizer se recomenda **baixar ou manter o nível de esforço do modelo**.
- Nunca copiar letra/texto longo dos livros; citar página.

## 9. Como pedir mudanças (modelo)

"No site Mesa One Piece (descrição acima), na aba **X**, quero **Y**. Não mexer em **Z**. Entregar o zip, o log do que testar e dizer o que ainda falta."
