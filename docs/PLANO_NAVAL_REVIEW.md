# Revisão do naval e plano de mudanças (nada construído ainda)

Li o capítulo 13 (Tripulação) e o 14 (Embarcações) do Livro do Jogador, as profissões Carpinteiro e Engenheiro, e o código do site (Navio, Batalha naval, Viagem, Lojas, Tripulação).
**[LJ]** = vem do livro. **[NOSSO]** = ideia nossa; só entra se você aprovar.

## 1. O que o site já tem

- **Navio** (ficha): escolhe tamanho e madeira, e o site preenche PV, CR, BR e velocidade. Armas e cômodos são só lista de texto. Histórico de mudanças. O mestre pode deixar os jogadores mexerem.
- **Batalha naval** (a mais completa): mapa vivo, iniciativa, velocidade, virar, âncora, mastro, tiro com todos os canhões, colisão, arpão, eventos do mar, efeitos e sons.
- **Viagem**: teste de navegação por mar, clima, dias no mar, PV do navio.
- **Lojas**: catálogo com preços do livro, inclusive de navio.
- **Tripulação**: capitão, recompensa, textos. Sem funções nem efetivo.

## 2. O que o livro tem e o site NÃO usa (as lacunas)

1. **Construção por peças** [LJ 14.2]: madeira (200 a 800 peças por tamanho), fortificação de aço, casco de kairoseki, mastros (máximo por tamanho), leme (tora ou circular), âncora, 5 motores, canhões. Cada peça tem preço, custo de construção, tempo e CD. O site só tem "tamanho + madeira".
2. **Cômodos de verdade** [LJ 14.2]: 16 cômodos com benefício, custo, tempo e despesa semanal (enfermaria +5, biblioteca, sala de treino, cozinha +5 tripulantes…). Cômodo sem pagamento perde o benefício. No site hoje é texto livre.
3. **Navios prontos para comprar** [LJ 14.6]: Pequeno ฿ 10 mi até Colossal ฿ 200 mi, mais os da Marinha (Padrão, Batedor, Prisão, Batalha). O site só tem os preços soltos na loja.
4. **Tripulação e efetivo** [LJ 13.2–13.4]: funções (Comando, Combate, Manutenção), efetivo mínimo e necessário por tamanho para Navegação, Limpeza e Vigilância, artilheiro e rapaz da pólvora por canhão, cozinheiro por 50 pessoas, Skeleton Crew. **Nada disso existe no site.**
5. **Ações dos jogadores no navio** [LJ 14.3]: Proteger o Navio (+1 CR por pessoa, máx +3), Ajudante de Emergência, Reparo Emergencial do carpinteiro (30d10+50 PV paralelos), Homem das Armas (+3 nos tiros), manobras do Timoneiro. **Os jogadores quase não têm o que fazer** na batalha naval hoje; quem mexe é o mestre.
6. **Reparo e tempo** [LJ 14.3 + Carpinteiro]: tabela Navio Danificado (dias e custo por PV de cada madeira), Klabautermann. O site só mostra o texto do estado.
7. **Regras de batalha que faltam**: Canhão de Energia, Bombardeio e Tiros de Teste (mais de 3 canhões), Bola Acorrentada derrubando mastro, Estilhaços, Salvaguarda de Estrutura, resistência do aço temperado, âncora robusta e leme tora que quebra.
8. **Submarino e mini submarino** [LJ 14.5]: não existem.
9. **Dinheiro do bando**: não existe cofre. Preços aparecem, mas ninguém "paga".

## 3. Mudanças que eu faria (em blocos)

### Bloco A. Estaleiro: montar e dar upgrade [LJ + NOSSO]
- O navio passa a ser **montado por peças**: casco, madeira, fortificação, mastros, leme, âncora, motor, canhões, cômodos. Cada peça tem **comprar pronto** (preço cheio) ou **construir** (custo menor, mais dias, precisa de Carpinteiro ou Engenheiro).
- O site **calcula sozinho** CR, BR, PV, velocidade (mastros + motor − peso do navio − dano ± correnteza), máximo de canhões, cômodos e tripulantes. Hoje você digita.
- O site avisa quando a peça não cabe: "Navio Pequeno só leva 1 mastro", "Motor a vapor precisa de navio Grande e Sala das Máquinas".
- **Navios prontos** do livro: um botão "Comprar modelo".
- **Estaleiro por ilha** [NOSSO]: o mestre abre o estaleiro da ilha (como já abre uma loja). Preço pode variar por ilha.
- **Lista de desejos do bando** [NOSSO]: jogadores marcam o que querem comprar e quanto falta. O mestre vê.

### Bloco B. Banco do bando (cofre) [NOSSO, usa o livro]
- Saldo em Berries do bando. Entra: saque, recompensas, vendas. Sai: compras, obras, **despesas semanais dos cômodos**.
- Histórico com quem fez e quando. O mestre libera a aba quando a tripulação estiver pronta.
- **Jogador propõe, mestre aprova** (ou o mestre escolhe um limite que o jogador gasta sozinho).
- **Meta de upgrade**: barra "falta ฿ X para a Cerejeira".
- Despesa semanal com aviso; cômodo sem pagamento perde o benefício [LJ].

