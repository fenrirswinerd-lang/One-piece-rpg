# Log: Bloco Fable 1 (Versão 23)

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

## O que ainda NÃO está pronto

- **Mapa:** terreno difícil não desconta sozinho (use "zerar"); não tem paredes nem névoa; o tamanho da ficha (Grande, Enorme) você escolhe à mão; só entra no mapa quem está na luta.
- **Assistente:** não lê o livro inteiro, só os dados do site. Pergunta muito aberta pode cair em "não achei". O que ele não souber, guarde como pendência e me mostre.
- **Ateliê:** os prompts guardados ficam só no aparelho.
- **Não testei com Firebase de verdade**, só no modo de teste (mestre + jogador em duas abas). Teste o "jogador move a ficha" com um jogador real.
- **Não fiz** a auditoria completa de bugs e de contas do site inteiro. Neste bloco eu construí; a auditoria fica para um próximo.
- Continua da lista antiga: pausar música para todos, efeitos de tiro da naval para jogadores, navio do bando, Canhão de Energia.
