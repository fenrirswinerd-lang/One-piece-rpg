# Log: Versão 26 (a roda da mesa + série de prompts)

**Não precisa mexer nas regras do Firebase.** Suba o zip no Netlify e aperte Ctrl+F5.
Nenhuma regra ou conta do jogo mudou. Só aparece o que já era público (PV dos jogadores e de quem é a vez).

## 1. Lugares na mesa

Na borda de baixo do quadro ficam o **Mestre** e cada **jogador**: retrato, nome, barra de PV e a última rolagem.

Como testar: abra a Mesa como mestre e como jogador (dois aparelhos).

Resultado certo:
- Cada jogador aparece com o retrato dele. Quem está fora fica apagado.
- A barra de PV fica verde, amarela (metade) e vermelha (um quarto). A 0 PV o retrato escurece.
- O número pequeno em cima do retrato é a **última rolagem** de cada um. Dourado = 20 natural, vermelho = 1 natural.
- O seu lugar tem aro amarelo.

## 2. O dado sai do lugar de quem rolou

Resultado certo: quando alguém rola, o lugar dele sobe e brilha, e os dados entram na mesa por aquele ponto. A plaquinha com o total agora fica **em cima** (os lugares ficam embaixo).

## 3. Dado que fica na mesa

Depois da rolagem, um **retratinho da jogada** fica no canto de cima, à esquerda do quadro, com o total e o nome. Some na próxima rolagem, ou se você clicar nele.

## 4. Faixa de vez

Com um combate rodando (aba Combate → Começar combate), toda troca de turno mostra no quadro de todos: **"Vez de Fulano · Rodada N"**.

Resultado certo:
- O jogador da vez vê **"Sua vez!"** em verde e ouve um sino.
- Se ele estiver em outra aba do site, recebe um aviso "Sua vez!".
- O lugar de quem está na vez fica pulsando dourado.
- Quando a luta acaba: "Fim da luta".

## 5. Palco

Botão **⛶** no canto de cima, à direita do quadro. O quadro ocupa a tela inteira; dados, lugares, reações e faixa continuam funcionando. **Esc** ou o **✕** sai.

**Rolar dado no palco:** os botões d4, d6, d8, d10, d12, d20 e d100 ficam na lateral esquerda. O botão de baixo troca entre normal, vantagem e desvantagem (vale para o d20). Para mais de um dado, bônus ou rolagem secreta, saia do palco e use a janela Rolar dados.

## 6. Quadro maior e janela Música mais limpa

- Para o mestre em tela larga, o quadro nasce maior (as colunas do lado ficaram mais estreitas).
- Na janela Música, os ajustes foram para **⚙ Ajustes deste aparelho** (fechado por padrão). É lá que ficam: som ambiente, dados 3D, reações, **lugares no quadro** e, para o mestre, **Trocar o tampo**.
- As reações foram para a lateral direita do quadro.

Se você já arrumou as janelas do seu jeito, elas ficam como estavam. Para ver o tamanho novo: botão ☰ do quadro → "Voltar as janelas ao lugar de origem".

## 7. Série de prompts de arte

Arquivo **PROMPTS_DE_ARTE_V26.md**: 23 prompts em 5 grupos, com a "Mensagem 0" de estilo para colar primeiro e a ordem sugerida.
- A. Mesa: molduras dos lugares, faixa de vez, reações, dois tampos.
- B. Inimigos: Marinha (18 rostos), Piratas (18), governo e ciborgues (9), animais (30).
- C. Naval e mapa: mar, obstáculos, navio do bando, marcadores, chão de pedra e de grama.
- D. Efeitos animados: respingo e explosão.
- E. Geral: bandeira sem símbolo, paisagem de ilha.

O Ateliê ganhou dois tipos: **Tira de animação** e **Textura que repete**.

## 8. Base para outros sistemas

Arquivo **BASE_PARA_OUTROS_SISTEMAS.md** (também no Notion, como página privada): o que é motor genérico, o que é só de One Piece, e o plano em passos para um site de outro sistema ou um hub. É só anotação; nada foi construído.

## O que ainda NÃO está pronto

- **Não testei com Firebase de verdade**, só no modo de teste com abas. Teste lugares, faixa de vez e palco com jogadores reais.
- **Não ouvi os sons.** Conferi só que tocam sem erro.
- As artes dos prompts **não estão no site**: dependem de você gerar e me mandar. Até lá, molduras e faixa são desenhadas por código e as reações são emojis.
- O retratinho da jogada só aparece para quem estava na Mesa na hora, com os dados 3D ligados.
- A última rolagem no lugar mostra só as rolagens recentes carregadas na Mesa.
- No celular os lugares ficam pequenos (o quadro é estreito). Use o Palco.
- Continua pendente: auditoria das contas das regras, bandeja "Dados" do topo em 2D, mapa sem paredes e névoa, regras que faltam na naval.
