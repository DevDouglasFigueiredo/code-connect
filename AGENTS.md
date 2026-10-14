# Repository Guidelines

## Project Structure & Module Organization

This pnpm workspace contains two TypeScript applications under `apps/*`:

- `apps/web/src/`: React components, the `main.tsx` entry point, and `index.css` styles. Vite uses `apps/web/index.html`.
- `apps/api/src/`: NestJS modules, controllers, services, and colocated unit tests.
- `apps/api/test/`: API end-to-end tests and their Jest configuration.

Keep application-specific configuration inside each app. Build output goes into each app's `dist/` directory. No dedicated asset directory or shared package exists yet.

## Build, Test, and Development Commands

Use Node.js 20.20.1 or newer and pnpm 12.11.2, as documented in `README.md`. Run commands from the repository root:

- `pnpm install`: install workspace dependencies.
- `pnpm dev`: run both apps; the web app defaults to port 5173 and the API to 3000.
- `pnpm dev:web` / `pnpm dev:api`: run one application.
- `pnpm build`: build both apps; the web build also checks TypeScript types.
- `pnpm lint`: run ESLint across both apps.
- `pnpm test:api` / `pnpm test:e2e:api`: run API unit or end-to-end tests.
- `pnpm preview:web` / `pnpm start:api`: serve the corresponding production build.

## Coding Style & Naming Conventions

Follow existing TypeScript style: two-space indentation, single-quoted strings, and semicolons. Use PascalCase for React components and NestJS classes, and camelCase for functions and variables. Follow NestJS filenames such as `users.controller.ts`, `users.service.ts`, and `users.module.ts`. Use `.tsx` for React components.

Both apps use ESLint with typescript-eslint; the frontend also checks React Hooks and refresh exports. No formatter is configured.

## Testing Guidelines

Every frontend component must have a colocated `*.test.tsx` test covering its essential use: meaningful rendering and its primary interaction when applicable. Test observable behavior and accessible roles; snapshots alone are insufficient. This applies to every Atomic Design layer. No frontend test runner is configured yet; configure one when implementing component tests and document its command.

The API uses Jest, ts-jest, NestJS testing utilities, and Supertest. Name unit tests `*.spec.ts` inside `apps/api/src/` and end-to-end tests `*.e2e-spec.ts` inside `apps/api/test/`. Cover changed behavior, HTTP contracts, validation, and error responses. Close test applications after use. No numeric coverage threshold is configured.

## Frontend Architecture & Styling

Use Atomic Design under `apps/web/src/components/`: `atoms/` for primitives, `molecules/` for small compositions, `organisms/` for larger sections, and `templates/` for page layouts. Keep concrete screens in `apps/web/src/pages/`. Compose higher layers from lower layers; lower layers must not import higher layers. Keep atoms reusable and independent of page-specific business logic.

Use Tailwind CSS utilities for component styling and shared design tokens for consistent colors, spacing, and typography. Tailwind CSS v4 is configured through the Vite plugin; extend its theme with `@theme` in `apps/web/src/index.css`.

- **Font sizes:** use the closest size from Tailwind's standard scale, such as `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, and `text-3xl`. Do not use arbitrary font sizes such as `text-[18px]` or add custom size tokens solely to match a Figma measurement. For example, use `text-lg` for 18 px and `text-3xl` for 31 px.
- **Colors:** define project palette values only in `@theme` using `--color-*` tokens. Reuse semantic aliases such as `page`, `surface`, `content`, `muted`, `field`, `accent`, and `button-content` in component classes (`bg-surface`, `text-content`, `border-accent`). Do not hardcode hexadecimal colors in utility classes, inline styles, SVG attributes, or CSS outside the palette. Use themed utilities such as `fill-google-blue` for brand icons and `var(--color-accent)` in shared CSS. Add any new palette color to the theme before using it.

## REST Principles

All API endpoints must satisfy REST constraints:

- **Resources:** use plural nouns for collections (`/users`, `/posts`), never action verbs (`/getPosts`). Nest only true ownership relationships (`/users/{id}/posts`), with at most two resource levels. Paginate collections with `?page=1&limit=20`; validate parameters and return pagination metadata.
- **HTTP methods:** `GET` reads, `POST` creates, `PUT` replaces, `PATCH` partially updates, and `DELETE` removes. Keep reads safe and `PUT`/`DELETE` idempotent; support `HEAD` and `OPTIONS` where applicable.
- **Status codes:** use `200` for successful responses with content, `201` with a `Location` header for creation, and `204` with no body. Use `400` for malformed requests, `401` for missing/invalid authentication, `403` for denied authorization, `404` for missing resources, `422` for semantic validation failures, and `500` for unexpected server failures.
- **Representations:** use consistent JSON envelopes: `{ data, links, meta? }` for success and `{ statusCode, message, errors? }` for errors. Omit bodies for `204` and `HEAD`. Declare content types and never expose internal stack traces.
- **Client/server and statelessness:** separate UI concerns from API concerns. Every request carries its required authentication and context; do not depend on server-side client session state.
- **Cacheability:** explicitly declare caching policy with HTTP headers; use validators such as `ETag` where appropriate and prevent shared caching of private responses.
- **Uniform interface and HATEOAS:** identify resources through URIs, use self-descriptive messages, and expose links with relation names for relevant resource navigation and available transitions.
- **Layered system:** preserve HTTP contracts through proxies, gateways, and caches. Code-on-demand is optional and is not required here.

## Commit & Pull Request Guidelines

Use Conventional Commits: `<type>(<optional scope>): <description>`, with concise, imperative descriptions. Examples: `feat(api): add users endpoint`, `fix(web): handle empty results`, and `docs: update repository guidelines`. Use types such as `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`, and `ci`. Mark breaking changes with `!` or a `BREAKING CHANGE:` footer.

PRs should describe the change, link related issues when applicable, and report build, lint, and test results or blockers. Include screenshots for visible UI changes.

## Configuration & Scaffold Safety

Keep secrets in ignored `.env` files; provide safe examples in `.env.example`. The API accepts `PORT`. Preserve existing files before rerunning scaffolding generators; see the setup limitations in `README.md`.
