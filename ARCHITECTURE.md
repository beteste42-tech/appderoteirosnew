# Roteiriza GDM — Arquitetura e Estrutura

Este documento resume a arquitetura, pastas principais e fluxos do sistema.

## Stack Principal
- React + Vite + TypeScript
- Supabase (Postgres + Auth) com RLS
- TailwindCSS + lucide-react
- Exportação de PDF com `jspdf` e captura de elementos com `html2canvas`.
- Navegação pelo `React Router` com layout protegido por autenticação.

## Diretórios Principais
- `src/` — código-fonte:
  - `pages/` — páginas da aplicação (Login, Dashboard, Roteirização, Mapa de Carregamento, Rotas Padrão, Configurações, Resumo).
  - `components/` — componentes reutilizáveis (Sidebar, Logo, PageHeader, TruckMapVisual).
  - `context/` — `AppContext` com estado global (usuário, rotas, clientes, fretes, etc.).
  - `lib/` — utilitários (Supabase client, PDF, helpers visuais).
  - `data/` — dados mock e tipos auxiliares.
  - `App.tsx` — definição de rotas e layout protegido.
  - `main.tsx` — bootstrap do React.
- `supabase/migrations/` — scripts SQL para schema, políticas e correções.
- `public/` — assets públicos (se utilizados).

## Páginas
- `Login` (`src/pages/Login.tsx`):
  - Autenticação via RPC `verify_password`.
  - Persistência de sessão em `localStorage`.
  - Redirecionamento pós-login.
- `Dashboard` (`src/pages/Dashboard.tsx`):
  - Filtros (texto, data, fretista, motorista, placa, região, cliente, rede, UF, vendedor, cidade).
  - Indicadores e gráficos.
  - Rota atual com dados da carga, sequência de entrega com status e comentários, mapa de carregamento e PDF.
- `Roteirização` (`src/pages/Routing.tsx`):
  - Form com dados da carga, veículo e sequência.
  - Preenchimento automático de `fretista` e motoristas por `fretista_id` ao escolher placa.
  - `Qtd. Paletes` automática pela ocupação do mapa.
  - Correção de `dataEntrega` no fuso local.
  - PDF do mapa.
- `Mapa de Carregamento` (`src/pages/LoadingMap.tsx`):
  - Visual do mapa por tipo de veículo.
  - PDF do mapa selecionado.
- `Rotas Padrão` (`src/pages/StandardRoutes.tsx`):
  - Administração de rotas modelo.
- `Configurações` (`src/pages/Settings.tsx`):
  - CRUD de entidades (clientes, veículos, regiões, fretistas, motoristas).
- `Resumo` (`src/pages/Resumo.tsx`):
  - Lista todas as rotas filtradas com os mesmos filtros da Dashboard.
  - Exporta um PDF com todas as rotas filtradas (uma por página).

## Estado Global (AppContext)
- `AppContext` (`src/context/AppContext.tsx`):
  - Autenticação e sessão do usuário (roles: admin, operador, visual, pendente).
  - Carregamento inicial de entidades do Supabase.
  - Operações:
    - `addRota` — cria rota e registra clientes e mapa no banco.
    - `updateEntregaStatus` — atualiza status por índice.
    - `updateEntregaComentario` — concatena comentários por índice.
    - `seedDatabase`, `seedUsers` — utilitários de carga e usuários.
  - Estrutura `Rota`:
    - `clientes` — array de nomes (10).
    - `entregaStatusByIndex` — status por posição.
    - `entregaComentarioByIndex` — comentários por posição.
    - `cargaSlots` — matriz de clientes por palete/slot.

## Banco de Dados (Supabase)
- Schema inicial (`supabase/migrations/20250212150000_initial_schema.sql`):
  - `usuarios`, `fretistas`, `veiculos`, `motoristas`, `clientes`.
  - `rotas`, `rota_clientes`, `mapa_carregamento`.
- Correções e políticas:
  - `fix_rls_policies.sql`, `fix_permissions.sql`, `fix_login_permissions.sql`.
- Comentários de entrega:
  - `20251215_add_comentario_entrega.sql` adiciona `comentario_entrega` em `rota_clientes`.

## PDF
- `exportElementToPdf(element, opts)` (`src/lib/pdf.ts`):
  - Cabeçalho com título/subtítulo, logo opcional e bloco de informações.
  - Renderiza o `element` como imagem no PDF.
- `exportElementsToPdf(elements, opts)`:
  - Exporta múltiplos elementos em um único PDF (uma página por elemento).

## Estilos e Utilitários
- `tailwindcss` + `clsx` + `tailwind-merge`.
- Helpers (`src/lib/utils.ts`): `cn`, formatação de moeda/data.

## Rotas
- `src/App.tsx`:
  - Layout protegido (`ProtectedLayout`) com `Sidebar` e `Outlet`.
  - Rotas principais: `/rotas`, `/roteirizacao`, `/mapa-carregamento`, `/rotas-padrao`, `/configuracoes`, `/resumo`.
  - Controle por `role` (admin/operador têm acesso a páginas de edição).

## Build e Qualidade
- Scripts (`package.json`):
  - `dev`, `build`, `preview`, `lint`, `lint:dualite`, `tsc:dualite`.
- Lint: `eslint` com `typescript-eslint`, `react`, `react-hooks`.
  - Variáveis de ambiente em “Project Settings → Environment Variables”
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`

## Operação
- Para desenvolver:
  - `npm install`
  - `npm run dev`
- Para build:
  - `npm run build`
- Para lint/typecheck:
  - `npm run lint:dualite`
  - `npx tsc -p tsconfig.dualite.json --noEmit`