# Code Connect

Aplicação para compartilhar projetos e trechos de código com uma comunidade de desenvolvedores. Visitantes podem navegar pelo feed, pesquisar e abrir projetos. Usuários autenticados também podem publicar, curtir, comentar e responder a comentários.

O projeto é um monorepo pnpm com frontend React, API NestJS e persistência em MySQL. O visual foi implementado a partir do [Figma CodeConnect](https://www.figma.com/design/RKP5DHFuNwVK0xkPTsEy5z?node-id=155-3100), com versões para desktop, tablet e mobile.

## Conteúdo

- [Funcionalidades implementadas](#funcionalidades-implementadas)
- [Tecnologias e organização](#tecnologias-e-organização)
- [Primeira execução](#primeira-execução)
- [Como iniciar e encerrar no dia a dia](#como-iniciar-e-encerrar-no-dia-a-dia)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Dados de demonstração — seed](#dados-de-demonstração--seed)
- [Como a implementação funciona](#como-a-implementação-funciona)
- [API REST e Swagger](#api-rest-e-swagger)
- [Migrations](#migrations)
- [Testes e qualidade](#testes-e-qualidade)
- [Roteiro de validação manual](#roteiro-de-validação-manual)
- [Build e execução dos artefatos](#build-e-execução-dos-artefatos)
- [Problemas comuns](#problemas-comuns)
- [Limitações atuais](#limitações-atuais)

## Funcionalidades implementadas

| Funcionalidade | Comportamento |
| --- | --- |
| Cadastro e login | Cadastro com nome, email e senha; autenticação por JWT |
| Sessão | Opção “Lembrar-me”, restauração da sessão, expiração e logout local |
| Perfil | Consulta protegida do nome e email do usuário autenticado |
| Feed público | Cards com thumbnail, descrição, tags, autor e contadores |
| Busca | Full text no backend, com termos removíveis e “Limpar tudo” no frontend |
| Ordenação e paginação | Recentes ou Mais curtidos; estado da busca e da página na URL |
| Detalhes do post | Descrição, código opcional, curtidas, comentários e respostas |
| Publicação | Título, descrição, tags, código opcional e URL opcional da imagem |
| Curtidas | Uma por usuário/post, com operações idempotentes e proteção contra concorrência |
| Comentários | Comentários principais e respostas limitadas a um nível |
| Imagem alternativa | Placeholder local quando a thumbnail está ausente, é inválida ou falha ao carregar |
| Compartilhamento | Cópia do link do post, com mensagem de sucesso ou falha |
| Navegação responsiva | Menu lateral no desktop e inferior em telas menores; Login/Sair conforme a sessão |

As permissões são verificadas na API. Ocultar ou redirecionar ações no frontend não substitui a autenticação do backend.

## Tecnologias e organização

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router e Axios |
| Estilização | Tailwind CSS v4, tokens em `@theme` e fonte Prompt empacotada localmente |
| Backend | NestJS 11, TypeScript, class-validator, class-transformer e Swagger/OpenAPI |
| Persistência | MySQL 8.4, TypeORM 0.3 e driver mysql2 |
| Autenticação | JWT HS256 e hash de senha com scrypt do Node.js |
| Testes web | Vitest, Testing Library, user-event e jsdom |
| Testes da API | Jest, ts-jest, @nestjs/testing e Supertest |
| Ambiente local | Docker Compose para os bancos; Node.js para executar os aplicativos |

```text
apps/
  api/
    src/
      auth/                 # Login, JWT e guards obrigatório/opcional
      common/               # Contratos compartilhados e tratamento de erros
      database/             # Configuração TypeORM, migrations e seed
      posts/                # Posts, curtidas, comentários, DTOs e serviços
      users/                # Cadastro, usuários e verificação de senha
    test/                   # Testes e2e com MySQL isolado
  web/
    public/auth/            # Imagens e marca locais exportadas do Figma
    src/
      auth/                 # Contexto, armazenamento e retorno após login
      components/
        atoms/              # Primitivos: botão, ícone, avatar, tag e thumbnail
        molecules/          # Campos, busca, ações, paginação e mensagens
        organisms/          # Cards, formulários, comentários e navegação
        templates/          # Layouts compartilhados de autenticação e comunidade
      hooks/                # Carregamento e cancelamento de leituras da API
      pages/                # Telas e composição dos fluxos
      services/             # Cliente HTTP e contratos de autenticação/posts
      test/                 # Configuração, fixtures e auxiliares dos testes
artifacts/
  auth/                     # Capturas de referência das telas de autenticação
  feed/                     # Capturas de feed, detalhes e publicação
compose.yaml                # MySQL de desenvolvimento e MySQL isolado de testes
```

## Primeira execução

### 1. Pré-requisitos

- Node.js **20.20.1 ou superior**.
- pnpm **12.11.2**, conforme `packageManager` do workspace.
- Docker com Docker Compose.
- Portas disponíveis: **5173** para a web, **3000** para a API e **3306** para o MySQL de desenvolvimento. Os e2e usam também a porta **3307**.

Execute os comandos a partir da raiz do repositório.

### 2. Instalar as dependências

```bash
pnpm install
```

Não é necessário gerar novamente os projetos com create-vite ou Nest CLI. A estrutura inicial já está pronta; executar scaffolds sobre os diretórios existentes pode sobrescrever arquivos.

### 3. Criar os arquivos de configuração

Em uma instalação nova:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Se os arquivos já existirem, preserve-os e ajuste somente as variáveis necessárias. Os arquivos `.env` são ignorados pelo Git; os exemplos versionados não devem conter segredos reais.

Configure:

1. No `.env` da raiz, escolha senhas locais para `MYSQL_PASSWORD` e `MYSQL_ROOT_PASSWORD`.
2. Em `apps/api/.env`, faça `DB_PASSWORD` corresponder a `MYSQL_PASSWORD`. Banco, usuário e porta também devem corresponder à configuração do Compose.
3. Preencha `JWT_SECRET` em `apps/api/.env`. Para gerar um valor aleatório:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

4. Se quiser carregar os dados de demonstração, defina também `SEED_PASSWORD` em `apps/api/.env`, com 8 a 128 caracteres. Essa será a senha inicial das contas fictícias.
5. Mantenha os padrões de origem para usar a aplicação em `http://localhost:5173`: `CORS_ORIGINS=http://localhost:5173` na API e `VITE_API_URL=http://localhost:3000` na web.

A API recusa iniciar sem a configuração obrigatória do banco e sem `JWT_SECRET`.

### 4. Iniciar o banco e aplicar o esquema

```bash
docker compose up -d --wait mysql
pnpm db:migration:run
```

O Compose executa **somente os bancos**. Frontend e API são executados no host, fora dos containers. As migrations não rodam automaticamente quando a API inicia.

### 5. Carregar dados de demonstração — opcional

Depois de configurar `SEED_PASSWORD`:

```bash
pnpm db:seed
```

Sem seed, a aplicação funciona com o feed vazio. É possível cadastrar uma conta e criar os próprios posts pela interface.

### 6. Iniciar frontend e API

```bash
pnpm dev
```

Mantenha esse terminal aberto. O comando inicia Vite e NestJS em modo de desenvolvimento, acompanhando alterações nos arquivos.

| Serviço | Endereço padrão |
| --- | --- |
| Aplicação web | [http://localhost:5173](http://localhost:5173) |
| API — exemplo de recurso público | [http://localhost:3000/posts](http://localhost:3000/posts) |
| Swagger | [http://localhost:3000/docs](http://localhost:3000/docs) |
| Documento OpenAPI | [http://localhost:3000/docs-json](http://localhost:3000/docs-json) |
| MySQL | `127.0.0.1:3306` |

## Como iniciar e encerrar no dia a dia

Com as dependências e os `.env` já preparados:

```bash
docker compose up -d --wait mysql
pnpm db:migration:run
pnpm dev
```

O seed não precisa ser executado a cada inicialização. Os dados de desenvolvimento permanecem no volume `mysql_data`.

Para executar os aplicativos separadamente, use dois terminais:

```bash
# Terminal 1
pnpm dev:api
```

```bash
# Terminal 2
pnpm dev:web
```

Para encerrar, pressione **Ctrl+C** no terminal de `pnpm dev` — ou nos dois terminais separados — e pare o banco:

```bash
docker compose stop mysql
```

Isso preserva os dados. `docker compose down` remove os containers e a rede do projeto, mas também preserva o volume nomeado. **Não use `docker compose down -v` se quiser manter os dados:** a opção `-v` remove o volume do banco.

Para consultar estado e logs:

```bash
docker compose ps
docker compose logs --tail=100 mysql
```

Os logs de desenvolvimento da API e da web aparecem nos terminais onde os aplicativos foram iniciados.

## Variáveis de ambiente

### `.env` da raiz — Docker Compose

| Variável | Uso |
| --- | --- |
| `MYSQL_DATABASE` | Nome do banco; exemplo: `code_connect` |
| `MYSQL_USER` | Usuário da aplicação; exemplo: `code_connect` |
| `MYSQL_PASSWORD` | Senha do usuário da aplicação |
| `MYSQL_ROOT_PASSWORD` | Senha de administração do MySQL; não é usada pela API |
| `MYSQL_PORT` | Porta publicada no host; padrão `3306` |

### `apps/api/.env` — NestJS, migrations e seed

| Variável | Uso |
| --- | --- |
| `PORT` | Porta HTTP da API; padrão `3000` |
| `JWT_SECRET` | Segredo usado para assinar e validar JWTs; obrigatório |
| `CORS_ORIGINS` | Origens permitidas, separadas por vírgula; padrão `http://localhost:5173` |
| `DB_HOST` | Host do MySQL; no ambiente local, `127.0.0.1` |
| `DB_PORT` | Porta do MySQL; padrão `3306` |
| `DB_NAME` | Banco da aplicação; deve corresponder a `MYSQL_DATABASE` |
| `DB_USER` | Usuário da aplicação; deve corresponder a `MYSQL_USER` |
| `DB_PASSWORD` | Senha de conexão; deve corresponder a `MYSQL_PASSWORD` |
| `SEED_PASSWORD` | Senha inicial das contas de demonstração; necessária apenas para executar o seed |

API e CLI carregam o `.env` da API por caminho resolvido a partir dos próprios arquivos. Variáveis já definidas no ambiente têm precedência.

### `apps/web/.env` — Vite

| Variável | Uso |
| --- | --- |
| `VITE_API_URL` | URL da API acessível pelo navegador; padrão `http://localhost:3000` |

Reinicie o Vite depois de alterar essa variável. Valores `VITE_*` são públicos e incorporados ao build; não coloque senhas ou segredos neles.

`localhost` e `127.0.0.1` são origens diferentes para CORS. Se acessar a web por `http://127.0.0.1:5173`, inclua essa origem em `CORS_ORIGINS`. Use URLs completas, sem barra final, por exemplo:

```dotenv
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Dados de demonstração — seed

`pnpm db:seed` cria:

- **3 usuários:** `demo1@example.com`, `demo2@example.com` e `demo3@example.com`.
- **30 posts**, com tags e exemplos de código em parte deles.
- **43 curtidas**.
- **60 comentários e respostas**, sendo uma conversa inicial por post.

A senha inicial de todas as contas é o valor de `SEED_PASSWORD` escolhido localmente. Não existe uma senha de demonstração fixa no repositório. No banco, essas senhas também são armazenadas como hash.

Dez posts não possuem thumbnail; os demais usam URLs externas de demonstração do Unsplash. Se uma imagem externa ficar indisponível, o frontend mostra o placeholder.

O seed é manual, exige as migrations aplicadas e utiliza uma transação com UUIDs estáveis. Reexecutá-lo não duplica os registros já existentes nem sobrescreve suas alterações. Alterar `SEED_PASSWORD` **não redefine** senhas de contas já criadas. Se um email de demonstração já pertencer a outro registro, a execução falha e faz rollback, preservando a conta existente.

## Como a implementação funciona

### Frontend e reaproveitamento de layout

A organização segue Atomic Design: átomos são reutilizáveis e independentes das páginas; moléculas compõem controles; organismos implementam seções maiores; templates organizam o layout; páginas conectam esses elementos aos fluxos da aplicação.

`AuthTemplate` é compartilhado por login e cadastro. `CommunityTemplate` é compartilhado por feed, detalhes e publicação. Ele contém a marca, o menu e a área principal; o menu passa de lateral para inferior em telas menores que 1024 px. Há espaço reservado no final da página para permitir acesso aos controles acima do menu fixo.

O mesmo card e os mesmos componentes de thumbnail, tags, autor e ações são usados no feed e nos detalhes. `Button`, `FormField`, `Icon`, contexto de autenticação e cliente HTTP existentes foram reaproveitados. A imagem alternativa também é compartilhada com a prévia do formulário de publicação.

As cores ficam em `@theme`, em `apps/web/src/index.css`, com aliases semânticos como `page`, `surface`, `content` e `accent`. Os componentes usam utilitários Tailwind e sua escala padrão de fontes. A marca e as imagens de autenticação são assets locais; thumbnails dos posts são dados dinâmicos da API.

| Rota web | Acesso |
| --- | --- |
| `/` | Feed público |
| `/posts/:id` | Detalhes e leitura de comentários públicos |
| `/login` | Login; com sessão, segue para o destino solicitado ou feed |
| `/cadastro` | Cadastro; com sessão, segue para o destino solicitado ou feed |
| `/perfil` | Perfil protegido |
| `/publicar` | Formulário de publicação protegido |

Caminhos desconhecidos redirecionam para o feed. A busca é aplicada por Enter ou pelo botão Buscar. Os parâmetros `q`, `sort` e `page` ficam na URL e sobrevivem a recarga e navegação pelo histórico; mudar a busca ou a ordenação reinicia a página. O feed solicita seis posts por página, e comentários/respostas solicitam dez itens por página.

Axios centraliza URL da API, timeout de dez segundos, envio de Bearer e tratamento de `401`. Leituras antigas são canceladas quando filtros, rota ou sessão mudam. As telas oferecem estados de carregamento, vazio, erro e nova tentativa. Os formulários impedem envios duplicados e preservam o texto quando ocorre falha.

### Autenticação e armazenamento das senhas

O cadastro normaliza nome/email, preserva a senha recebida e persiste somente um **hash scrypt de 64 bytes** acompanhado de **salt aleatório individual de 16 bytes**. Não há coluna com a senha em texto puro. Salt e hash ficam fora das consultas padrão e nunca são devolvidos pelas representações públicas de usuário.

No login, o backend recalcula o hash usando o salt salvo e compara os valores com `timingSafeEqual`. Credenciais válidas recebem um JWT HS256 com validade de uma hora e identificação do usuário no claim `sub`. Os guards validam o token e a existência do usuário antes de autorizar ações protegidas.

O frontend guarda apenas token e vencimento: `localStorage` quando “Lembrar-me” está marcado ou `sessionStorage` quando desmarcado. A restauração da sessão consulta `/users/me`. Expiração, `401` da sessão atual e logout removem a sessão local; falhas de rede na consulta do perfil permitem tentar novamente sem descartar o token.

Visitantes que tentam curtir, comentar, responder ou publicar são encaminhados ao login com um destino interno de retorno. Entrar não repete automaticamente a ação. O cadastro também não autentica automaticamente: volta ao login com confirmação, email e preferência de armazenamento, sem transportar a senha.

### Modelo de dados e regras de interação

| Tabela | Responsabilidade e relações |
| --- | --- |
| `users` | UUID, nome, email único normalizado, salt e hash da senha |
| `posts` | Autor, título, descrição, código e thumbnail opcionais, tags JSON, documento de busca e data |
| `post_likes` | Relação usuário/post; chave composta impede curtidas duplicadas |
| `post_comments` | Autor, post, texto e referência opcional a um comentário principal |

As tabelas têm chaves estrangeiras e índices para consulta/paginação. As relações possuem exclusão em cascata no banco; isso não significa que existam endpoints de exclusão de posts ou usuários.

O autor de posts e comentários vem sempre do JWT. Uma resposta só pode apontar para um comentário principal do mesmo post; respostas a respostas são rejeitadas. Contadores de comentários incluem comentários principais e respostas. A API expõe somente `{ id, name }` para autores de posts/comentários.

### Busca full text no backend

Ao persistir um post, o serviço monta um documento textual com título, descrição, código e tags. Esse documento recebe índice **FULLTEXT** no MySQL e é consultado com `MATCH ... AGAINST` em modo booleano, usando parâmetros.

Todos os termos distintos da consulta devem corresponder; cada termo usa busca por prefixo. A comparação ignora caixa e acentos. Pontuação separa palavras, e operadores booleanos digitados pelo usuário não são executados como sintaxe SQL. Consulta vazia retorna o feed; consulta composta somente por pontuação retorna uma lista vazia.

A indexação segue as regras do MySQL/InnoDB, incluindo stopwords e tamanho mínimo de token, cujo padrão é três caracteres. Palavras curtas completas, como `UI`, podem não ser indexadas; prefixos curtos ainda podem encontrar palavras maiores indexadas. Não há filtro exato de tags separado nem filtragem local dos resultados na web.

## API REST e Swagger

O contrato completo, com DTOs, exemplos, parâmetros e respostas, está no Swagger em `/docs`. Para testar ações protegidas, faça login em `POST /sessions`, copie `data.access_token` e informe-o em **Authorize**.

| Método e recurso | Acesso | Resultado |
| --- | --- | --- |
| `POST /users` | Público | Cria usuário; `201`, `Location: /users/me` |
| `POST /sessions` | Público | Autentica; `200` com token e validade |
| `GET /users/me` | JWT obrigatório | Nome, email e ID do usuário atual |
| `GET /posts` | Público; JWT opcional | Feed paginado com busca e ordenação |
| `GET /posts/:id` | Público; JWT opcional | Detalhes, incluindo código |
| `POST /posts` | JWT obrigatório | Cria post; `201` e `Location` |
| `PUT /posts/:id/likes/me` | JWT obrigatório | `201` na primeira curtida; `204` se já existir |
| `DELETE /posts/:id/likes/me` | JWT obrigatório | `204`, inclusive se a curtida já estiver ausente |
| `GET /posts/:id/comments` | Público; JWT opcional | Comentários principais ou respostas paginadas |
| `GET /posts/:id/comments/:commentId` | Público; JWT opcional | Comentário individual |
| `POST /posts/:id/comments` | JWT obrigatório | Cria comentário ou resposta; `201` e `Location` |

Em leituras públicas, omitir o token permite navegar normalmente; informar token inválido ou expirado retorna `401`. Sem autenticação, `likedByMe` é `false`.

### Paginação e ordenação

- `GET /posts`: `q`, `sort=recent|likes`, `page=1` e `limit=20` por padrão.
- `GET /posts/:id/comments`: `page`, `limit` e `parentId` opcional; omita `parentId` para comentários principais ou informe o ID de um deles para consultar suas respostas.
- Limites aceitos: `page` de 1 a 1.000.000 e `limit` de 1 a 100. Páginas além do total retornam uma lista vazia.
- Posts recentes usam data decrescente; Mais curtidos usa quantidade de curtidas, depois data. UUID desempata a ordenação. Comentários/respostas usam data crescente e UUID.

### Representações, erros e headers

Sucessos usam `{ data, links, meta? }`. Coleções incluem `meta: { page, limit, total, totalPages }` e links de navegação quando aplicáveis. Posts incluem `likesCount`, `commentsCount`, `likedByMe` e relações para detalhes, comentários e curtida. O feed não envia o código completo; comentários incluem `repliesCount` e link para respostas.

Erros usam `{ statusCode, message, errors? }`:

| Status | Situação |
| --- | --- |
| `400` | Requisição/JSON malformado |
| `401` | Credenciais inválidas, token ausente/inválido/expirado ou usuário autenticado inexistente |
| `404` | Recurso inexistente ou comentário pai que não pertence ao post |
| `422` | Validação de campos/parâmetros, email duplicado ou tentativa de responder a uma resposta |
| `500` | Falha inesperada, sem detalhes internos ou stack trace |

Respostas declaram `Cache-Control: no-store`. Recursos de leitura suportam HEAD sem corpo; OPTIONS informa métodos disponíveis. Criações têm `Location`; respostas `204` não contêm corpo. CORS permite JSON e Bearer nas origens configuradas, sem autenticação por cookies.

### Limites dos campos

| Campo | Regra |
| --- | --- |
| Nome do usuário | Obrigatório, após remover espaços externos |
| Email | Válido, normalizado para minúsculas e único |
| Senha de cadastro | 8 a 128 caracteres, preservando espaços |
| Título do post | 1 a 160 caracteres após trim |
| Descrição | 1 a 5.000 caracteres após trim |
| Código | Opcional, até 50.000 caracteres; formatação preservada |
| Thumbnail | Opcional, URL HTTP/HTTPS de até 2.048 caracteres, sem credenciais embutidas |
| Tags | Até dez valores únicos sem distinção de caixa; 1 a 30 caracteres por tag após trim |
| Comentário/resposta | 1 a 2.000 caracteres após trim |
| Consulta `q` | Até 200 caracteres |

Campos desconhecidos são rejeitados. A API armazena a URL da imagem sem baixar o arquivo. O código publicado é exibido como texto escapado, nunca executado pelo frontend.

### Exemplos de requisição

```bash
# Consultar sem autenticação.
curl 'http://localhost:3000/posts?q=React&sort=likes&page=1&limit=6'

# Autenticar com a conta e a senha configuradas localmente.
curl http://localhost:3000/sessions \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo1@example.com","password":"SUA_SENHA_DO_SEED"}'
```

Com o token recebido, use o Swagger para publicar ou envie:

```bash
curl -i http://localhost:3000/posts \
  -H 'Authorization: Bearer SEU_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Meu projeto React","description":"Componentes acessíveis e reutilizáveis.","tags":["React","Acessibilidade"],"code":"const hello = 1;","thumbnailUrl":null}'
```

## Migrations

O esquema é versionado. `synchronize` e aplicação automática de migrations estão desativados tanto na configuração da aplicação quanto na configuração usada pelo CLI.

| Migration | O que faz |
| --- | --- |
| `1792022400000-create-users` | Cria usuários, email único e campos de salt/hash |
| `1792108800000-create-posts` | Cria posts, curtidas, comentários, relações e índice FULLTEXT |

A migration de posts respeita o charset/collation do ID da tabela `users` existente para criar chaves estrangeiras compatíveis. O documento de busca usa collation própria, sem distinção de caixa/acentos.

```bash
pnpm db:migration:show
pnpm db:migration:run

# Após modificar entidades: gerar, revisar o SQL e então aplicar.
pnpm db:migration:generate src/database/migrations/DescribeChange

# Reverter somente a última migration aplicada.
pnpm db:migration:revert
```

Reverter a migration de posts apaga suas tabelas e interações. Reverter a migration inicial apaga `users`. Não use reversão como procedimento de encerramento do ambiente.

## Testes e qualidade

### Frontend

```bash
pnpm test:web
pnpm web test:watch
pnpm lint:web
pnpm build:web
```

Vitest e Testing Library cobrem renderização e interação principal de todos os componentes de produção, com testes colocalizados `*.test.tsx`. Há também testes de rotas, serviços HTTP, armazenamento de sessão, retorno após login, permissões na interface e cancelamento de leituras antigas. A suíte usa **um worker e não paraleliza arquivos**, para reduzir consumo de memória.

### API — testes unitários

```bash
pnpm test:api --runInBand
pnpm lint:api
pnpm build:api
```

Os testes `*.spec.ts` usam Jest, ts-jest e mocks de repositórios; não precisam do MySQL.

### API — testes e2e com banco real

Com o `.env` da raiz já configurado para o Compose:

```bash
docker compose --profile test up -d --wait mysql-test
pnpm test:e2e:api --runInBand
# Ao terminar, libere os recursos do banco de testes.
docker compose --profile test stop mysql-test
```

Os e2e usam **Jest**, **Supertest** para HTTP e **@nestjs/testing** para criar a aplicação. O banco real é um MySQL 8.4 isolado em `127.0.0.1:3307`, com banco/usuário `code_connect_test` e credenciais exclusivas definidas no Compose. A configuração de teste força esses valores e verifica o destino antes de aplicar migrations ou limpar dados.

Execute apenas uma suíte e2e por vez e mantenha `--runInBand`: os arquivos compartilham o mesmo banco. Os dados de teste ficam em `tmpfs` e são descartados quando o container para. Aplicações e conexões são fechadas ao fim da execução.

A cobertura inclui cadastro/login, validação, JWT, contratos e headers, Swagger, persistência após recriar a aplicação, busca FULLTEXT real, paginação, ordenação, curtidas concorrentes/idempotentes, regras de resposta, reversão/reaplicação da migration de posts e seed repetido/rollback por conflito.

### Verificação conjunta

```bash
pnpm lint
pnpm build
```

Na validação desta implementação passaram **111 testes web**, **29 testes unitários da API** e **81 e2e da API**. Também foram exercitados os fluxos no Chrome contra a API e o MySQL isolado. Esses números registram essa validação; os comandos acima são a referência para verificar alterações futuras.

As capturas em `artifacts/feed/` cobrem feed, detalhes e publicação em 320, 360, 768 e 1920 px. A revisão visual usa dados controlados e thumbnail exportada do Figma; a integração com persistência foi conferida separadamente. Foram verificados navegação por teclado, placeholder, retorno após login e acesso aos controles acima do menu inferior.

## Roteiro de validação manual

Com banco, API e web ativos:

1. Abra o feed sem sessão. Pesquise `React` ou `responsivos`, remova termos, limpe a busca, alterne ordenação e navegue entre páginas. Recarregue e confira os parâmetros na URL.
2. Abra um post. Confira descrição, código quando disponível, contadores e leitura de comentários/respostas.
3. Tente curtir sem sessão. Faça login com uma conta própria ou `demo1@example.com` e o valor de `SEED_PASSWORD` usado na criação do seed. Confira o retorno ao destino sem curtida automática.
4. Curta/descurta, comente e responda. Recarregue os detalhes e confira a persistência. A interface não oferece respostas a respostas.
5. Abra Publicar. Crie um projeto sem imagem; depois experimente uma URL válida e uma quebrada. Confira prévia, placeholder, tags removíveis e limpeza com Descartar.
6. Publique e confira o redirecionamento para os detalhes e a presença do novo post no feed recente.
7. Use Compartilhar e confira o link copiado. Saia pelo menu: o feed continua acessível e Sair muda para Login.
8. Confira telas pequenas e navegação por teclado. Acesse `/perfil` e `/publicar` sem sessão para validar a proteção das rotas.

No Swagger, também é possível repetir PUT da curtida (`201`, depois `204`) e DELETE (ambos `204`), testar payloads inválidos e tentar responder a uma resposta (`422`).

## Build e execução dos artefatos

```bash
pnpm build
pnpm db:migration:run:prod
```

Com o MySQL ativo e as variáveis da API configuradas, execute em terminais separados:

```bash
pnpm start:api
```

```bash
pnpm preview:web
```

Os builds ficam em `apps/api/dist/` e `apps/web/dist/`. `start:api` usa o JavaScript compilado; `preview:web` serve o build web para conferência local, normalmente em `http://localhost:4173`. Para esse endereço, inclua `http://localhost:4173` em `CORS_ORIGINS` e reinicie a API.

Para implantação, configure `VITE_API_URL` antes do build, as variáveis da API no ambiente de destino e as origens exatas de CORS. O servidor que servir o frontend deve retornar `index.html` para rotas da aplicação, permitindo abrir/recarregar `/posts/:id`, `/login` e demais caminhos diretamente. Vite preview é destinado à conferência local do build.

## Problemas comuns

| Problema | O que conferir |
| --- | --- |
| Docker não inicia ou retorna permission denied | Verifique se o daemon está ativo e se seu usuário pode acessar o Docker |
| API informa que `JWT_SECRET` ou variável `DB_*` está ausente | Preencha `apps/api/.env` ou forneça as variáveis no ambiente; a raiz `.env` configura o Compose, não a API |
| `Access denied` ao conectar ao MySQL | Confira correspondência entre `MYSQL_*` e `DB_*`; mudar o `.env` não altera senhas de um volume já inicializado |
| Tabela inexistente/erro ao consultar posts | Aguarde o MySQL ficar saudável e execute `pnpm db:migration:run` |
| Feed vazio | O seed é opcional e manual; execute-o com `SEED_PASSWORD` ou crie um post pela interface |
| Conta demo não aceita a senha | Use a senha da primeira criação do seed; reexecutar com outra senha não redefine a conta |
| Erro de CORS | Confira a origem exata, incluindo host e porta; `localhost`, `127.0.0.1`, 5173 e 4173 são origens distintas |
| Frontend tenta acessar API errada | Ajuste `VITE_API_URL` e reinicie o Vite; para build, compile novamente |
| Porta já ocupada | Encerre a outra instância ou ajuste portas e URLs; confira o endereço informado pelo Vite |
| Busca não encontra termo curto | Confira as regras FULLTEXT de tamanho mínimo e stopwords descritas acima |
| Imagem externa não carrega | O placeholder é o comportamento esperado para URL indisponível |
| E2e falha ao conectar | Inicie `mysql-test`, confira a porta 3307 e execute com `--runInBand` |

O MySQL de desenvolvimento publica a porta somente em `127.0.0.1`. O volume preserva os dados entre reinícios; não remova o volume para corrigir credenciais sem antes decidir o que fazer com os dados existentes.

## Limitações atuais

- Sem upload de arquivos: a imagem do post é informada por URL.
- Sem edição/exclusão de posts, comentários ou usuários pela API/interface.
- Sem perfil público, cadastro de username ou upload de avatar; a interface mostra nome e iniciais.
- Respostas limitadas a um nível; sem conversa aninhada além disso.
- Sem refresh token ou revogação de JWT no servidor; o logout remove a sessão local.
- Login social, recuperação de senha e Sobre nós apresentam avisos de indisponibilidade.
- Compartilhamento copia a URL; não mantém contador de compartilhamentos.
