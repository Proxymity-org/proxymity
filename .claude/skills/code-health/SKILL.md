---
name: code-health
description: Audita el repositorio buscando code smells, dead code, complejidad innecesaria y problemas de rendimiento, con hallazgos priorizados y accionables. Úsalo para revisar calidad de código, deuda técnica, o cuando el usuario diga "revisa el código", "qué tan sano está el proyecto", o mencione un área específica a analizar.
---

# Code Health

Audita la salud del código fuente. Objetivo: hallazgos específicos y accionables, no observaciones genéricas.

## Paso 0: Determinar alcance

Si el usuario menciona un área específica, limitar el análisis a esa área. Si no especifica, analizar el repositorio completo.

## Proceso

1. **Leer CLAUDE.md** para entender las convenciones del proyecto antes de evaluar consistencia.

2. **Ejecutar herramientas de análisis estático** — datos objetivos antes del análisis manual:
   ```bash
   pnpm knip                            # código muerto y dependencias sin usar
   pnpm --filter @proxymity/client lint # problemas de ESLint
   ```

3. **Escanear el código** buscando:

   | Categoría | Qué buscar |
   |-----------|------------|
   | Code smells | Funciones largas (>50 líneas), archivos con demasiadas responsabilidades, código duplicado, nesting excesivo (>3 niveles), nombres ambiguos |
   | Clean Code | Funciones con múltiples responsabilidades, mezcla de niveles de abstracción, side effects ocultos, flag arguments, funciones con >3 parámetros |
   | Código muerto | Exports no importados, funciones no llamadas, variables asignadas pero no leídas (complementar con knip) |
   | Complejidad | Lógica condicional enredada, abstracciones prematuras o insuficientes, acoplamiento alto entre módulos |
   | Rendimiento | Re-renders innecesarios en React, subscripciones demasiado amplias en Zustand, listeners de WebSocket que no se limpian, operaciones síncronas costosas en el render path |
   | Consistencia | Patrones mixtos para lo mismo, convenciones rotas respecto a CLAUDE.md |
   | Tipado | Uso de `any`, type assertions innecesarias, tipos que deberían estar en `shared` pero están locales |

4. **Priorizar** los hallazgos más impactantes:
   - **Alta**: Bugs potenciales, problemas de rendimiento medibles, código que bloquea agregar funcionalidad nueva
   - **Media**: Code smells que aumentan deuda técnica, inconsistencias que confunden
   - **Baja**: Mejoras cosméticas, refactors de conveniencia

   Si hay más de 10 hallazgos, reportar los 8 más críticos: *"Encontré X en total. Aquí los 8 más críticos — ¿quieres ver el resto?"*

5. **Presentar cada hallazgo**:

   ### [Categoría] Nombre del hallazgo
   **Severidad**: Alta / Media / Baja
   **Ubicación**: `archivo:línea`
   **Problema**: Qué se detectó y por qué importa.
   **Sugerencia**: Acción concreta, con ejemplo de código si aplica.
   **Esfuerzo**: Trivial / Pequeño / Moderado
   **Principio violado**: (solo para categorías Clean Code y Tipado — omitir en Rendimiento, Código muerto, Consistencia)

6. **Resumen final**: conteo por severidad, top 3 acciones recomendadas, qué está bien.

7. **Ofrecer siguiente paso**: ¿convertir hallazgos en issues con `/create-issue`? ¿aplicar alguna corrección directamente?

## Reglas

- No reportar falsos positivos. Si no estás seguro, no lo incluyas.
- No sugerir refactors que cambien la API pública o el contrato de WebSocket sin advertirlo explícitamente.
- Considerar el tamaño del proyecto — no aplicar estándares de enterprise a un proyecto pequeño.
- Ser específico: "esta función en este archivo", nunca "el código podría mejorar".
- No sugerir agregar herramientas o librerías salvo que resuelva un problema concreto encontrado.
- No aplicar ningún cambio sin confirmación explícita.
