# Plano organizado (para o último dia de Fable)

Só organização. Nada abaixo foi feito ainda.

## 0. Problemas que você apontou
- **Resumo da lore errado (Roman).** Causa: o "Resumo leve" não entende o texto. Ele pega as frases com palavras que mais se repetem. Por isso pegou "Os pais eram Heróis!", que é a mentira do tio Bob. Não tem como o site entender história sem IA.
  - Correção: tirar o nome "Resumo". O campo principal passa a ser **"Resumo do mestre"**, escrito por você, por jogador. O automático vira "Trechos do texto" (opcional, escondido).
  - Resumo certo do Roman, para você colar: tontatta de Green Bit, criado pelo tio Bob depois que os pais (Bonnie e Clyde, ladrões) o largaram; fugiu para Dressrosa aos 10, passou fome, virou discípulo do cozinheiro Morita Jin (restaurante Kuro Nami), aprendeu a cozinhar e a lutar com katanas, chama Jin de pai, sonha em "cortar a fome do mundo".
- **Fotos dos jogadores minimizadas.** Na imagem que você mandou, os nomes aparecem cortados embaixo e o rosto fora do centro. Eu testei em 1500, 390 e Palco, mas não nessa faixa baixa (cerca de 900 x 300). Primeiro passo: reproduzir nesse tamanho e consertar. Também pode ser a miniatura da prévia cortando a página; vou separar uma coisa da outra.

## 1. Suas decisões, arrumadas

| Tema | Decisão |
|---|---|
| Enxugar abas | Só polir e esconder repetidas (com botão para abrir). Nada de juntar tudo em abas-dentro-de-abas. |
| Diários (sessão e de bordo) | Não tirar nada. Só polir. |
| Cartaz de Procurado | Já existe. Só polir. |
| Novidades para os players | Sim, dentro do site (patch notes). Só o que muda para eles. |
| Cartão de título | Sim, opcional: nome do arco ou da sessão, quando você quiser. |
| Chegada em ilha | Sim, com **caixa para ligar ou desligar a arte** em cada ilha. |
| Abordagem, moral, marujo que vira gente | Ficam **dentro** da Batalha naval e da Tripulação, como **recursos que você desbloqueia**. |
| Marujo (figurante) | Sem ficha, ao fundo. PDM canônico (como o Gen) continua sendo outra coisa: tem ficha e é seu. |
| Frota estilo Kid e Barba Branca | Bando protagonista, mas pode crescer e ter frotas que rendem recursos de forma passiva. |
| 3D | Só no futuro. |
| Resumo da sessão | Você escreve e edita; **os jogadores leem** no site. |
| Base para outros sistemas | Separar motor de conteúdo, sem reescrever tudo. |
| PDF da homebrew | No fim, para o Discord. |

## 2. Ordem sugerida
**Fable alto (regra pesada):**
1. Foto dos jogadores no tamanho baixo e resumo do mestre por jogador (rápidos).
2. Desbloqueáveis do mestre: moral, abordagem, marujo que vira gente (um painel de chaves).
3. Frota passiva e crescimento (recursos, expansão, frotas do bando).
4. Teste com Firebase de verdade.
5. Separar motor de conteúdo.

**Sonnet (tela, texto):**
6. Novidades dentro do site.
7. Resumo da sessão (você escreve, players leem).
8. Cartão de título e chegada em ilha com caixa de arte.
9. Esconder abas repetidas.
10. PDF da homebrew, no fim.

## 3. Graphify e a "segunda cabeça"
- O Graphify lê **repositórios do GitHub** que você autoriza. Nesta conversa, ele não tem nenhum. Por isso falhou.
- Melhor jeito: um repositório **privado** no GitHub com duas pastas: `site/` (o código) e `lore/` (arquivos .md). Você conecta o repositório ao Graphify. Aí qualquer conversa com Graphify enxerga os dois.
- Alternativa sem GitHub: pasta no PC, ligada pelo app de desktop. Funciona para eu ler arquivos, mas **não** alimenta o Graphify.
- Não consegui abrir a ajuda do Graphify para ver o plano e os limites. Confirme lá se o plano é grátis.
- Obsidian não precisa. Os .md da pasta `lore/` abrem no Obsidian se você quiser, sem custo.

## 4. Ligar este chat ao chat "RPG One Piece World Building"
- Um "mod" só muda a aparência e os comandos desta conversa (painel, comando, tema). **Não liga dois chats.** E ele vive no contêiner, que some.
- O que realmente liga: um arquivo **PONTE.md** no repositório (lore decidida, regras da casa, o que mudou) e as notas do Graphify (`remember` e `recall`) no mesmo repositório. Os dois chats leem e escrevem ali.
- Se quiser, depois eu faço um mod pequeno só com um comando `/ponte` que mostra o PONTE.md. Mas não resolve a ligação sozinho.

## 5. Para você fazer
1. Criar o repositório privado no GitHub e conectar ao Graphify.
2. Mandar a lore dos outros jogadores (como o PDF do Roman) e as anotações da sessão 1.
3. Dizer qual modelo usar em cada bloco da seção 2.
