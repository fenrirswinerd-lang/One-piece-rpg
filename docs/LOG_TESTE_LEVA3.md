# Log de teste: Leva 3 (fundos, frutas, estilos, Oni)

## O que testar (como mestre)
1. **Mural** (#mural): vazio mostra um papel preso balançando. Prenda 2 ou 3 cartazes de NPC (use os retratos de Oni e minks no seletor). A moldura de madeira com cantoneiras de ferro deve cercar os cartazes, que balançam de leve. Fundo = praça do porto.
2. **Catálogo** (#catalogo): cada fruta e cada estilo tem ícone próprio. Revele uma fruta ("Com técnicas" ou "Só a ideia"): aparece o aviso "Akuma no Mi descoberta" com a fruta verde flutuando. Abra a fruta: faixa com a cena do poder no topo.
3. **Tabelas do Narrador** (#tabelas): role "Eventos que abalam o mundo". O jornal entra girando, uma vez só, no canto do resultado.
4. **Recompensas**: fundo novo (escritório da Marinha).
5. **Grupo**: carregue a Amy de exemplo e clique na exaustão. Os pinos acendem em laranja.
6. **Navio**: a barra de PV do casco agora é de madeira com tábuas.
7. **Celular**: abra Mural, Catálogo, Tabelas, Recompensas e Navio. Nada deve rolar para o lado.

## O que está certo (testado)
Todos os testes automáticos passam, sem erro de JavaScript: telas do mestre (27) e do jogador (10), inventário, mural, lore, catálogo, link das fichas e o teste novo desta leva.

## O que não está pronto
- Barras de Haki e de fama, etiqueta de couro, marcador de página e carimbo: as imagens já entraram no site, mas ainda não têm lugar na tela.
- Faltam imagens: retratos de NPC (retratos2.png), textura do mural, Jones e Billy (opcionais).
- O cartaz animado ao vento é um papel liso, sem "WANTED". Por isso ele aparece só no mural vazio. Os cartazes de verdade balançam por código.
- Bloco 8 ainda não feito: dado 3D, animação do marcador, som ambiente desligado por padrão.
- A prévia aqui no Claude não baixa arquivos (backup e PDF). Isso funciona no site da Netlify.
