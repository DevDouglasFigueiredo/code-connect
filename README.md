# Code Connect

Workspace pnpm com dois apps TypeScript:

- `apps/web`: React + Vite (porta 5173).
- `apps/api`: NestJS (porta 3000).

## Execução

Use Node.js 20.20.1 ou superior e pnpm 12.11.2. Na raiz:

```bash
pnpm install
pnpm dev
```

| Comando | Ação |
| --- | --- |
| `pnpm dev:web` | Inicia o frontend |
| `pnpm dev:api` | Inicia a API em watch |
| `pnpm build` | Compila os dois apps |
| `pnpm build:web` / `pnpm build:api` | Compila um app |
| `pnpm lint` | Executa lint nos dois apps |
| `pnpm lint:web` / `pnpm lint:api` | Executa lint em um app |
| `pnpm preview:web` | Serve o build do frontend |
| `pnpm start:api` | Executa o build da API |
| `pnpm test:web` | Executa testes do frontend com Vitest e Testing Library |
| `pnpm test:api` | Executa testes unitários da API |
| `pnpm test:e2e:api` | Executa testes e2e da API |

Para outros comandos, use `pnpm web <comando>` ou `pnpm api <comando>`, por exemplo `pnpm api exec nest generate module users`.

## Estado da criação

Os comandos abaixo foram tentados, mas falharam porque o ambiente não resolveu `registry.npmjs.org` (`ENOTFOUND`):

```bash
npx --yes create-vite@latest apps/web --template react-ts --no-interactive
npx --yes @nestjs/cli@11 new api --directory apps/api --package-manager pnpm --skip-install --skip-git --language TS
```

Os arquivos iniciais foram preparados manualmente como alternativa. A geração via npx permanece pendente; não execute os geradores sobre os diretórios existentes sem antes preservar o trabalho. As dependências e o lockfile já estão disponíveis. A implementação da página de login foi validada com build, lint e testes do frontend. Novas instalações dependem de acesso ao npm.

## Frontend de autenticação

As rotas `/login` e `/cadastro` usam React Router. A raiz `/` e caminhos desconhecidos redirecionam para `/login`. Os links entre as páginas preservam o histórico do navegador. Em produção, configure o servidor de arquivos estáticos para devolver `index.html` nas rotas da aplicação, permitindo acesso direto e recarga (o Vite já faz isso em desenvolvimento e preview).

As páginas seguem Atomic Design e usam o mesmo `AuthTemplate`, `AuthBanner`, `FormField`, `Button`, `SocialLogin` e `Icon`. `LoginForm` e `RegistrationForm` entregam seus dados por callback. O cadastro valida nome obrigatório com conteúdo além de espaços, email válido e senha obrigatória; remove espaços externos de nome/email e preserva a senha. “Lembrar-me” começa marcado em ambos os formulários.

