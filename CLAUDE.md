# Proxymity

Herramienta colaborativa en tiempo real para depuración y testing de APIs HTTP. Funciona como un Postman compartido donde múltiples usuarios pueden editar y ejecutar requests dentro de una misma "sala" (room), viendo los cambios en vivo.

## Arquitectura

Monorepo TypeScript con pnpm workspaces:

```
packages/
├── client/   → React 19 + Vite + Tailwind v4 + Zustand + Socket.IO Client
├── server/   → Express 5 + Socket.IO + Axios (proxy de requests)
└── shared/   → Tipos e interfaces compartidas (IRequestData, IResponseData, IRoomState, eventos)
```

## Modelo de colaboración

- Los usuarios se conectan a una **room** identificada por `roomId`
- El servidor mantiene el estado de cada room en memoria (`Map<RoomID, RoomState>`)
- Cualquier cambio (método, URL, headers, params, body) se emite por WebSocket y se broadcast al resto de la room
- Las respuestas HTTP y el estado de loading se sincronizan entre todos los usuarios
- Last-write-wins: no hay resolución de conflictos

## Flujo de datos

```
Usuario edita → Zustand store local → Socket emit → Servidor actualiza estado →
Broadcast a la room → Otros clientes reciben → Zustand update → Re-render
```

## Ejecución de requests (ProxyService)

- El servidor actúa como proxy: recibe la solicitud del cliente vía WebSocket, ejecuta el HTTP request con Axios y devuelve la respuesta
- Timeout: 10 segundos
- Protección SSRF: bloquea URLs a localhost/127.0.0.1
- Límites: 50 items en headers/params, 100KB en body

## Eventos WebSocket

**Cliente → Servidor:** `client:join_room`, `client:leave_room`, `client:update_method`, `client:update_url`, `client:update_headers`, `client:update_params`, `client:update_body`, `client:execute_request`

**Servidor → Cliente:** `server:sync_state`, `server:user_count`, `server:broadcast_change`, `server:request_started`, `server:request_complete`, `server:error`

Definidos en `packages/shared/src/events.ts`.

## Comandos

```bash
pnpm install          # Instalar dependencias
pnpm dev              # Levantar client y server en paralelo (concurrently)
pnpm server           # Solo servidor (nodemon, puerto 3001)
pnpm client           # Solo cliente (Vite, puerto 3000)
pnpm --filter @proxymity/client lint   # ESLint del client
pnpm knip             # Detectar código muerto y dependencias sin usar
```

## Stack técnico

| Capa | Tecnologías |
|------|-------------|
| **Client** | React 19, Zustand, Socket.IO Client, Monaco Editor, Radix UI, Tailwind CSS v4, CVA, lucide-react, react-syntax-highlighter |
| **Server** | Express 5, Socket.IO, Axios, dotenv, cors |
| **Shared** | TypeScript puro (tipos + constantes de eventos) |
| **Tooling** | Vite, TypeScript, ESLint, knip, pnpm, concurrently, nodemon |

## Componentes principales del client

- **WorkspaceHeader** — Header con nombre de room y contador de usuarios activos
- **RequestControls** — Selector de método HTTP, input de URL, botón Send
- **RequestEditor** — Tabs con Params (KeyValueTable), Headers (KeyValueTable) y Body (Monaco Editor)
- **ResponseViewer** — Badge de status, tiempo, tamaño, JSON con syntax highlighting y botón copiar
- **KeyValueTable** — Tabla reutilizable de key-value con checkbox de habilitado

## Convenciones

- Los tipos compartidos van en `packages/shared/src/types.ts`
- Los eventos WebSocket se definen como constantes en `packages/shared/src/events.ts`
- Estado del cliente centralizado en Zustand (`packages/client/src/store/useAppStore.ts`)
- Componentes UI base usan Radix UI + Shadcn pattern en `packages/client/src/components/ui/`
- El tema es dark por defecto
