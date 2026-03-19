---
name: create-pr
description: Crea un Pull Request completo: genera el branch, analiza el diff contra main y rellena la descripción con la template del repo. Úsalo cuando el usuario diga "crea un PR", "sube los cambios", "abre un pull request", o quiera enviar una feature o fix a revisión.
disable-model-invocation: true
---

# Create PR

Crea un Pull Request completo: genera el branch si no existe, analiza el diff contra main, rellena la template del repo y vincula la issue. Opcionalmente mueve la tarjeta del Project a "In review".

## Convenciones del repo

- **Branch**: `type/descripcion-kebab-case`
- **PR title**: igual que el branch pero guiones → espacios (ej: `feat/websocket-frontend-integration` → `feat/websocket frontend integration`)
- **Tipos**: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`
- **Commits**: una línea, `type: descripción corta`. Sin body ni co-authored-by.

## Proceso

### 1. Recopilar contexto

```bash
git status
git log main..HEAD --oneline
git diff main...HEAD --stat
```

- Sin commits sobre main → avisar que no hay cambios.
- Con cambios sin commitear → preguntar si quiere commitearlos primero.
- Con issue asociada: tomar el número de la conversación o preguntar.

Obtener el diff completo para entender qué cambió y por qué:
```bash
git diff main...HEAD
```

### 2. Determinar branch y tipo

**En un branch existente**: usarlo. Verificar si ya tiene PR abierto:
```bash
gh pr list --head <branch> --repo Proxymity-org/proxymity
```
Si ya existe un PR, mostrar la URL y preguntar si quiere actualizarlo o crear uno nuevo.

**En main**: determinar el tipo por los cambios, generar `type/descripcion-kebab-case` y crear el branch.

### 3. Verificar calidad

```bash
pnpm --filter @proxymity/client lint
pnpm knip
```

Reportar errores si los hay. Preguntar si quiere continuar de todas formas — a veces se crea el PR con errores pendientes intencionalmente.

### 4. Rellenar la descripción del PR

Verificar si existe `.github/pull_request_template.md` y leerla. Si no existe, usar esta estructura base:

```markdown
## 📋 Summary
- [qué cambió y por qué]
- Closes #<number> (si hay issue)

## 🛠 Type of Change
- [ ] 🐛 Bug fix  - [ ] ✨ New feature  - [ ] ♻️ Refactor  - [ ] ⚙️ Config / Chore  - [ ] 📄 Docs

## 🔍 How was it tested?
1. [pasos específicos según los archivos cambiados]

## 📸 Visual Evidence
| Before | After |
|--------|-------|
|  |  |

## 📝 Pending Technical Debt
[TODOs en el diff, si los hay]
```

Completar cada sección con el diff real:
- **Testing**: pasos específicos según qué paquete cambió (`client/` → browser, `server/` → requests/WebSocket, `shared/` → compilación)
- **Visual Evidence / Pending Technical Debt**: omitir la sección si no aplica

### 5. Presentar preview y esperar confirmación

```
Branch: feat/descripcion-feature
Title:  feat/descripcion feature
Closes: #12
---
[body completo]
```

### 6. Crear el PR

```bash
# Push — manejar el caso de que el branch ya exista en el remoto
if git ls-remote --exit-code origin <branch-name> > /dev/null 2>&1; then
  git push origin <branch-name>
else
  git push -u origin <branch-name>
fi

gh pr create \
  --repo Proxymity-org/proxymity \
  --base main \
  --head <branch-name> \
  --title "<título>" \
  --body "$(cat <<'EOF'
<body>
EOF
)"
```

### 7. Actualizar el Project (si hay issue vinculada)

Usar el número de issue identificado en el paso 1. Si no se registró en ese momento, buscarlo en la conversación o en el `Closes #N` del body del PR antes de continuar.

```bash
ITEM_ID=$(gh project item-list 1 --owner Proxymity-org --format json \
  | jq -r '.items[] | select(.content.number == <issue-number>) | .id')

if [ -n "$ITEM_ID" ]; then
  gh project item-edit --project-id PVT_kwDOD5bfyc4BSQNN --id $ITEM_ID \
    --field-id PVTSSF_lADOD5bfyc4BSQNNzg_16H0 --single-select-option-id df73e18b
fi
```

### 8. Reportar resultado

```
✓ PR creada: <url>
  Branch: <branch> → main
  Issue: Closes #<number> (movida a "In review")
```

## Reglas

- Nunca crear el PR sin confirmación.
- Nunca push a main directamente.
- El body se genera del diff real. Si algo no es claro, preguntar.
- No inventar pasos de testing — cada paso debe ser verificable con los cambios reales.
- Si el diff es >500 líneas y no hay una razón clara que justifique el tamaño (feature XL, scaffolding inicial, migración masiva, refactor global), sugerir dividir en PRs más pequeños.
