# Log: Versão 31 (marujos de verdade, funções e efetivo, retoques)

**Não precisa mexer nas regras do Firebase.** Suba o zip no Netlify e aperte Ctrl+F5.
Testado no modo de teste (sem Firebase de verdade), mestre e jogador, 5 larguras, tema claro e escuro: 0 erros no console.

## 1. Retoques que você pediu
- **Aba Navio:** as etiquetas Pequeno e Cedro estavam ilegíveis no tema escuro. Corrigido.
- **Loja aberta na Mesa:** o ícone saiu de cima dos quadrados. Agora é um botão no cabeçalho.
- **Update log:** novo visual (selo de versão, destaque, etiquetas Novo / Ajuste / Corrigido, emojis). Para escrever o próximo: `## Versão 32 · Nome` no topo de `src/novidades.md`, itens com `- [novo] texto`, e rode o build.

## 2. Funções e efetivo (Tripulação)
**A ideia:** o protagonista **é o dono da função** que a ficha dele diz. O marujo **completa** o número que o navio pede, não toma o lugar.
- Cada jogador entra pela **profissão** (Cozinheiro → Cozinha; Navegador/Timoneiro → Navegação). O mestre muda em **Quem faz o quê** (até 3 funções; só 1 de comando).
  - 2 funções: não treina na viagem. 3 funções: não exerce a profissão (LJ p. 299).
- O navio pede **mais gente quanto maior ele é** (LJ p. 300). O quadro mostra **Tem / Mínimo / Necessário** e o efeito se faltar.
  - Pequeno: o bando sozinho fecha quase tudo. Médio pede 7 vagas mínimas, Grande 13. As que o bando não cobre são dos marujos.
- **Completar com marujos** (mestre): preenche do mínimo ou até o completo. O livro não dá preço de contratação; o custo é opcional.
- Jogador só vê, não edita.
- No celular a tabela vira cartões (cada função, uma caixa).

**Como testar:** Tripulação › **Controlar o efetivo**. Troque o tamanho do navio (aba Navio) entre Pequeno, Médio e Grande e veja o mínimo mudar. Marque 3 funções num jogador e veja o aviso. Clique **Completar com marujos**.
**Resultado certo (Médio, 1 cozinheiro):** "Faltam 6 vagas"; Cozinha mostra ★ nome e "Completo". Depois de completar: "O mínimo está coberto".

**MUDANÇA IMPORTANTE:** os números por função (`efe.nav`, `limp`...) agora contam **só marujos**. `tot` continua sendo todo mundo a bordo. Quem já tinha efetivo ligado deve conferir os números.

## 3. O que os marujos mudam na prática
| Onde | Efeito |
|---|---|
| Navio principal: efetivo | Falta de gente por função dá os efeitos do livro (navio não navega, Doente, infiltração). **É só texto/aviso; o site não aplica sozinho.** |
| Lotação | Aviso se passar do que cabe. |
| Recrutar | Sai do Banco do bando (se você cobrar). |
| Abordagem | Nosso lado = a bordo − protagonistas. Baixas saem do efetivo; moral ±1. |
| Rota fixa | Usa a moral, não a quantidade. |
| Frota (outros navios) | **Abstratos.** Não gastam marujos do principal. Rendimento pelo tamanho e risco. |
| Recursos / missões | Marujo **não produz sozinho**. Quem rende é a frota, rota fixa e missão. |

## O que NÃO está pronto
- Nunca testado com Firebase de verdade (só modo de teste).
- Os postos da Batalha naval **não** preenchem as funções sozinhos (o mestre marca em Quem faz o quê).
- A abordagem não olha a função de quem luta (só a quantidade).
- Os números da abordagem e da rota fixa são ponto de partida, não regra do livro.
- Marujo da frota não tem efetivo próprio (de propósito: fica abstrato).
- Resumo automático de lore: impossível sem IA paga.
