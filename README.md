# next-game-helper-v2

## Overview

**next-game-helper-v2** é um projeto construído com Next.js + TypeScript que serve como “helper” para jogos de RPG — uma aplicação que facilita a organização, visualização e eventual gestão de recursos ou dados relacionados aos jogos que você utiliza. A ideia é fornecer uma interface moderna e funcional para quem curte RPGs e deseja manter controle de seus jogos, personagens, recursos ou histórico de partidas.  

## Stack Overview

O projeto usa as seguintes tecnologias:

- **Next.js + TypeScript** — framework principal para front-end / SSR / SSG / React.  
- **Tailwind CSS** — para estilização utilitária e responsiva.  
- **Drizzle ORM** (via `drizzle.config.ts`) — configuração de ORM / banco de dados.  
- Configurações de build e linting: `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, entre outros.  

## Setup Instructions

Para configurar e rodar o projeto localmente, siga os passos abaixo:

```bash
# 1. Clone o repositório
git clone https://github.com/arthur12320/next-game-helper-v2.git
cd next-game-helper-v2

# 2. Instale as dependências
npm install
# ou, se você usar pnpm / yarn
# pnpm install
# yarn install

# 3. (Opcional) Configure variáveis de ambiente  
# Se houver um arquivo .env.example — copie e ajuste conforme necessário:
cp .env.example .env  
# Preencha com as configurações apropriadas (por exemplo: conexão com banco de dados, chaves etc.)

# 4. Inicialize o banco de dados (se aplicável com Drizzle/ORM)  
# Dependendo da configuração, pode haver comando para migrar ou inicializar o DB.

# 5. Rode a aplicação em modo de desenvolvimento
npm run dev

# 6. Acesse no navegador
# Abra http://localhost:3000
```

## Features / TO-DO (autal & planejada)

- [x] Base da aplicação com Next.js + TypeScript + UI estilizada com Tailwind

- [x] Configuração de ORM com Drizzle para gestão de dados

- [x] Estrutura preparada para expansão (autenticação, painel admin, upload de imagens etc.)

🚧 Funcionalidades planejadas:

- [ ] Tela de cadastro de novo usuário / login

- [ ] Painel administrativo

- [ ] Sistema de notificações

- [ ] Upload de imagens (capas, assets de jogo, etc.)