# Sistema de Rastreamento Clínico — Síndrome do X Frágil (IBK)

Bem-vindo ao repositório oficial do Sistema de Rastreamento Clínico desenvolvido para o Instituto Buko Kaesemodel (IBK). Este sistema foi construído como projeto final da disciplina de Experiência Criativa: Criando Soluções Computacionais.

## Acesso ao Sistema (Live Demo)
**https://check-list-sfx-ht5e.vercel.app/painel**

## Vídeo de Demonstração
(https://github.com/user-attachments/assets/2a689856-a53d-4978-903c-5a6fcd881faf)

## Links Rápidos para Documentação
Para manter este repositório organizado, dividimos as instruções em arquivos dedicados. Por favor, acesse:
- [Documentação Técnica e Arquitetura](./DOCUMENTACAO.md) - Detalhes sobre o banco de dados, RBAC, tecnologias e rotas.
- [Tutorial de Uso do Sistema](./TUTORIAL.md) - Guia passo a passo para o usuário final (profissional de saúde).

## Como rodar o projeto localmente

1. Clone o repositório e instale as dependências:
   ```bash
   npm install

2. Configure o arquivo .env na raiz do projeto com a URL do seu banco de dados MySQL:
   ```bash
   DATABASE_URL="mysql://usuario:senha@host/banco"

3. Atualize o banco de dados via Prisma:
   ```bash
   npx prisma generate
   npx prisma db push

4. Inicie o servidor:
   ```bash
   npm run dev

O sistema estará disponível em http://localhost:3000

## Desenvolvedores
- David Bobato Kikina
- João Gabriel Rocco
- Otavio Graczyki Belich
- Theo Monteiro
   
