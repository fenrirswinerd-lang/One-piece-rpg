# Log: Versão 30 (inventário, livro, convés, título, chegada, menu)

**Não precisa mexer nas regras do Firebase.** Suba o zip no Netlify e aperte Ctrl+F5.
Tudo foi testado no modo de teste (sem Firebase de verdade), mestre e jogador, em 5 larguras de tela, tema claro e escuro: 0 erros no console.

## 1. O bug da sessão: mochila da ficha
**O que era:** o inventário não lia a nota (comentário) da mochila na planilha.
**Agora:** o botão **Trazer itens, armas e dinheiro da ficha** baixa a planilha inteira (pelo mesmo link) e lê as notas. Cada item da nota entra **dentro** da mochila, bolsa ou baú, com o peso que estiver escrito (kg, g, "2x", "x5", "(3)"). Sem peso na nota, usa o peso do livro quando acha o item.
**Como testar:** na ficha de um jogador, ponha na nota da mochila: `Corda 2kg, Lanterna 1kg, 3x Ração 0,5kg`. Abra Personagem › Inventário › Trazer da ficha.
**Resultado certo:** os três itens aparecem dentro da mochila, com o peso. Clicar de novo diz "Nada novo na ficha" e não duplica.
**Se o Google recusar** (não consegui testar o link de verdade daqui de dentro): cada recipiente tem **＋ Colar lista**. Cole a nota e clique **Pôr dentro**.

## 2. Pergunte ao livro lê o livro
**Agora:** além das regras prontas, aparecem trechos do texto dos livros com a página. **Ler a página inteira** abre a página, com ◂ ▸ para folhear.
- Você (mestre) busca no Livro do Jogador, no Guia do Narrador e no Manual dos Inimigos.
- O jogador busca **só no Livro do Jogador**.
- O texto dos livros (livro.js, ~2 MB) só baixa na primeira pergunta. Não é IA: é busca por palavras, com sinônimos. Custo zero.
**Como testar:** pergunte "agarrar", "cobertura", "haki do armamento".
**Resultado certo:** cartões de regra em cima; embaixo, "No texto do livro", com trechos marcados e o número da página.

## 3. Roda da Mesa
Os retratos ficam centralizados e do tamanho do assento em qualquer tela. No Palco (⛶), os assentos crescem com a tela.

## 4. Lore do jogador
O site **não inventa** mais resumo. Mostra **Pontos do texto** (começo, fim e marcos de tempo, como "anos depois") e **Nomes que mais aparecem**, com o aviso de que não é resumo. O caso "Os pais eram heróis" não se repete.
Resumo de verdade da lore: me mande o PDF no chat e eu escrevo (o site não consegue sem IA paga).

## 5. Diário de bordo
- Você edita um texto já publicado (botão **editar**). Fica "Editado em ...".
- Ao publicar ou editar, marque **Este é o resumo da sessão**: o texto ganha o selo "Resumo da sessão".

## 6. Recursos do convés (regras da casa, você desbloqueia)
Em **Tripulação › Recursos do convés**. Cada um começa bloqueado. Bloquear de novo não apaga nada. O jogador só vê o que está desbloqueado.

| Recurso | Onde aparece | O que faz |
|---|---|---|
| Moral do convés | Tripulação | 0 a 10, começa em 5. Botões +1/−1 com motivo (festa, baixas...). Moral 8–9: +1, 10: +2, 1–2: −1, 0: −2, **só nas rolagens que o site faz pela tripulação** (abordagem e rota fixa). |
| Marujo que vira gente | Rostos do convés | Cada rosto ganha até 6 feitos (★). "Alguém se destacou?" sorteia um marujo, dá rosto e anota o feito. |
| Abordagem | Batalha naval (botão **Abordar** ao lado de "Jogar o navio em cima") | Luta dos marujos em grupo: um d20 por lado por rodada. Bônus: dobro de gente +2, triplo +4; nosso lado +moral +1 por protagonista no convés (até +5); o deles +0/2/4/6 pela ameaça. Perdedor da rodada perde 10% +3% por ponto de diferença (até 45%). Acaba quando um lado fica com 1/4 do que começou. |
| Rota fixa | Frota › Mandar em missão › "Rota fixa" | O navio repete a missão sozinho. A cada volta, um d20 (com moral). O que traz fica em **A frota trouxe** até você guardar no Banco. Navio com PV ≤ 25% para e espera conserto. |

