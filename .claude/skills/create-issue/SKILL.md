---
name: create-issue
description: Crea GitHub Issues en el Project board con prioridad y tamaño predefinidos. Úsalo cuando el usuario quiera registrar hallazgos de /code-health o /design-advisor, reportar bugs, o añadir cualquier tarea al backlog.
disable-model-invocation: true
---

# Create Issue

Genera issues en GitHub a partir de hallazgos de `/code-health`, `/design-advisor`, bugs reportados, o cualquier tarea identificada en la conversación. Las coloca en el Backlog del Project board con campos completos.

## Contexto del proyecto

- **Repo**: `Proxymity-org/proxymity`
- **Project number**: `1`
- **Project ID**: `PVT_kwDOD5bfyc4BSQNN`
- **Status field ID**: `PVTSSF_lADOD5bfyc4BSQNNzg_16H0`
- **Backlog option ID**: `f75ad846`
- **Priority field ID**: `PVTSSF_lADOD5bfyc4BSQNNzg_16NI`
- **Priority options**: High (`79628723`), Medium (`0a877460`), Low (`da944a9c`)
- **Size field ID**: `PVTSSF_lADOD5bfyc4BSQNNzg_16NM`
- **Size options**: XS (`6c6483d2`), S (`f784b110`), M (`7515a9f1`), L (`817d0097`), XL (`db339eb2`)

## Labels disponibles

| Label | Uso |
|-------|-----|
| `code-health` | Hallazgos del skill code-health |
| `design-decision` | Decisiones del skill design-advisor |
| `refactor` | Refactorización de código |
| `performance` | Mejoras de rendimiento |
| `tech-debt` | Deuda técnica |
| `clean-code` | Violaciones de principios Clean Code |
| `bug` | Bugs encontrados |
| `enhancement` | Features o mejoras nuevas |

## Proceso

### 1. Determinar origen

- **Contexto previo de skills**: Si hay hallazgos de `/code-health` o `/design-advisor` en la conversación, usarlos. Si son varios, presentar la lista y preguntar cuáles convertir.
- **Descripción manual**: Si el usuario describe un bug o tarea directamente, usar esa información.
- **Sin contexto**: Pedir que describa el hallazgo o que ejecute primero `/code-health` o `/design-advisor`.

### 2. Mapear severidad a campos del Project

| Origen / Severidad | Priority | Size sugerido |
|--------------------|----------|---------------|
| code-health: Alta | High | M o L |
| code-health: Media | Medium | S o M |
| code-health: Baja | Low | XS o S |
| design-advisor | Medium | M |
| Bug manual | High | S a M |
| Enhancement | Medium | S a L |

El usuario puede ajustar antes de crear.

### 3. Seleccionar labels

- **Origen**: `code-health`, `design-decision`, `bug`, o `enhancement`
- **Categoría adicional**: `refactor`, `performance`, `tech-debt`, `clean-code` si aplica

Máximo 3 labels por issue.

### 4. Presentar preview y esperar confirmación

Mostrar un resumen por issue antes de crear:

```
Issue 1: [Título accionable]
Labels: code-health, refactor
Priority: Medium | Size: S

Issue 2: [Título accionable]
Labels: design-decision
Priority: Medium | Size: M
```

**No crear sin confirmación explícita.**

### 5. Crear las issues

Para cada issue confirmada:

**a) Buscar duplicadas**:
```bash
gh issue list --repo Proxymity-org/proxymity --search "<términos clave>" --state all
```
Si existe una similar abierta, advertir y pedir confirmación. Si está cerrada, mencionarlo como contexto.

**c) Crear la issue y capturar la URL en el mismo paso**:
```bash
ISSUE_URL=$(gh issue create \
  --repo Proxymity-org/proxymity \
  --title "Verbo + descripción accionable" \
  --label "label1,label2" \
  --body "$(cat <<'EOF'
## Contexto

[Origen del hallazgo]

## Problema

[Descripción clara del problema o decisión pendiente]

## Ubicación

[Archivos y líneas afectadas, si aplica]

## Propuesta

[Acción concreta sugerida]

## Criterios de aceptación

- [ ] [Criterio específico y verificable]
- [ ] Tests pasan / Sin regresiones (omitir si es design-decision o docs)

## Notas

- **Principio violado**: [si aplica]
- **Esfuerzo estimado**: Trivial / Pequeño / Moderado
EOF
)")
```

**d) Agregar al Project con la URL capturada**:
```bash
ITEM_ID=$(gh project item-add 1 --owner Proxymity-org --url "$ISSUE_URL" --format json | jq -r '.id')

if [ -z "$ITEM_ID" ]; then
  echo "Issue creada ($ISSUE_URL) pero no se pudo agregar al Project. Hacerlo manualmente."
else
  gh project item-edit --project-id PVT_kwDOD5bfyc4BSQNN --id $ITEM_ID \
    --field-id PVTSSF_lADOD5bfyc4BSQNNzg_16H0 --single-select-option-id f75ad846

  gh project item-edit --project-id PVT_kwDOD5bfyc4BSQNN --id $ITEM_ID \
    --field-id PVTSSF_lADOD5bfyc4BSQNNzg_16NI --single-select-option-id <priority-option-id>

  gh project item-edit --project-id PVT_kwDOD5bfyc4BSQNN --id $ITEM_ID \
    --field-id PVTSSF_lADOD5bfyc4BSQNNzg_16NM --single-select-option-id <size-option-id>
fi
```

### 6. Reportar resultado

| # | Issue | Priority | Size | Labels | Project |
|---|-------|----------|------|--------|---------|
| 1 | [título](url) | Medium | S | code-health, refactor | ✓ Backlog |

Si alguna issue no se pudo agregar al Project, indicarlo para que el usuario lo haga manualmente.

## Reglas

- **Nunca crear issues sin confirmación.**
- Una issue por hallazgo. No agrupar.
- Título accionable, empieza con verbo: "Extraer...", "Resolver...", "Decidir...", "Optimizar...".
- No crear duplicadas. Siempre buscar antes (estados `open` y `closed`).
- Criterios de aceptación verificables, no vagos.
