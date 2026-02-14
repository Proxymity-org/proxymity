---
trigger: always_on
---

# Proxymity Agent Guide

This document is designed to help AI agents and developers understand the **Proxymity** codebase, its architecture, and the best practices for contributing to it.

## 1. Project Overview

**Proxymity** is a real-time collaborative tool for debugging APIs. Think of it as a "Multiplayer Postman". It allows developers to join a room, edit HTTP requests (method, URL, headers, body) together, and execute them from the server.

### Architecture

The project is a **Monorepo** using `pnpm workspaces`.

- **Root**: Configuration files (`package.json`, `pnpm-workspace.yaml`, `tsconfig.json`).
- **packages/**:
  - **`client`** (`@proxymity/client`): React + Vite + TailwindCSS frontend.
  - **`server`** (`@proxymity/server`): Express + Socket.IO backend.
  - **`shared`** (`@proxymity/shared`): Shared TypeScript types (`types.ts`) and utilities.

### Data Flow

1. **Client**: User edits a request. State is updated locally and sent to Server via Socket.IO events.
2. **Server**: Receives events, updates the in-memory `RoomState`, and broadcasts changes to other clients.
3. **Execution**: When "Send" is clicked, Server performs the HTTP request (using `axios`) and emits the response back to the room.

---

## 2. Agentic Coding Guidelines (Best Practices)

When working on this codebase, follow these rules to ensure consistency and stability:

### Shared Types First

- **Golden Rule**: If you are adding a new feature that involves data exchange between Client and Server, **ALWAYS** update `packages/shared/src/types.ts` first.
- **Why?** Both packages depend on it. Changing it one place ensures type safety across the full stack.

### Monorepo Management

- **Package Installation**: Use `pnpm add <package> --filter <workspace_name>`.
  - Example: `pnpm add axios --filter @proxymity/server`
- **Running locally**:
  - Refer to the **`scripts`** section in the root `package.json`.
  - Typically, there is a dev command (e.g., `npm run dev`) that starts both Client and Server.
  - Check `vite.config.ts` (Client) and `index.ts` (Server) for port configurations.

### Server Pattern (Socket.IO)

- **Handlers**: Logic is split into "Handlers" (e.g., room management, request execution).
- **Services**: Complex business logic (e.g., executing HTTP requests via a proxy) resides here.
- **Events**: Event names should follow a consistent naming convention (e.g., `domain:action`). Defined in `@proxymity/shared`.

### Client Pattern (React + Zustand)

- **Store**: Global state is managed by a state management library (currently **Zustand**).
  - The store holds the `request` state, `response`, and `activeUsers`.
  - Actions in the store usually trigger side effects (like Socket.IO emits) via custom hooks.
- **Components**: UI components should be small and focused. Use `shadcn/ui` style patterns if available (Project uses `radix-ui` primitives and Tailwind).
- **Tailwind**: Use `globals.css` for theme variables.

---

## 3. Directory Map

### `@proxymity/server`

- `src/handlers/`: Socket event listeners.
- `src/services/`: Business logic (e.g., Proxy Service, State Store).
  - _Note: Persistence is currently in-memory. Security restrictions (like blocking localhost) may apply._

### `@proxymity/client`

- `src/App.tsx`: Main entry/layout.
- `src/components/`: Reusable UI components.
- `src/store/`: State management.
- `src/hooks/`: Custom hooks (e.g., for Socket.IO connection and events).

### `@proxymity/shared`

- `src/types.ts`: **CRITICAL**. Defines `IRequestData`, `IResponseData`, `IRoomState`.
