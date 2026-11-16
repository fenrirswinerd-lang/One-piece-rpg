# Mesa One Piece: tudo que o Fable fez + o que falta

Dois pacotes: **Versão 23** (Bloco 1) e **Versão 24** (Batalha naval viva). Nenhum dos dois precisa mexer nas regras do Firebase. Suba o zip `Mesa_One_Piece_site.zip` (v24) no Netlify e aperte Ctrl+F5.

---


Três abas novas e um resumo melhor. **Não precisa mexer nas regras do Firebase.** Suba o zip no Netlify e aperte Ctrl+F5.

## 1. Pergunte ao livro (assistente de regras, sem IA)

Onde: menu **Regras → Pergunte ao livro**, botão **?** no topo, ou tecla **P**. Os jogadores também têm a aba.

O que testar (escreva do seu jeito):

| Pergunta | Resultado certo |
|---|---|
| quanto de dano uma bala dá? | Esférica 1d8, Perfurante 1d8, Kairoseki; avisa que quem dá o dano é a munição |
| trueno bastardo precisa rolar ataque? | Uso normal: rola ataque. Uso alternativo: o alvo faz Salvaguarda de Destreza com desvantagem |
| salvaguarda de destreza do pirata novato | 1d20 +2, com botão "rolar" |
| ação poderosa tira o ataque comum? | Não. Deslocamento + 1 ação + 1 ação poderosa (LJ p. 284) |
| o que é ataque de oportunidade? | Não existe como regra geral; lista quem tem |
| crítico do pirata espadachim com sabre | 2d6+4 vira 4d6+4, e mostra o dano extra dele |
| pirata novato a 15 m chega quando? | Andando: 2º turno. Com Disparada: encosta no 1º, sem a ação. Explica a ação preparada |
| +7 contra CR 17 | Precisa de 10 ou mais: 55% |
| caído / exaustão / kit médico | Condição, regra ou preço, com a página |
| role 2d6+3 | Rola o dado |
| banana voadora azul | "Não achei" (ele não inventa) |

- Cada resposta tem um selo: **conferido** (com a página), **a conferir** ou **decisão da mesa**.
- No fim da resposta (só o mestre): **Guardar decisão**. Ela entra nas regras da casa (Ajustes) e passa a aparecer primeiro.
- **Guardar como pendência**: quando o livro não responde, fica numa lista no fim da aba.
- Jogador: vê regras, condições, armas, a **própria ficha** ("minha salvaguarda de destreza") e só as técnicas que você revelou no Catálogo. **Não vê inimigos.**

## 2. Mapa de combate

Onde: menu **Ao vivo → Mapa de combate**, ou o botão **Mapa** dentro de Combate.

Como testar:
1. Em **Combate**, ponha jogadores e inimigos e comece a luta.
2. Abra o **Mapa** e clique **Pôr todos no mapa**.
3. **Arraste** uma ficha. A linha fica verde (cabe no deslocamento), amarela (só com Disparada) ou vermelha (não chega neste turno).
4. **Clique** numa ficha: aparece o painel com a distância até cada um e "ataca neste turno / no próximo / daqui a N turnos".
5. Botões **Régua** e **Área de técnica** (cone, linha, esfera): a área mostra quem ela pega.
6. **Fundo e tamanho do mapa**: envie uma imagem (peça no Ateliê) e acerte o número de quadrados.
7. Marque **Mostrar aos jogadores**. Eles ganham a aba "Mapa de combate".
8. Com **Jogador move a própria ficha** ligado, cada jogador arrasta a ficha dele (por padrão, só na vez dele). O movimento aparece no registro do combate.

Resultado certo: 1 quadrado = 1,5 m; diagonal vale 1 quadrado (LJ p. 287); "Próximo turno" zera o quanto a ficha da vez andou.

## 3. Ateliê de arte (prompts para o ChatGPT)

Onde: menu **Preparar → Ateliê de arte**.

