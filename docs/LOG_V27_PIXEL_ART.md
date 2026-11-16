# Log: Versão 27 (as suas imagens entraram no site)

**Não precisa mexer nas regras do Firebase.** Suba o zip no Netlify e aperte Ctrl+F5.
Nenhuma regra ou conta do jogo mudou. Só arte e jeito de mostrar.

As 20 imagens que você mandou entraram (recortei o fundo rosa de todas). Os dois oceanos: o primeiro é o mar da Batalha naval e do chão "Mar"; o segundo é o chão "Alto-mar".

## O que entrou e onde ver

### 1. Lugares da mesa com moldura (imagem 01)
Na borda de baixo do quadro da Mesa, cada retrato ganhou moldura de pixel art:
- **Dourada**: jogador comum.
- **Sol de pontas**: o Mestre.
- **Com chapéu pirata**: quem está na vez do combate.
- **Enferrujada com atadura**: jogador com 0 PV.

Resultado certo: abra a Mesa. Comece um combate (aba Combate) e passe o turno: a moldura do chapéu anda de um jogador para outro.

### 2. Faixa de vez (imagem 02)
"Vez de Fulano" agora aparece numa **faixa vermelha com corda dourada**, com o retrato dentro. "Sua vez!" fica em verde.

### 3. Mesa dos dados (imagens 03 e 04)
O tampo agora é a **madeira do navio** (bússola, corda, moeda de caveira). Para o mestre trocar: **Música → ⚙ Ajustes → Mesa dos dados**: Madeira do navio, **Feltro verde** (moldura de madeira com cantos dourados), Madeira simples (a antiga) ou Enviar outro tampo.

Resultado certo: role um dado. A mesa vista de perto é a madeira nova. O número da plaquinha bate com a face de cima.
Vale para todos (o mestre escolhe).

### 4. Rostos de pixel art nos inimigos (imagens 05 a 10)
**72 rostos novos.** Cada inimigo do Manual ganha um rosto fixo, escolhido entre os da categoria dele (o mesmo inimigo mostra sempre o mesmo rosto):
- **Marinha**: recrutas (9 rostos), oficiais, veteranos e almirantes.
- **Piratas**: brutamontes, atiradores, espadachins, capitães, piratas comuns.
- **Cipher Pol**: agentes (cartola, máscara, óculos escuros…). **Pacifistas**: robôs.

Também dá para escolher esses rostos na mão: **Mundo → NPC → Escolher dos retratos**, na foto do jogador (**Escolher ícone**) e no grupo. Aparecem em abas: Piratas 1, Piratas 2, Marinha, Recrutas, Governo, Governo (sem capa).

Resultado certo: Combate ou Mapa de combate → ponha 2 Recrutas e 1 Marinha graduado. Cada um com cara diferente.

### 5. Bichos de pixel art (imagens 11 e 15)
18 bichos: búfalo de carga, touro bravo, camelo, cobra, coruja, lesma, lagarto de leque, lagostim, jacaré aviador, gaivota correio, galo piloto, peixe-voador, lagosta-navio, tartaruga-ilha, hipopótamo lanoso…
Entram sozinhos nos inimigos animais (King Bull = búfalo, Den Den Mushi = lesma, News Coo = gaivota, Erimaki = lagarto, Expresso Camarão = lagosta-navio…) e na lista de ícones do NPC/criatura (abas Bichos 1 e Bichos 2).

### 6. Mapa de combate (imagens 13, 14, 16, 20, 12 e 17)
- **Chãos novos em pixel art**: Grama, Muralha de pedra, Mar e Alto-mar. (Convés, Areia, Neve, Noite e Pergaminho continuam.)
- **Marcadores com figura**: no mapa, **Marcadores** agora mostra 18 figuras: barril, caixote, fogueira, porta, baú, canhão, mesa de taverna, pedra, palmeira, rochedo, coral, ilhota, naufrágio, redemoinho, iceberg, banco de areia, barris, sombra de monstro. Clique na figura e em **Pôr**; arraste no mapa. Os jogadores veem igual.

Resultado certo: Mapa de combate → Chão e tamanho do mapa → Grama. Marcadores → clique na fogueira → Pôr.

### 7. Batalha naval (imagens 12, 18 e 19)
- O **mar** agora tem a textura de pixel art e desliza devagar. Continua mudando com hora e clima (noite escurece, tempestade fecha).
- **Tiro na água** = coluna d'água em 6 quadros. **Tiro no navio** = explosão em 6 quadros. Os jogadores veem também.

Resultado certo: Batalha naval → dois navios → atirar. Na água sobe a coluna; no navio explode.

## Peso do site
O site cresceu cerca de 1,2 MB (imagens). Os rostos grandes (128 px) não entraram para a prévia não passar do limite. Isso não muda nada visível.

## O que ainda NÃO está pronto

- **Não testei com Firebase de verdade**. Só no modo de teste com abas.
- A bandeja de feltro (04) virou só uma opção de tampo. Dos dois conjuntos de Governo (09 e 10), só 5 rostos de cada entram sozinhos nos inimigos do Cipher Pol; os outros (robôs, anjo, livro) você escolhe na mão.
- **Nome dos rostos:** dei nome pelo que vi (ex.: "tapa olho", "bigodão"). Se algum nome ficou errado, me diga o código.
- **Obstáculos do mar** (rochedo, redemoinho, iceberg, banco de areia) só entram como marcadores no Mapa de combate. Na Batalha naval eles ainda não existem como peça; isso é uma regra nova de jogo e fica para quando você decidir como funciona.
- **Pacote do Ateliê (A2 a A5, B, C, D)** do PROMPTS_DE_ARTE_V26: as imagens que você mandou cobrem a maior parte. Faltam: reações (ícones no lugar dos emojis) e navios do bando.
- **Dado:** o dado em si continua com cores lisas. Se quiser dado em pixel art (faces com textura), é uma próxima leva.
- Continua pendente da lista antiga: auditoria das contas das regras, bandeja "Dados" do topo em 2D, mapa sem paredes e névoa.
