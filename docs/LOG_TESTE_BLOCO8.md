# Log de teste: Bloco 8 (Enfeites)

Tudo abaixo já foi testado por mim num navegador de teste (mestre e jogador, computador e celular). O que falta é você ver com os olhos e ouvir com os ouvidos.

## 1. Dado 3D (d20)
**Como testar:** entre na Mesa, role um d20 pela bandeja "Rolar dados" (clique em d20).
**O certo:**
- O dado de 20 lados entra pela esquerda, quica, gira e para com um número de frente. O número que ele mostra é o mesmo da rolagem (o histórico confirma).
- Se a rolagem tem bônus (ex.: d20+5), aparece "= total" embaixo do dado.
- 20 natural: dado com brilho dourado e estrela. 1 natural: brilho vermelho.
- Cada jogador tem uma cor de dado (marfim, azul, verde, rosa, roxo, amarelo...).
- **Todo mundo vê a mesma face e o mesmo giro**: o resultado já vem gravado e o giro é sorteado a partir da hora da rolagem. Teste com duas abas (mestre e jogador).
- Só d20 é 3D. d4, d6, d8, d10, d12, d100 e contas como 2d6+1 continuam com o dado 2D de antes.
**Reserva:** painel "Música" (lado direito da Mesa) → "Neste aparelho" → desmarque "Dado 3D na mesa" e o dado 2D volta. Aparelho sem WebGL ou com "reduzir movimento" ligado: sem giro, o dado já aparece parado no número certo (reduzir movimento) ou usa o 2D (sem WebGL).
**Não está pronto:** d4/d6/d8/d10/d12 em 3D (combinado: d20 primeiro). A física não foi feita de propósito, porque diverge entre aparelhos.

## 2. Som ambiente por cena
**Como testar:** painel "Música" → "Neste aparelho" → marque "Som ambiente da cena". Tem que ter clicado em algo na página antes (regra do navegador).
**O certo:**
- Vem **desligado** para todo mundo. Cada pessoa liga no próprio aparelho, com seu próprio volume.
- O som segue o relógio e o clima do mestre: dia = ondas e gaivotas de vez em quando; noite = ondas baixas e grilos; tempestade = chuva, vento e trovão distante; neblina e calmaria = ondas baixas; neve = vento.
- O botão de som geral do topo (nota musical) cala o ambiente também.
- É sintetizado (sem arquivos), então é simples: ondas, chuva, vento e grilos de brinquedo. Se quiser sons reais gravados, é só me mandar os arquivos.
**Não está pronto:** sons por ilha ou por cena de imagem do mestre (só relógio e clima por enquanto).

## 3. Fita (marcador) que balança
**Onde:** na tela Diário (fita vermelha pendurada na borda do cabeçalho) e no Combate (fita na linha de quem está na vez).
**O certo:** balança devagar para os lados; com "reduzir movimento" ligado, fica parada.
**Dúvida minha:** não ficou claro o que era "animação do marcador". Entendi como a peça `marcador` (fita) do kit de interface. Se você queria outra coisa (ex.: marcador de vez com outro desenho), me diga.

## O que ainda não tem lugar na tela
Barras de Haki e de fama, etiqueta de couro e carimbo vazio continuam guardados no site sem uso.

## Lembrete
As regras do Firestore do diário do capitão precisam ser publicadas à mão no console do Firebase (já avisado antes).