10 tipos: retrato de NPC, foto de cartaz, ilha, cena para o Quadro, **mapa de combate**, token, navio (folha 2×2), ícone/Akuma no Mi, Jolly Roger, foto de jornal.

Como testar: escolha o tipo, marque as opções, escreva detalhes em português, clique **Copiar** e cole no ChatGPT. **Variar** muda o ângulo. **Guardar este** salva no aparelho.

Resultado certo: o prompt sai em inglês, com o estilo do site, fundo rosa onde precisa de recorte, sem texto na imagem e pedindo desenho original (sem copiar personagem da obra).

## 4. Resumo da sessão (Diário de bordo → resumo)

Agora traz **números da sessão** e **linha do tempo** com hora. O botão **Copiar pedido para polir no Claude** só copia um texto para você colar fora do site.

## 5. Outros acertos

- Dois cartões novos no Escudo (Turno e ações): "Chegar no alvo: deslocamento e Disparada" e "Preparar: esperar o inimigo chegar" (LJ p. 286, 288, 289).
- Corrigido um erro de console quando um campo perdia o foco durante a troca de tela.
- "Onde acho o quê" já lista as três abas novas.

## v23: o que ainda NÃO está pronto

- **Mapa:** terreno difícil não desconta sozinho (use "zerar"); não tem paredes nem névoa; o tamanho da ficha (Grande, Enorme) você escolhe à mão; só entra no mapa quem está na luta.
- **Assistente:** não lê o livro inteiro, só os dados do site. Pergunta muito aberta pode cair em "não achei". O que ele não souber, guarde como pendência e me mostre.
- **Ateliê:** os prompts guardados ficam só no aparelho.
- **Não testei com Firebase de verdade**, só no modo de teste (mestre + jogador em duas abas). Teste o "jogador move a ficha" com um jogador real.
- **Não fiz** a auditoria completa de bugs e de contas do site inteiro. Neste bloco eu construí; a auditoria fica para um próximo.
- Continua da lista antiga: pausar música para todos, efeitos de tiro da naval para jogadores, navio do bando, Canhão de Energia.

---

# Versão 24: Batalha naval viva

Só mudou o que se **vê e ouve**. Nenhuma regra, conta ou dado foi alterado. Não precisa mexer no Firebase.

## O que mudou

1. **Mar vivo.** As ondas se mexem em duas camadas. O mar acompanha a **hora e o clima da Mesa**:
   noite (escuro, com lanternas nos navios), pôr do sol, amanhecer, **tempestade** (chuva, raio, ondas rápidas), **neblina** (névoa passando), neve e calmaria.
2. **Navios com vida.** Balançam na água e **navegam** de um ponto ao outro (antes pulavam). Abaixo de metade do PV soltam **fumaça**; abaixo de um quarto, **fogo** e fumaça preta; a 0 PV, borbulham e adernam.
3. **Tiro completo, para todos.** Clarão, fumaça na boca do canhão, bala voando, explosão ou respingo, **número do dano** subindo ("−27", "CRÍTICO −54", "água!") e o mapa **treme** no impacto. Agora os **jogadores também veem** os efeitos (antes só o mestre).
4. **Sons da batalha** (feitos pelo próprio site, sem arquivo): canhão, impacto na madeira, crítico, respingo, arpão, corrente, mastro quebrando, colisão, navio afundando, sino de rodada. Seguem o **volume de efeitos** da Mesa e o "Silenciar efeitos".
5. **Faixas no mapa:** "Às armas!", "Rodada 2", "Fragata foi a pique!", nome do evento do mar.
6. **Modo cinema** (botão no topo da aba): o mapa ocupa a tela inteira, com a última ação como legenda. Sai com Esc. Bom para os jogadores.

## O que testar

