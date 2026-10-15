# Code Connect

Workspace pnpm com dois apps TypeScript:

- `apps/web`: React + Vite (porta 5173).
- `apps/api`: NestJS (porta 3000).

## Execução

Use Node.js 20.20.1 ou superior e pnpm 12.11.2. Na raiz:

```bash
pnpm install
# Configure o MySQL, JWT_SECRET e aplique as migrations conforme a seção da API.
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

As rotas `/login` e `/cadastro` usam React Router. A raiz `/` e caminhos desconhecidos redirecionam para `/perfil` com sessão válida ou `/login` sem sessão. A rota `/perfil` é protegida; usuários com sessão acessando `/login` ou `/cadastro` são encaminhados ao perfil. Os links entre as páginas preservam o histórico do navegador. Em produção, configure o servidor de arquivos estáticos para devolver `index.html` nas rotas da aplicação, permitindo acesso direto e recarga (o Vite já faz isso em desenvolvimento e preview).

As páginas seguem Atomic Design e usam o mesmo `AuthTemplate`, `AuthBanner`, `FormField`, `Button`, `SocialLogin` e `Icon`. `LoginForm` e `RegistrationForm` entregam seus dados por callback. O cadastro valida nome obrigatório com conteúdo além de espaços, email válido e senha de 8 a 128 caracteres; remove espaços externos de nome/email e preserva a senha. “Lembrar-me” começa marcado em ambos os formulários.

O visual segue os frames desktop, tablet e mobile do [Figma CodeConnect](https://www.figma.com/design/RKP5DHFuNwVK0xkPTsEy5z?node-id=155-3469): duas colunas a partir de 1024 px e banner acima do formulário em telas menores. Os tokens Tailwind ficam em `apps/web/src/index.css`, com a paleta do projeto estendida via `@theme` (Tailwind v4) e aliases semânticos como `page`, `surface` e `accent`. Os componentes usam a escala padrão de fontes (`text-sm`, `text-lg`, `text-xl`, `text-2xl` e `text-3xl`), sem tamanhos de fonte arbitrários. A fonte Prompt (400 e 600) é empacotada localmente via `@fontsource/prompt`; imagens, marca e símbolos exportados do Figma estão em `apps/web/public/auth/`. O arquivo original `banner-principal.png` permanece preservado.

Cadastro, login e perfil estão integrados à API com Axios. O cadastro (`POST /users`) volta ao login com confirmação, email preenchido e a preferência de “Lembrar-me”; a senha não é transportada. O login aceita email e senha (`POST /sessions`) e abre `/perfil`, que consulta `GET /users/me` com `Authorization: Bearer`. A tela mostra nome, email e “Sair”. OAuth e recuperação de senha continuam exibindo avisos de indisponibilidade.

Copie `apps/web/.env.example` para `apps/web/.env`. `VITE_API_URL` define a URL pública da API, com padrão `http://localhost:3000`; reinicie o Vite após editar. Variáveis `VITE_*` são públicas e incorporadas ao build, portanto não devem conter segredos. O cliente usa timeout de 10 segundos e apresenta mensagens acessíveis para falhas de conexão, validação, credenciais, email duplicado e erros do servidor. Durante o envio, os botões ficam desabilitados.

“Lembrar-me” guarda apenas token e vencimento no `localStorage` quando marcado ou no `sessionStorage` quando desmarcado, limpando a sessão anterior. Nunca guarda a senha. A sessão é restaurada consultando o perfil; falhas de rede preservam o token e oferecem nova tentativa. Ao expirar (uma hora), receber `401` autenticado ou selecionar “Sair”, a sessão local é removida e o login reaparece. Não há renovação ou revogação do JWT no servidor.

A API permite chamadas de `http://localhost:5173` por padrão. Para outra origem, configure `CORS_ORIGINS` no ambiente da API com URLs completas separadas por vírgulas, sem barra final, por exemplo `http://localhost:5173,http://localhost:4173`. A configuração permite JSON e Authorization, sem cookies. Em produção, configure a URL da API no build do frontend e as origens exatas na API.

Execute `pnpm test:web` para os testes com Vitest e Testing Library ou `pnpm web test:watch` para modo watch. Build e lint: `pnpm build` e `pnpm lint`.

As capturas anteriores à integração com a API estão em `artifacts/auth/`, com login e cadastro em desktop (1920 px), tablet (768 px), mobile (360 px) e tela estreita (320 px). Na revisão visual original, foram verificados no Chrome o limite de 1024 px, navegação nos dois sentidos, recarga, histórico, validação nativa e foco por teclado.

## API de cadastro e autenticação

