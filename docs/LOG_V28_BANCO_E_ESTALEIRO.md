# Log: Versão 28 (Banco do bando, Estaleiro e Efetivo)

**Não precisa mexer nas regras do Firebase.** Suba o zip no Netlify e aperte Ctrl+F5.
O depósito e os pedidos de cada jogador ficam no documento dele; as saídas ficam com o mestre. Por isso as regras atuais já servem.

## 1. Banco do bando (aba nova)

Onde fica: para o mestre, junto de **Tripulação** e **Navio** (botões no topo). Para os jogadores, aba **Banco do bando**, trancada até você liberar em **Mesa → Painel do mestre → Comando**.

Como testar:
1. Mestre: abra o Banco, escreva um valor e um motivo em **Entrada e saída** e clique **Entrou**.
2. Mestre: escreva uma **Meta do bando** (nome e valor).
3. Libere "Banco do bando" e "Navio" para os jogadores.
4. Jogador: em **Depositar**, clique **50%** e **Depositar**.
5. Jogador: em **Pedir um gasto**, escreva valor e motivo.
6. Mestre: em **Pedidos do bando**, clique **Aprovar**.

Resultado certo:
- O depósito **sai da Carteira** do Inventário do jogador (fica anotado nos gastos dele) e entra no cofre.
- O cofre mostra o saldo, a barra da meta ("faltam ฿ X"), quem depositou quanto e o histórico.
- O jogador **não tira** dinheiro do cofre. Ele pede; você aprova ou recusa. Você recebe um aviso quando chega pedido.

## 2. Estaleiro: navio por peças (aba Navio)

Como ligar: aba **Navio** → **Montar por peças**. O site parte do modelo do livro para o tamanho atual e passa a **calcular sozinho** CR, BR, PV e velocidade.

O que tem (preços, tempos e limites do Livro do Jogador, cap. 14):
- **Navio pronto**: Pequeno ฿ 10 mi até Colossal ฿ 200 mi. Os 4 da Marinha só o mestre põe (sem preço no livro).
- **Casco**: madeira (Cedro, Carvalho, Cerejeira, Adam), fortificação de aço, kairoseki.
- **Velas e manejo**: mastros, leme, âncora. **Motor**: manual, vapor, combustão, turbina, jato.
- **Canhões**: os 5 canhões, arpão e bola acorrentada. **Cômodos**: os 15 do livro, com benefício e despesa semanal.

Como testar:
1. Mestre com saldo no banco: abra **Canhões** → **Comprar** um Canhão Comum.
2. Abra **Cômodos** → **Construir** uma Cozinha.
3. Jogador: no Estaleiro, clique **Pedir**. Mestre: aprove.
4. Em **Obras em andamento**, clique **Terminar agora** (ou avance o relógio da Mesa).

Resultado certo:
- **Comprar** instala na hora e tira do banco. **Construir** custa menos, entra na fila de obras e fica pronto no dia marcado (anda com o relógio da Mesa).
- Sem saldo, o site avisa quanto falta e não compra.
- O que não cabe fica cinza com o motivo ("Só para navio Grande ou maior", "Já tem 3 canhões, o máximo").
- Canhões "2 de 3", Cômodos "1 de 4", "Cabem a bordo 25" (a Cozinha dá +5).
- A Batalha naval e a Viagem continuam usando os números do navio, agora calculados.

Chaves do mestre no Estaleiro: **Cobrar do banco** (desligue para dar algo de presente), **Ajudantes na obra** (cada um tira 10% do tempo, até 50%) e **Ajustes do mestre** (tamanho, madeira, ± em CR/BR/PV/nós, Eficácia do Carpinteiro, Klabautermann).

Conferi a conta com os **9 navios do livro**: os 9 batem em CR, BR, PV e velocidade.

## 3. Despesas, conserto e reparo

- **Despesas dos cômodos**: total por semana e botão **Pagar a semana**. Atrasou, os cômodos aparecem "sem benefício" (LJ p. 312).
- **Conserto**: com o navio danificado, o site mostra o preço e o prazo com o Carpinteiro do bando (LJ p. 140) e num estaleiro contratado (LJ p. 317). Vira uma obra.
- **Reparo Emergencial**: 30d10 + 50 PV paralelos, que apanham primeiro e somem em 2d6 dias.
- **Klabautermann**: botão "Fim do dia" conserta 50 PV por categoria de tamanho.

## 4. Funções e efetivo (aba Tripulação)

No fim da aba: **Controlar o efetivo**. Você escreve quantos tripulantes cuidam de Navegação, Limpeza, Vigilância, Artilharia, pólvora e cozinha.

Resultado certo: cada linha fica verde, amarela ou vermelha, com o efeito do livro (LJ p. 300). O aviso também aparece na aba Navio e, para o mestre, no topo da Batalha naval.

## Decisões que tomei (você pode mandar trocar)

1. **Depósito livre**: o jogador deposita quanto quiser, quando quiser. Não há porcentagem obrigatória.
2. **Toda saída passa pelo mestre.** Jogador só pede.
3. **Preços e dias do livro**, com as chaves do mestre para ajustar.
4. **Trocar a madeira = refazer o casco** (peças do tamanho × preço da madeira, nos dias de construção do tamanho). O livro não diz como trocar madeira de navio pronto.
5. Casco, fortificação, kairoseki e cômodos só têm **Construir** (o livro só dá custo e tempo). O mestre pode terminar na hora.
6. Navio pronto com motor já vem com a **Sala das Máquinas**.
7. O **efetivo só avisa**, não trava botão nenhum. Você decide na mesa.
8. Dois modelos do livro não batem com a soma das peças (Médio: livro 12 nós, soma 14; Navio de Batalha: livro 24, soma 16). Usei o número impresso.

## O que ainda NÃO está pronto

- **Não testei com Firebase de verdade**, só no modo de teste com abas.
- **Frotas e figurantes**: não comecei. Preciso das suas escolhas em `HOMEBREW_FROTA_FAISCAS.md`.
- **Jogadores agindo na Batalha naval** (postos, Proteger o Navio, canhão de cada um): não feito.
- **Regras de batalha que faltam**: Canhão de Energia atirando, Bombardeio, Tiros de Teste, Bola Acorrentada e Estilhaços na batalha. Hoje dá para comprar, mas a batalha ainda não usa.
- Os **PV paralelos** valem na aba Navio. A Batalha naval ainda não desconta deles.
- **Submarino**: não existe.
- **Revisão das abas, aba de lore dos jogadores e resumo da sessão 1**: não comecei.
- Contratar tripulante não tem preço no capítulo 13. Use "Pedir um gasto" ou a saída do mestre.
- Navio que já existia continua como estava até você clicar **Montar por peças**.