1. **Batalha naval** → ponha 2 navios, aproxime, role iniciativa, atire. Resultado certo: efeitos e sons no seu aparelho.
2. Marque **Mostrar esta aba para os jogadores** e abra como jogador em outro aparelho. Resultado certo: ele vê o tiro, o número de dano e ouve o canhão (menos de 1 segundo depois).
3. Na **Mesa → Painel do mestre → Tempo**, troque o clima para Tempestade e volte à naval. Resultado certo: mapa escuro, chuva, raio de vez em quando.
4. Tire PV de um navio até metade e até um quarto. Resultado certo: fumaça, depois fogo.
5. **Próximo turno**: o navio desliza até a posição nova.
6. **Modo cinema** e Esc.
7. Caixa **Sons da batalha**: desmarcar cala só no seu aparelho.

## O que ainda NÃO está pronto / limites

- **Não ouvi os sons** (aqui não tenho alto-falante). Conferi que os 12 tocam sem erro. Se algum estiver feio ou alto demais, me diga qual.
- O som só toca depois do primeiro clique na página (regra do navegador) e com o som do topo ligado.
- Quem estiver em **outra aba** na hora do tiro não vê nem ouve o efeito (não acumula para tocar depois).
- Navio parado (PV baixo ou âncora) não desliza, porque não anda.
- Continua faltando da lista antiga: imagem do navio do bando, Canhão de Energia, tripulação mínima, Reparo Emergencial.

---

# O QUE FALTA PARA FICAR MAIS PIKA E DINÂMICO

Ordem sugerida: primeiro o que mais aparece na mesa, depois o resto.

## A. Para usar já (precisa de você)
1. Testar com **jogador real no Firebase**: jogador mexendo a própria ficha no mapa e vendo os efeitos da naval.
2. Dizer qual **som** está feio ou alto demais.
3. Esclarecer: "os outros não tocam quando eu tocar efeito/música". É para eles ouvirem também? Hoje cada um toca no seu aparelho.

## B. Ao vivo na mesa (maior impacto)
- **Música e efeito para todos juntos** (você toca, todo mundo ouve, com pausar para todos).
- **Efeitos que esperam o jogador**: quem estava em outra aba vê/ouve o tiro quando volta.
- **Mapa de combate com névoa e paredes**: jogador só vê o que a ficha enxerga. Terreno difícil descontando sozinho.
- **Tamanho de ficha automático** (Grande, Enorme) lido da ficha ou do inimigo.
- **Rolagem de dados com animação e som** para todos verem (dado caindo, crítico com brilho).
- **Cena de abertura**: tela cheia para os jogadores com título, ilha e música (tipo "Capítulo 3").
- **Barra de PV e condições animadas** nas fichas do mapa (balançar ao tomar dano, ícone de condição).

## C. Naval (regras que faltam)
- Imagem do **navio do bando** (peça no Ateliê).
- **Canhão de Energia**, **tripulação mínima** e **Reparo Emergencial**.
- Abordagem (pular de navio para navio) como mini-cena no mapa.
- Regras da casa em aberto: tiro lateral, mastro destruído (metade da velocidade), crítico dobra dados, tamanho do navio só visual.

## D. Conteúdo
- **Catálogo de inimigos** (subir o Manual dos Inimigos).
- Fichas do **Elias, Billy, Grisk, Kaolin**: só quando você mandar. Revolucionário (REV-01) continua em aberto.
- Em aberto de regras: ROOM se o usuário desmaia, Uso Alternativo, Kiri Shigure, Dificuldade Inefável, CD das técnicas de Akuma.
- Limpar imagens do PdN quando apagar o personagem.

## E. Assistente "Pergunte ao livro"
- Ensinar mais perguntas (cada pendência que você guarda vira lição).
- Só sabe o que está nos dados do site; livro inteiro exige subir mais capítulos.

## F. Auditoria completa (melhor usar o Fable)
Varredura de bugs e de contas no site todo: ficha, combate, perícias, dano, crítico, CD, recursos, desfazer, sincronização. Ainda **não foi feita**.

## G. Ateliê
- Prompts guardados ficam só no aparelho (poderiam ir para o Firebase).

---

**Qual modelo usar:** Sonnet 5.5 para ajuste visual, som, CSS e correção pequena. Fable para a auditoria (F), névoa/paredes e sincronização de som para todos (B), e as regras da naval (C).