**Como testar a abordagem:** ponha um navio do bando e um inimigo na batalha, selecione o do bando, **Abordar**, confira os números, **Abordar!**, clique **Rodada do convés** até acabar.
**Resultado certo:** barras dos dois lados caem, o registro mostra cada rodada. Vitória: **Tomar o navio para a frota** (se o navio já estava na Frota como inimigo, ele só troca de lado), **Guardar no Banco** o saque. **Fechar a luta**: as baixas saem do efetivo (só quando é o navio principal; navio da frota não mexe no efetivo) e a moral sobe ou desce 1.
Os jogadores veem a luta no convés quando a aba Batalha naval está mostrada para eles, sem botões.

## 7. Título na tela e chegada na ilha (sem arte nova)
- **Título:** Painel do mestre › Comando › **Título na tela (opcional)**. Escreva o nome do arco ou do episódio, ou clique no atalho do arco / da sessão. Aparece para todos, com faixas pretas, ~7 s.
- **Chegada:** em Mundo (linha de cada ilha) ou clicando na ilha na Mesa: **Chegar ▸ todos**. Marca "estamos aqui", descobre a ilha e mostra para todos.
  - **Arte da chegada:** escolha uma imagem já enviada ou envie uma nova (paisagem deitada fica melhor). Sem arte, aparece o ícone da ilha.
  - **"mostrar a arte na chegada"** desligado: aparece só o nome da ilha.
  - **Ver só para mim** testa sem mostrar aos jogadores.
- Os dois têm som próprio em Painel › Som (Título na tela, Chegada na ilha). Sem escolha, toca o som de sempre.

## 8. Menu do jogador mais curto
12 abas viraram 8. **Navio** e **Banco do bando** abrem no topo da **Tripulação**; **Procurados** no topo do **Jornal**; **Catálogo** no topo do **Pergunte ao livro**. Aba irmã trancada aparece com cadeado. Se a aba mãe estiver trancada, a irmã volta para o menu.
No menu da conta (retrato no canto), **Abas do menu: Todas** volta o menu completo para quem quiser. Seu menu (mestre) não mudou.

## 9. Novidades (patch notes)
Na primeira entrada depois de uma versão nova, aparece uma faixa "Tem novidade na Mesa" no canto. **Ver** abre o texto; some depois. Para ver de novo: retrato › **Novidades**.
O texto vem de `src/novidades.md` (o mesmo do UPDATE_LOG_JOGADORES.md). Para a próxima versão: escreva "## Versão 31" no topo desse arquivo e rode o build.

## 10. Correções de tela
- Batalha naval passava da tela no celular (360 px). Corrigido.
- "Jornal da Economia Mundial" empurrava a tela no celular. Corrigido (títulos grandes diminuem e quebram a linha).
- Depois das correções: nenhuma aba passa da largura, em 360, 390, 768, 1024 e 1920 px, mestre e jogador.

## O que NÃO está pronto
- Nunca testado com Firebase de verdade (só modo de teste). A leitura da nota da mochila pelo link do Google não pôde ser testada daqui.
- Os números da abordagem e da rota fixa são ponto de partida, não regra do livro. Ajuste na mesa.
- Separar motor e conteúdo (para outros sistemas): não feito.
- Homebrew em PDF para o Discord: não feito (só quando você pedir).
- Submarino (LJ p. 318): não existe.
- Resumo automático de lore: impossível sem IA paga. Mande o PDF no chat.

## Arquivos
- `Mesa_One_Piece_site.zip`: o site para o Netlify.
- Prévia: o mesmo Artifact de antes, atualizado (sem o texto dos livros, por causa do tamanho: a busca do livro na prévia mostra só as regras prontas).
- GitHub `fenrirswinerd-lang/One-piece-rpg`: código, logs e o README atualizados.