O visual segue os frames desktop, tablet e mobile do [Figma CodeConnect](https://www.figma.com/design/RKP5DHFuNwVK0xkPTsEy5z?node-id=155-3469): duas colunas a partir de 1024 px e banner acima do formulário em telas menores. Os tokens Tailwind ficam em `apps/web/src/index.css`, com a paleta do projeto estendida via `@theme` (Tailwind v4) e aliases semânticos como `page`, `surface` e `accent`. Os componentes usam a escala padrão de fontes (`text-sm`, `text-lg`, `text-xl`, `text-2xl` e `text-3xl`), sem tamanhos de fonte arbitrários. A fonte Prompt (400 e 600) é empacotada localmente via `@fontsource/prompt`; imagens, marca e símbolos exportados do Figma estão em `apps/web/public/auth/`. O arquivo original `banner-principal.png` permanece preservado.

Cadastro, autenticação, OAuth e recuperação de senha ainda não estão integrados à API. As páginas exibem avisos acessíveis de indisponibilidade, sem simular sucesso ou persistir credenciais.

Execute `pnpm test:web` para os testes com Vitest e Testing Library ou `pnpm web test:watch` para modo watch. Build e lint: `pnpm build` e `pnpm lint`.

As capturas para revisão estão em `artifacts/auth/`, com login e cadastro em desktop (1920 px), tablet (768 px), mobile (360 px) e tela estreita (320 px). Também foram verificados no Chrome o limite de 1024 px, navegação nos dois sentidos, recarga, histórico, validação nativa e foco por teclado.

## API de cadastro e autenticação

A API mantém os usuários em um array em memória, inicialmente vazio. Reiniciar o processo apaga todos os cadastros; tokens de usuários que deixaram de existir retornam `401`. Não há banco, ORM, refresh token ou logout. Os formulários do frontend continuam sem integração.

Antes de iniciar, copie o exemplo e configure um segredo local (não comite `.env`):

```bash
cp apps/api/.env.example apps/api/.env
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Cole o valor gerado em `JWT_SECRET` no arquivo `apps/api/.env`. A API carrega esse arquivo independentemente do diretório de execução e recusa iniciar sem um segredo configurado. `PORT` é opcional e tem padrão `3000`; variáveis do ambiente têm precedência sobre o arquivo.

```bash
pnpm dev:api
```

Abra o Swagger em [http://localhost:3000/docs](http://localhost:3000/docs); o documento OpenAPI está em [http://localhost:3000/docs-json](http://localhost:3000/docs-json). Cadastre um usuário, faça login, copie `data.access_token` e cole em **Authorize** para consultar o perfil.

| Endpoint | Entrada | Resposta |
| --- | --- | --- |
| `POST /users` | `{ name, email, password }` | `201`, `data: { id, name, email }`, `Location: /users/me` |
| `POST /sessions` | `{ email, password }` | `200`, `data: { access_token, token_type: "Bearer", expires_in: 3600 }` |
| `GET /users/me` | Header `Authorization: Bearer <JWT>` | `200`, `data: { id, name, email }` |

Todas as respostas de sucesso usam `{ data, links }`; os links indicam login e/ou perfil conforme a operação. O cadastro não autentica automaticamente. O `Location` aponta para o perfil, cuja consulta exige login. As respostas usam `Cache-Control: no-store`.

Nome tem espaços externos removidos e não pode ficar vazio. Email é validado, normalizado para minúsculas e único. A senha de cadastro deve ter de 8 a 128 caracteres; seus espaços são preservados. O array guarda apenas hashes scrypt com salt individual; esses campos nunca aparecem nas respostas. Login exige email válido e senha não vazia. Campos desconhecidos são rejeitados.

Exemplo de fluxo:

```bash
curl -i http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ana Silva","email":"ana@example.com","password":"senha-segura-123"}'

curl http://localhost:3000/sessions \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana@example.com","password":"senha-segura-123"}'

# Substitua <JWT> pelo data.access_token retornado pelo login.
curl http://localhost:3000/users/me -H 'Authorization: Bearer <JWT>'
```

O JWT usa HS256, tem validade de uma hora e identifica o usuário pelo claim `sub`. A consulta de perfil valida o token com um guard NestJS e busca o usuário no array.

Erros usam `{ statusCode, message, errors? }`: `400` para JSON malformado, `422` para campos inválidos ou email duplicado e `401` para credenciais inválidas, token ausente/inválido/expirado ou usuário inexistente. Email desconhecido e senha incorreta recebem a mesma mensagem. Erros inesperados retornam `500` sem detalhes internos.

Validação do backend:

```bash
pnpm build:api
pnpm lint:api
pnpm test:api --runInBand
pnpm test:e2e:api --runInBand
```

Os testes e2e usam um segredo exclusivo de teste e a mesma configuração HTTP da aplicação. Cobrem o fluxo completo, validação, duplicidade concorrente, JWT, headers e documentação OpenAPI.
