## Objetivo

Manter o login com e-mail e senha funcionando de verdade — sem depender de e-mail de confirmação chegar na caixa de entrada.

## O que vou fazer

### 1. Ativar confirmação automática no backend
Hoje o Lovable Cloud exige que o usuário clique num link de confirmação enviado por e-mail antes de poder entrar. Como não há domínio de e-mail configurado, esse link nunca chega → todo login falha com "credenciais inválidas".

Vou ativar **auto-confirmação de e-mail**. Resultado: ao clicar em "Criar conta", a empresa entra direto no painel, sem precisar abrir e-mail nenhum.

### 2. Melhorar o modal de login (front-end)
- Abrir o modal já na aba **"Criar conta"** (mais natural para primeiro acesso).
- Traduzir o erro `Invalid login credentials` para português claro: *"E-mail ou senha incorretos. Se ainda não tem conta, use a aba **Criar conta**."*
- Quando o erro for de credenciais inválidas no login, sugerir visualmente trocar para "Criar conta".

### 3. Testar o fluxo
Criar conta → entrar no painel → cadastrar empresa → responder questionário. Tudo num único caminho, sem sair do site.

## O que NÃO muda

- O login continua exigindo e-mail e senha (como você pediu).
- Os dados continuam protegidos: cada empresa só vê os próprios dados.
- O cadastro segue salvo no banco e funciona em qualquer navegador (basta entrar com o mesmo e-mail e senha).

## Como cada empresa vai usar

1. Abre o site → clica em **"Empresas: Login"**.
2. Na primeira vez: aba **"Criar conta"** → digita e-mail + senha (mínimo 6 caracteres) → clica em **Criar conta** → entra direto.
3. Nas próximas vezes: aba **"Entrar"** → mesmo e-mail + senha → entra direto.

Pronto, sem confirmação por e-mail, sem links externos, sem travamento.