### Bloco C. Obras e profissões [LJ]
- **Fila de obras**: cada peça em construção mostra "pronta em N dias". Os dias andam com o relógio da Mesa e os dias de viagem.
- **Quem faz** a obra: Carpinteiro (madeira, mastros, leme, cômodos) ou Engenheiro (aço, motores, canhões, Sala das Máquinas, kairoseki, submarino).
- **Jogador faz o teste** (CD da peça) e o resultado conta. Ajudantes reduzem o tempo (−10% cada, máx −50%).
- **Bônus de profissão** aplicado sozinho: Carpinteiro reduz 40% dos custos extras; navio feito por ele ganha +12 nós e +3 CR (Eficácia).
- Sem Carpinteiro a bordo: contrata fora. O site mostra o custo e o prazo da tabela.

### Bloco D. Tripulação e funções [LJ]
- Quadro de **funções** (Comando, Combate, Manutenção) com os membros do bando e PdNs contratados. Limites do livro: até 3 funções, só 1 de comando.
- **Efetivo automático** por tamanho: "Navegação: precisa de 3, tem 2".
- **Efeito real** nas outras abas: sem o mínimo, o navio não manobra e o canhão sem artilheiro não atira; com o mínimo mas sem o necessário, vem a desvantagem do livro. Isso resolve o item "tripulação mínima" que estava pendente.
- Alimentação (1 cozinheiro por 50) e Skeleton Crew com aviso.

### Bloco E. Batalha naval com os jogadores dentro [NOSSO, regras LJ]
- Cada jogador escolhe um **posto** no navio (leme, canhão 2, vigia, reparo, proteção) e vê **os próprios botões** no celular: Proteger o Navio, Reparo Emergencial, Ajudar, Atirar com o canhão dele, manobras do Timoneiro.
- O mapa mostra **quem está em qual posto**.
- Dados de cada jogador saem do lugar dele (a roda da Mesa já faz isso).
- Regras do livro que faltam (item 7 acima), em ordem de importância: **Canhão de Energia** (baterias e gerador), **Bombardeio / Tiros de Teste**, **Bola Acorrentada**, **Estilhaços**, leme tora quebrando, Salvaguarda de Estrutura.

### Bloco F. Reparos, manutenção e vida a bordo [LJ + NOSSO]
- **Reparar**: tabela Navio Danificado (carpinteiro, dias e custo por PV de cada madeira) e reparo emergencial.
- **Klabautermann**: o mestre concede. Auto reparo e extra vida aplicados sozinhos.
- **Diário de bordo** e **estado do navio** visíveis para todos na Mesa (barra de PV do navio no quadro) [NOSSO].
- **Submarino e mini submarino**: só depois, se o bando quiser.

### Bloco G. Visual (sem exigir arte nova) [NOSSO]
- Montagem em **slots** (lista com ícones que já existem). Arte nova é opcional.
- O sprite do navio muda por tamanho e madeira (já existe). Se quiser, o Fable pode pedir **peças de pixel art** (mastro, vela com Jolly Roger, figura de proa) para você gerar depois.

## 4. Ordem e modelo

| Ordem | Bloco | Modelo |
|---|---|---|
| 1 | A (peças + cálculo) e D (funções e efetivo) | **Fable**. Mexe em muita regra e conta. |
| 2 | B (banco) e C (obras) | **Fable** |
| 3 | E (jogadores na batalha) e regras que faltam | **Fable** |
| 4 | F e G (reparo, visual, ajustes) | **Sonnet 5.5** |

Recomendação: **manter o nível alto (Fable)** nos blocos 1 a 3. Baixar para o Sonnet só no bloco 4.
Cada bloco sai com log (o que testar, resultado certo, o que não está pronto).

## 5. O que preciso que você decida antes

1. **Quanto do livro seguir?** (a) tudo, com preços e dias reais; (b) tudo, mas com preços e dias que o mestre pode editar; (c) versão simples (só peças e preço, sem dias).
2. **Dias de obra** contam de verdade (relógio da Mesa) ou o mestre só marca "pronto"?
3. **Banco**: jogador gasta sozinho até um limite, ou toda compra passa pelo mestre?
4. **Submarino**: entra agora, depois, ou nunca?
5. **Regras da casa [NOSSO]**: quais dos itens marcados você aprova? (estaleiro por ilha, lista de desejos, meta do banco, postos no navio, Klabautermann automático)
6. O navio é **um só do bando**, ou pode haver mais de um (frota, Comandante de Divisão)?

## 6. Pontos de atenção

- Algumas tabelas do livro se repetem com valores diferentes (o Resumo 14.7 usa preço por peça; o texto 14.2 também). O Fable confere página por página (LJ 308–322) antes de gravar os dados.
- Nenhuma regra de personagem de jogador será criada. Só navio, peças, PdNs e tabelas.
- Segue custo zero: tudo dentro do site, sem IA rodando nele.
