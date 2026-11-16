# Log: Batalha naval viva (Versão 24)

Só mudou o que se **vê e ouve**. Nenhuma regra, conta ou dado foi alterado. Não precisa mexer no Firebase.

## O que mudou

1. **Mar vivo.** As ondas se mexem em duas camadas. O mar acompanha a **hora e o clima da Mesa**:
   noite (escuro, com lanternas nos navios), pôr do sol, amanhecer, **tempestade** (chuva, raio, ondas rápidas), **neblina** (névoa passando), neve e calmaria.
2. **Navios com vida.** Balançam na água e **navegam** de um ponto ao outro (antes pulavam). Abaixo de metade do PV soltam **fumaça**; abaixo de um quarto, **fogo** e fumaça preta; a 0 PV, borbulham e adernam.
3. **Tiro completo, para todos.** Clarão, fumaça na boca do canhão, bala voando, explosão ou respingo, **número do dano** subindo ("−27", "CRÍTICO −54", "água!") e o mapa **treme** no impacto. Agora os **jogadores também veem** os efeitos (antes só o mestre).
4. **Sons da batalha** (feitos pelo próprio site, sem arquivo): canhão, impacto na madeira, crítico, respingo, arpão, corrente, mastro quebrando, colisão, navio afundando, sino de rodada. Seguem o **volume de efeitos** da Mesa e o "Silenciar efeitos".
5. **Faixas no mapa:** "Às armas!", "Rodada 2", "Fragata foi a pique!", nome do evento do mar.
6. **Modo cinema** (botão no topo da aba): o mapa ocupa a tela inteira, com a última ação como legenda. Sai com Esc. Bom para os jogadores.

## O que testar

1. **Batalha naval** → ponha 2 navios, aproxime, role iniciativa, atire. Resultado certo: efeitos e sons no seu aparelho.
2. Marque **Mostrar esta aba para os jogadores** e abra como jogador em outro aparelho. Resultado certo: ele vê o tiro, o número de dano e ouve o canhão (menos de 1 segundo depois).
3. Na **Mesa → Painel do mestre → Tempo**, troque o clima para Tempestade e volte à naval. Resultado certo: mapa escuro, chuva, raio de vez em quando.
4. Tire PV de um navio até metade e até um quarto. Resultado certo: fumaça, depois fogo.
5. **Próximo turno**: o navio desliza até a posição nova.
6. **Modo cinema** e Esc.
7. Caixa **Sons da batalha**: desmarcar cala só no seu aparelho.

## O que ainda NÃO está pronto / limites

- **Não ouvi os sons** (aqui não tenho alto-falante). Conferi que os 12 tocam sem erro. Se algum estiver feio ou alto demais, me diga qual.
- O som só toca depois do primeiro clique na página (regra do navegador) e com o som do topo ligado.
- Quem estiver em **outra aba** na hora do tiro não vê nem ouve o efeito (não acumula para tocar depois).
- Navio parado (PV baixo ou âncora) não desliza, porque não anda.
- Continua faltando da lista antiga: imagem do navio do bando, Canhão de Energia, tripulação mínima, Reparo Emergencial.
