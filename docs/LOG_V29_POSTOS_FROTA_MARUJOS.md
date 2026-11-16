# Log: Versão 29 (postos na batalha, frota, marujos e correções)

**Não precisa mexer nas regras do Firebase.** Suba o zip no Netlify e aperte Ctrl+F5.

## 1. Bugs que você citou

**Janelas da Mesa que cresciam.** Achei dois defeitos:
- A janela só crescia e nunca encolhia. Abrir uma aba alta do Painel do mestre, abrir "Ajustes" da Música ou rolar vários dados deixava a janela enorme para sempre.
- Ao diminuir a janela do navegador, as janelas saíam da tela e ficavam bagunçadas.

Como testar: na Mesa, troque as abas do Painel do mestre, abra e feche "Ajustes deste aparelho", role 15 dados, diminua e aumente a janela do navegador.
Resultado certo: cada janela fica do tamanho do conteúdo (cresce e encolhe). O Histórico para em 300 px e rola por dentro. Ao mudar a largura do navegador, tudo se rearruma e cabe na tela. Janela que você esticou com a mão continua do tamanho que você deixou.

**Modificador no dado em tela cheia.** No Palco (botão ⛶ do quadro), embaixo dos dados tem **mod** com − e +. É o mesmo número da janela "Rolar dados".

**Coisas fora do lugar.** Passei um teste em todas as abas, em 5 larguras (celular até tela grande), mestre e jogador:
- **Menu do jogador**: com Navio e Banco, as abas não cabiam mais e as primeiras (Mesa, Personagem) ficavam fora da tela, sem como rolar. Corrigido. A aba aberta fica sempre à vista e a rodinha do mouse rola o menu.
- **Botão "FOGO!" do artilheiro** não clicava (conflito de nome com a animação de fogo). Corrigido.
- Jornal, Diário de bordo e barras de PV/PP do jogador saíam da tela no celular. Corrigido.
- Avisos de explicação apareciam dentro de uma moldura tracejada de "vazio" (Navio, Frota). Corrigido.
- Texto "canhãoões" no registro da batalha. Corrigido.

## 2. Jogadores na Batalha naval (postos)

Como testar: mestre liga **Mostrar esta aba para os jogadores**. Cada jogador abre Batalha naval e escolhe um posto.

| Posto | O que faz | Regra |
|---|---|---|
| Leme | Pede a manobra; você clica **Fazer** | LJ p. 314 |
| Canhões | Quando você clica Atirar, aparece **FOGO!** para ele rolar | LJ p. 315 |
| Homem das Armas | +3 nos tiros; também rola | LJ p. 299 |
| Reparos | Rola o Reparo Emergencial (Sabedoria CD 15) | LJ p. 140 |
| Proteger o navio | Nível 8+: +1 na CR, até +3 | LJ p. 314 |
| Vigia, Convés | Só marca onde está | |

Resultado certo: nada acontece no navio sem o seu clique. Se o artilheiro demorar, clique **Rolar pelo site**. Dá para desligar em "Os artilheiros a postos rolam os tiros".

Também entrou: **Canhão de Energia** atirando, **PV paralelos** valendo na batalha, **Puxar números das fichas**.

## 3. Frota (aba nova do mestre, junto de Batalha naval)

Uma linha por navio: nome, modelo do livro, lado, comandante. Sem ficha.
- **Pôr na batalha**: o navio entra na Batalha naval com os números do modelo.
- **Agir sozinho**: o navio de figurante vira, acelera, atira e passa a vez sozinho.
- **Guardar o PV**: traz o PV da batalha de volta para a linha.
- Navios **do bando** aparecem para os jogadores em Tripulação.

## 4. Pegada Black Flag (regra da casa)

**Mandar em missão** (navio do bando, na Frota): você escolhe os dias e a rota. O navio some e volta quando o relógio da Mesa chegar no dia. Na volta, **Ver como foi** rola um d20 e mostra os Berries. Você pode trocar o valor antes de **Guardar no Banco do bando**.

| Rota | Rende por dia (Pequeno → Colossal) | Dá problema com |
|---|---|---|
| Calma | ฿ 30 mil → 300 mil | 1 no d20 |
| Arriscada | o dobro | 1 a 5 |
| Perigosa | quatro vezes | 1 a 9 |

Problema: metade dos Berries e o navio perde PV. 20 no d20: o dobro.

**Marujos** (aba Tripulação, no fim): gente do convés, sem ficha.
- **+ Recrutar** e **Baixas** mexem nos números do efetivo.
- **Quem é esse marujo?** sorteia nome, função e um jeito, só para você improvisar uma conversa. Não guarda nada.
- **Fixar** guarda o marujo numa linha, com rosto. Continua sem ficha.

## Decisões que tomei (pode mandar trocar)

1. Os **números da missão são meus**, não do livro. São um ponto de partida.
2. A frase que aparece na volta da missão e o "jeito" do marujo são só **faíscas** de uma linha. Você conta do seu jeito.
3. Recrutar tem custo **0** por padrão (o livro não dá preço).
4. Marujo é número. Só vira nome quando você fixar.

## O que ainda NÃO está pronto

- **Não testei com Firebase de verdade**, só no modo de teste com várias abas.
- **Revisão das abas, aba de lore dos jogadores e resumo da sessão 1**: não comecei. Preciso das suas respostas em `REVISAO_ABAS_PLANO.md` (parte 5) e das suas anotações da sessão.
- **Submarino**: não existe.
- **Abordagem** (invadir o navio inimigo com os marujos): não existe. A luta no convés continua na aba Combate.
- O menu do jogador tem 12 abas. Cabe rolando, mas o ideal é enxugar na revisão das abas.