A API persiste usuários no MySQL 8.4 usando TypeORM e o driver `mysql2`. O TypeORM foi escolhido pela integração direta com módulos, injeção de repositórios e testes do NestJS, além de entidades TypeScript e migrations versionadas. Veja a [documentação do NestJS](https://docs.nestjs.com/techniques/database). As dependências usam `@nestjs/typeorm` 11 e TypeORM 0.3, compatíveis com a configuração CommonJS e Jest deste projeto. Não há refresh token ou endpoint de logout; o frontend encerra a sessão localmente.

### MySQL local com Docker Compose

Instale Docker com Compose. Na raiz do projeto:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```

Configure senhas locais próprias em `MYSQL_PASSWORD` e `MYSQL_ROOT_PASSWORD` no `.env` da raiz. Em `apps/api/.env`, faça `DB_PASSWORD` corresponder a `MYSQL_PASSWORD`; banco, usuário e porta também devem coincidir entre os arquivos. A API usa o usuário da aplicação, não root. Não comite nenhum `.env`.

Gere um segredo local para `JWT_SECRET` no `apps/api/.env` já criado:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Cole o valor gerado em `JWT_SECRET`. A API recusa iniciar sem esse segredo. `PORT` é opcional e tem padrão `3000`; variáveis do ambiente têm precedência sobre o arquivo.

```bash
docker compose up -d --wait mysql
pnpm install
pnpm db:migration:run
pnpm dev:api
```

O Compose executa somente os bancos; a API e o frontend continuam no host. A porta do MySQL é publicada apenas em `127.0.0.1`, com padrão 3306, alterável por `MYSQL_PORT` na raiz e `DB_PORT` na API.

O volume nomeado `mysql_data` é montado em `/var/lib/mysql`. `docker compose down` remove os containers e preserva os dados; `docker compose up -d --wait mysql` os disponibiliza novamente. **`docker compose down -v` também apaga o volume e seus dados.** Variáveis de inicialização do MySQL só criam banco/usuário/senhas quando o volume está vazio; editar o `.env` não altera credenciais já gravadas.

### Migrations

A API e o CLI compartilham a configuração de conexão e carregam `apps/api/.env` independentemente do diretório de execução. Variáveis do ambiente têm precedência. São obrigatórios `DB_HOST`, `DB_NAME`, `DB_USER` e `DB_PASSWORD`; `DB_PORT` tem padrão 3306 e deve estar entre 1 e 65535.

O esquema é controlado por migrations, com `synchronize: false` e sem aplicação automática ao iniciar a API:

```bash
pnpm db:migration:show
pnpm db:migration:run
# Após alterar entidades, gerar e revisar a migration antes de aplicar:
pnpm db:migration:generate src/database/migrations/DescribeChange
# Reverte a última migration; a inicial remove a tabela users e seus dados:
pnpm db:migration:revert
# Aplicar as migrations compiladas no ambiente de implantação:
pnpm build:api
pnpm db:migration:run:prod
```

A migration inicial cria `users` com UUID, nome, email único, salt e hash binário scrypt. O banco usa `utf8mb4`; a comparação do email normalizado usa collation binária, preservando a igualdade exata utilizada anteriormente. Cadastros concorrentes são protegidos pela restrição única do banco. Os usuários antigos em memória não são importados.

Abra o Swagger em [http://localhost:3000/docs](http://localhost:3000/docs); o documento OpenAPI está em [http://localhost:3000/docs-json](http://localhost:3000/docs-json). Cadastre um usuário, faça login, copie `data.access_token` e cole em **Authorize** para consultar o perfil.

| Endpoint | Entrada | Resposta |
| --- | --- | --- |
| `POST /users` | `{ name, email, password }` | `201`, `data: { id, name, email }`, `Location: /users/me` |
| `POST /sessions` | `{ email, password }` | `200`, `data: { access_token, token_type: "Bearer", expires_in: 3600 }` |
| `GET /users/me` | Header `Authorization: Bearer <JWT>` | `200`, `data: { id, name, email }` |

Todas as respostas de sucesso usam `{ data, links }`; os links indicam login e/ou perfil conforme a operação. O cadastro não autentica automaticamente. O `Location` aponta para o perfil, cuja consulta exige login. As respostas usam `Cache-Control: no-store`.

Nome tem espaços externos removidos e não pode ficar vazio. Email é validado, normalizado para minúsculas e único. A senha de cadastro deve ter de 8 a 128 caracteres; seus espaços são preservados. O banco guarda apenas hashes scrypt com salt individual; esses campos nunca aparecem nas respostas. Login exige email válido e senha não vazia. Campos desconhecidos são rejeitados.

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

O JWT usa HS256, tem validade de uma hora e identifica o usuário pelo claim `sub`. A consulta de perfil valida o token com um guard NestJS e busca o usuário no MySQL. Reinícios preservam cadastros e tokens ainda válidos, desde que o segredo JWT permaneça o mesmo.

Erros usam `{ statusCode, message, errors? }`: `400` para JSON malformado, `422` para campos inválidos ou email duplicado e `401` para credenciais inválidas, token ausente/inválido/expirado ou usuário inexistente. Email desconhecido e senha incorreta recebem a mesma mensagem. Erros inesperados retornam `500` sem detalhes internos.

Validação do backend:

```bash
pnpm build:api
pnpm lint:api
pnpm test:api --runInBand
pnpm test:e2e:api --runInBand
```

Os testes unitários usam mocks dos repositórios e não precisam de banco. Para os e2e, inicie primeiro o serviço isolado:

```bash
docker compose --profile test up -d --wait mysql-test
pnpm test:e2e:api --runInBand
```

O serviço `mysql-test` usa `127.0.0.1:3307`, banco/usuário `code_connect_test` e credenciais exclusivas de teste definidas no Compose. Os e2e forçam esses valores, sem herdar a conexão de desenvolvimento; também verificam o destino antes de aplicar migrations ou limpar a tabela. Use apenas uma execução e2e por vez, pois a suíte compartilha esse banco. Os dados ficam em `tmpfs` e são descartados quando o container para.

A suíte aplica as migrations reais, limpa somente o banco de teste e fecha as conexões. Cobre fluxo completo, validação, duplicidade concorrente, JWT, headers, documentação OpenAPI e persistência após recriar a aplicação. Para encerrar o banco de teste sem afetar o banco local: `docker compose --profile test stop mysql-test`.

Para verificar a persistência do volume local, cadastre um usuário, obtenha um token, execute `docker compose up -d --wait --force-recreate mysql` e consulte `/users/me` com o mesmo token; o perfil e o login devem continuar funcionando. Não use `down -v` nessa verificação.
