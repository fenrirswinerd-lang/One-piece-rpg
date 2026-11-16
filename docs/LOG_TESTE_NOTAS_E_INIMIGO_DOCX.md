# O que mudou e como testar (10/11)

## 1. Anotações do inventário (passe o mouse na planilha)
- Se a anotação de um item for uma **lista** (uma linha por item, peso opcional, ex.: `kit de cozinha- 4kg`), o site entende que esses itens estão **dentro** dele.
- **Mestre** › Grupo › ficha › Armas e inventário: a mochila aparece com as linhas "↳ dentro (anotação)" embaixo.
  - Certo (Tontata): mochila 6,5 kg e, dentro, livros gastronômicos, receitas e nutrição, kit de cozinha 4 kg, kits de temperos 1,5 kg, roupa de gala 1 kg. Carga continua 7,1 / 60.
- **Jogador** › Personagem › Inventário › "Trazer itens, armas e dinheiro da ficha": a mochila vira recipiente com os 5 itens dentro.
  - O total bate com a ficha: a mochila fica com 0 kg, porque os 6,5 kg são o que tem dentro. O site sugere "Livro: 1 kg" para a mochila: use só se quiser contar o peso dela.
  - Itens sem peso na anotação (livros) ficam com 0 kg e o site mostra o peso do livro para você escolher.
- Anotação de texto corrido (regra copiada) não vira lista: vira só nota do item.

**Não está pronto / limite:** pelo **link do Google** as anotações **não chegam** (o Google não manda anotação). Para ler a mochila por dentro, a ficha tem que entrar pelo **arquivo .xlsx**.

## 2. Ficha de inimigo em .docx
- Inimigos › **Importar ficha (.docx)**. Pode escolher vários arquivos de uma vez.
- Abre uma conferência antes de guardar. Certo (modelo Almirante de Frota): ND 22, 25.000 XP, 88 PP, CR 25, PV 862 (75d12+375), CD 23, Prof +7, 15 m, Nado 15 m, os 6 atributos e 5 ataques com botão de rolar.
- Guardado vai para **Minhas criaturas**, com as seções (Características, Aspectos, Ações, Ações Bônus, Reações, Ações Poderosas, Ações Lendárias) e botões "rolar ataque / rolar dano". Dá para pôr no encontro e na luta.
- Cada tabela do Word com "Nível de Desafio" vira um inimigo.

**Não está pronto:** técnicas em área (ex.: Onda de Choque, dano com salvaguarda) aparecem no texto, mas não ganham botão de rolar, só as que têm "+X para atingir". O retrato é escolhido sozinho pelo tipo.

## Testes feitos
- Ficha do Tontata pelo .xlsx (mestre e jogador), docx do Almirante de Frota, inimigo levado para a luta: sem erros.
- Regressão geral (l12): TUDO OK.

## 3. Cartazes de quem saiu (12h30)
- **Recompensas** agora só mostra quem ainda está na mesa (quem você tirou em Ajustes some daqui e não conta no total do bando).
- Botões novos em Recompensas e no Mural: **Tirar do mural quem saiu da mesa** e **Limpar o mural todo** (pede confirmação; as recompensas continuam salvas, dá para pregar de novo).
- Ajustes › "apagar dados" de quem saiu agora também tira o cartaz e a recompensa dele.
- Teste feito: pregar cartaz, limpar quem saiu (avisa que não tem ninguém), limpar tudo (mural vazio). Regressão geral: TUDO OK.
- **Para o seu caso agora:** abra Recompensas (ou o Mural) e clique em "Tirar do mural quem saiu da mesa". Se ainda sobrar algo, "Limpar o mural todo".
