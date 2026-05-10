Objetivo: fazer o botão “Abrir questionário” realmente abrir a tela com as perguntas.

Plano
1. Corrigir a estrutura de rota do questionário
- Ajustar a organização para que a página do questionário seja renderizada corretamente ao acessar `/dashboard/questionario`.
- Evitar que a rota fique bloqueada por uma página pai sem área de renderização para rotas filhas.

2. Garantir que o botão navegue para a tela certa
- Validar o botão “Abrir questionário” no painel da empresa para continuar apontando para a rota correta.
- Confirmar que, ao clicar, a navegação leva para a página com o formulário visível.

3. Exibir as perguntas do questionário na página
- Garantir que o componente com as perguntas seja mostrado na rota do questionário.
- Manter o layout atual da página e o formulário já criado, sem alterar o conteúdo das perguntas.

4. Validar o fluxo no preview
- Testar o clique no botão.
- Confirmar que a tela abre e que as perguntas aparecem normalmente.

Detalhes técnicos
- O problema mais provável está na configuração atual das rotas: `dashboard.questionario.tsx` foi registrado como rota filha de `/dashboard`, mas `src/routes/dashboard.tsx` não renderiza `<Outlet />`, então a rota filha não aparece.
- A correção deve seguir um destes caminhos:
  - transformar o questionário em rota independente; ou
  - manter como rota filha e adaptar a rota pai para suportar conteúdo filho com `Outlet`.
- Vou aplicar a solução mais simples e segura, sem mexer no conteúdo do formulário.