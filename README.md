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

A página de login usa Tailwind CSS com tokens em `apps/web/src/index.css` e Atomic Design em `apps/web/src/components/`. O `AuthTemplate` recebe banner, título, descrição, conteúdo e rodapé para reutilização no cadastro. `FormField`, `Button` e `SocialLogin` também são reutilizáveis; `LoginForm` entrega as credenciais e a preferência de lembrar o acesso por callback.

O arquivo `public/banner-principal.png` contém a referência completa. `AuthBanner` usa um recorte visual SVG para mostrar somente a ilustração, preservando o arquivo original; banners individuais podem ser usados sem recorte. Em telas pequenas, o formulário ocupa a largura disponível e o banner fica oculto.

A autenticação, OAuth, recuperação de senha e cadastro ainda não estão integrados. Os controles exibem mensagens sobre essa disponibilidade, sem simular um login bem-sucedido nem persistir credenciais.

Execute `pnpm test:web` para os testes ou `pnpm web test:watch` para modo watch.
