# Log: Versão 25 (dados com física, mesa viva, mapa simples, Ateliê preciso)

**Não precisa mexer nas regras do Firebase.** Suba o zip no Netlify e aperte Ctrl+F5.
Nenhuma regra ou conta do jogo mudou: o número do dado continua saindo da mesma rolagem de antes.

## 1. Dados 3D com física (Mesa)

O quadro vira uma mesa de madeira. Os dados são jogados, quicam, batem uns nos outros e param. No fim a câmera chega perto para ler.

Como testar:
1. Abra a **Mesa** e clique num dado (d4, d6, d8, d10, d12, d20, d100).
2. Mude a quantidade (ex.: 8d6) e role.
3. Role d20 com **vantagem**.
4. Abra como jogador em outro aparelho e role.

Resultado certo:
- O número na plaquinha é o mesmo que aparece na face de cima de cada dado.
- Vantagem/desvantagem: caem dois d20, o que não vale fica escuro.
- d100: caem dois d10 (dezena colorida, unidade clara).
- 20 natural: dado brilha dourado e o quadro treme. 1 natural: brilha vermelho.
- Dado do mestre é vermelho. Cada jogador tem a sua cor e joga de um lado da mesa.
- Todos veem a mesma jogada.
- Som de dado batendo na madeira (segue o volume de Efeitos).

**Trocar o tampo da mesa** (só o mestre): janela **Música → Mesa dos dados → Trocar o tampo**. Envie uma imagem vista de cima (o Ateliê tem o tipo "Tampo da mesa de dados"). Vale para todos. **Voltar à madeira** desfaz. **Jogar dados de teste** rola vários de uma vez.

Desligar: **Música → Neste aparelho → Dados 3D com física**. Volta o dado antigo.

## 2. Reações na Mesa

Seis botões no canto de baixo do quadro: 👏 😂 😱 🔥 💀 🍖. Quem clica solta um balão que sobe na tela de todos, com o nome.

Resultado certo: o balão aparece para o mestre e para os jogadores em menos de 1 segundo. Dá para desligar em **Música → Neste aparelho → Reações no quadro**.

## 3. Mapa de combate mais simples

- Funciona **sem imagem nenhuma**. Em **Chão e tamanho do mapa** escolha o chão: Pergaminho, Convés, Areia, Grama, Pedra, Neve, Noite, Mar raso.
- Tamanhos prontos: Pequeno, Médio, Grande, Enorme. O mapa novo já nasce Médio (fichas maiores).
- **Tamanho da ficha automático**: inimigo Grande entra 2×2, Enorme 3×3, Imenso/Colossal 4×4 (lido do Manual dos Inimigos).

Como testar: ponha um King Bull na luta, abra o Mapa, clique **Pôr todos no mapa**. Resultado certo: a ficha dele ocupa 3×3.

## 4. Ateliê de arte mais preciso

- **Puxar do site**: nos tipos de gente (retrato, cartaz, token) e de ilha, escolha um inimigo, ficha do mestre, NPC ou ilha. O Ateliê preenche os detalhes com o que a ficha diz (nome, tamanho, armas, descrição).
- **Lote**: um botão gera os prompts de todos os inimigos da luta, de todos os NPCs do Mundo ou de todas as ilhas.
- **Tipos novos**: Paisagem de ilha (chegada), Tampo da mesa de dados, Sprite para enfeitar o site, Folha de sprites (um por linha, até 16).

Resultado certo: o prompt sai em inglês com o estilo do site, e o que veio da ficha vai junto em português.

## 5. Sprites para você gerar

Arquivo **SPRITES_PARA_O_SITE.md**: 6 prompts prontos do que eu acho que mais melhora o visual.
1. Ícones das reações (trocam os emojis).
2. Patentes da Marinha (hoje todos têm o mesmo rosto).
3. Piratas (9 rostos).
4. Marcadores do mapa (barril, caixote, fogueira…).
5. Tampo da mesa de dados (você mesmo põe).
6. Paisagem de ilha (você mesmo põe).

Os pacotes 1 a 4: gere, me mande a imagem e eu recorto e coloco no site.

## 6. Bugs

Passei dois testes automáticos no site inteiro (mestre e jogador, tema claro e escuro): abrir as 27 abas e clicar em todos os botões. **Nenhum erro apareceu.** Não achei bug novo para corrigir.

## O que ainda NÃO está pronto

- **Não testei com Firebase de verdade**, só no modo de teste com duas abas. Teste a rolagem e a reação com um jogador real.
- **Não ouvi os sons** do dado. Conferi só que tocam sem erro.
- Os sprites dos pacotes 1 a 4 **ainda não estão no site**: dependem de você gerar as imagens.
- Dado com física vale para até 12 dados e para d2, d3, d4, d6, d8, d10, d12, d20, d100. Fora disso (ex.: 20d6) cai no dado antigo.
- No primeiro acesso, o motor do dado (560 KB) baixa quando a Mesa abre. Se alguém rolar antes de terminar, essa rolagem sai com o dado antigo.
- A bandeja "Dados" do topo (rolagem particular) continua 2D.
- Mapa: continua sem paredes, névoa e terreno difícil automático.
- A auditoria das **contas das regras** (ficha, dano, CD) não foi feita. Só a varredura de erros.
- Continua da lista antiga: naval (Canhão de Energia, tripulação mínima, Reparo Emergencial, navio do bando), catálogo de inimigos, fichas de Elias/Billy/Grisk/Kaolin.
