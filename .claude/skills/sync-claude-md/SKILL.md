---
name: sync-claude-md
description: Audita CLAUDE.md contra el código actual y propone correcciones donde haya discrepancias. Úsalo después de features o refactors significativos, o cuando CLAUDE.md pueda estar desactualizado.
---

# Sync CLAUDE.md

Verifica que CLAUDE.md refleje el estado real del proyecto y propone cambios concretos donde haya discrepancias. No modifica nada sin aprobación explícita.

## Proceso

1. Leer CLAUDE.md completo.

2. Revisar cambios recientes para enfocar la auditoría:
   ```bash
   git log --oneline -20
   ```

3. Auditar cada sección de CLAUDE.md contra su fuente de verdad en el código:

   | Sección | Fuente de verdad |
   |---------|-----------------|
   | Arquitectura / packages | Directorios en `packages/` |
   | Eventos WebSocket | `packages/shared/src/events.ts` |
   | Tipos compartidos | `packages/shared/src/types.ts` |
   | Comandos | Scripts en `package.json` raíz y workspaces |
   | Stack técnico | Dependencias en cada `package.json` |
   | Componentes principales | `packages/client/src/components/` |
   | Convenciones | Verificar que los paths y patrones mencionados existan |

   Auditar **todas las secciones presentes** en CLAUDE.md, no solo las de la tabla. Para secciones sin fuente de verdad obvia en el código (ej: "Decisiones de diseño", "Filosofía del proyecto"), verificar que el contenido siga siendo coherente con el estado actual — si algo parece contradictorio o desactualizado, reportarlo y preguntar al usuario en vez de modificarlo directamente.

4. Proponer cada cambio en formato diff:

   ```diff
   - línea desactualizada
   + línea corregida
   ```

5. Aplicar solo después de confirmación. El usuario puede aprobar todo a la vez o sección por sección.

Si no hay discrepancias: decirlo explícitamente — "CLAUDE.md está sincronizado con el código actual."

## Reglas

- No inventar información. Solo reportar lo verificable leyendo el código.
- Mantener el estilo, idioma y formato del CLAUDE.md existente.
- No agregar secciones nuevas sin consultar al usuario.
