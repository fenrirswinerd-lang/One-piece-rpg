# Log de teste: imagem própria nos PdN (retrato)

## O que mudou
- Na janela de ficha de qualquer personagem (Fichas do mestre › clicar no cartão, ou Grupo › clicar no cartaz), o bloco **Retrato** ganhou **"Enviar minha imagem"**. Serve para PdN (como o Gen), aliados e jogadores.
- A imagem fica guardada na mesa e aparece em todo lugar onde o retrato aparece: Fichas do mestre, Grupo (cartaz), Combate e tela dos jogadores.
- **Trocar a imagem** e **Tirar a imagem** também estão lá. Ao trocar ou tirar, a imagem velha é apagada do banco (não gasta espaço).
- Os retratos prontos continuam funcionando; escolher um deles tira a imagem enviada.
- Corrigido junto: ao trocar o retrato, a janela reabria e apagava o nome que você tinha acabado de digitar. Agora guarda antes.

## O que testar
1. Fichas do mestre › Nova ficha (ou clique no cartão do Gen) › Retrato › **Enviar minha imagem** › escolha o PNG do Gen. A prévia mostra a imagem.
2. Salvar. O cartão do Gen mostra a imagem. Ponha o Gen no Grupo e confira o cartaz e o Combate.
3. Reabra, clique em **Tirar a imagem**: volta para as iniciais.
4. Escolha um retrato pronto: continua funcionando.

## Resultado certo
- A imagem aparece cortada em quadrado (centralizada) nos cartões pequenos; na prévia da janela aparece inteira em 96 px.
- Sem erros; o nome digitado não some ao enviar a imagem.

## Limites e o que não está pronto
- A imagem é reduzida para no máximo 640 px (arquivos pequenos entram como estão, sem perder nitidez). Pixel art grande pode ficar um pouco suavizada.
- Só PdN, aliados e jogadores têm o envio. **Inimigos do catálogo** (aba Inimigos) ainda usam só os retratos prontos. Se quiser a mesma coisa lá, é o próximo passo.
- O arquivo enviado conta no espaço do banco; apagar o PdN não apaga a imagem dele (só trocar ou tirar apaga).
