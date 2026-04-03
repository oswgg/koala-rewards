# koalacards Monorepo

Estructura base del monorepo:

```text
.
├─ apps/
│  ├─ api/
│  ├─ web/
│  └─ <futuras-apps>/   # mobile, desktop, etc.
├─ packages/
│  └─ loyalty/
│     ├─ core/ (modulos de dominio/servicios)
│     └─ data/ (modulos de acceso a datos)
└─ package.json
```

## Convenciones

- `apps/`: aplicaciones ejecutables (frontend, backend, mobile, desktop, etc.).
- `packages/`: librerias compartidas y reutilizables entre apps.
- `packages/loyalty`: paquete unificado que contiene logica de negocio y acceso a datos (`@koalacards/loyalty`).

## Workspaces

El monorepo esta configurado con Bun workspaces en la raiz:

```json
{
	"workspaces": ["apps/*", "packages/*"]
}
```

## Scripts utiles

Desde la raiz:

```bash
bun run dev
bun run build
bun run start
bun run lint
bun run typecheck
```
