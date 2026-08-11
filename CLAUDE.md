# COIPO_INCENDIO_DASHBOARD — Guía para Claude Code

## Qué es este proyecto

Panel de situación de incendios forestales de CONAF (Corporación Nacional Forestal), Gerencia de Protección contra Incendios Forestales. Es un dashboard de monitoreo de la temporada de incendios forestales en Chile (por temporada, ej. "2026-2027"), con actualización periódica (cada 5 minutos según el diseño de referencia).

**Objetivo real de la fidelidad con el Power BI de referencia: validación de datos, no solo estética.** Este dashboard nuevo se está construyendo para confirmar que los datos propios (el ETL que se va a construir) producen los **mismos números** que el Power BI de referencia — no basta con que el layout se vea parecido. Implicancias concretas:
- Al construir el ETL, la prioridad es que las cifras (N° de incendios, superficie, desglose por estado, por región/comuna) calcen exactamente con las del Power BI para el mismo corte de fecha/hora.
- Cualquier discrepancia numérica frente al Power BI se trata como un bug a investigar (fuente de datos distinta, regla de negocio distinta, corte de tiempo distinto, timezone, redondeo), no como una diferencia aceptable de metodología.
- Falta definir un mecanismo de validación (ej. comparar snapshot del nuevo dashboard vs. el Power BI al mismo timestamp) antes de considerar los números del nuevo sistema confiables para publicar.

**Audiencia: público general.** No es una herramienta interna para analistas (a diferencia de INTERNO_SAFF) — debe ser entendible sin contexto previo, sin jerga técnica, con buena legibilidad y accesibilidad. Esto pesa en cada decisión de UI: tooltips/leyendas explicando estados, contraste de color adecuado (no depender solo del color para distinguir estados — los íconos de llama por color ya ayudan, pero agregar texto/label siempre), y layout responsive (no asumir que el público accede solo desde un monitor grande).

**Alcance del proyecto: multi-vista.** Esta es la primera de al menos ~10 pantallas planeadas. Se construye primero esta vista sola; no se debe overengineer con routing/arquitectura multi-página todavía, pero sí tenerlo en mente al nombrar componentes y organizar `src/` (evitar decisiones que sean costosas de revertir cuando aparezcan las siguientes vistas).

Stack: **React 19 + Vite + Tailwind v4**, JavaScript (no TypeScript). Gráficos con **Recharts 2.x** (ver gotcha abajo), mapa con **Leaflet + react-leaflet**, descompresión gzip con **pako**.

## Estado actual del proyecto

- La primera vista ("Situación Actual Incendios Forestales") está **construida y funcionando** contra el archivo real `frontend/public/data/incendios.json.gz`. Ver "Estructura de archivos" abajo.
- No hay backend ni router todavía — sigue siendo una SPA de una sola vista (home / `/`), a propósito, hasta que se definan las siguientes ~10 pantallas.
- Los KPIs de la temporada actual (19 incendios / 16.6ha) calzan exactamente con la captura de referencia del Power BI — es la validación más fuerte que hay hasta ahora de que la lógica de negocio (temporada, `tipo === 'Incendio'`, agregaciones) está bien implementada. Si en el futuro este número deja de calzar contra el Power BI real, sospechar primero de un cambio en los datos (el dataset real crece con el tiempo) antes que del código.

## Estructura de archivos

| Archivo | Rol |
|---|---|
| `src/lib/derive.js` | Toda la lógica de negocio (temporada, vigente, filtros, agregaciones por región/fecha/hora, formato). Verificado contra el dataset real — ver nota abajo. Único lugar que debe cambiar si una regla de negocio cambia. |
| `src/lib/estados.js` | Los 5 estados de incendio, su color y su orden canónico (gris/azul/rojo-naranjo/amarillo/verde). |
| `src/lib/regiones.js` | Las 16 regiones de Chile en orden norte-sur, con el nombre exacto tal como viene en el dato. |
| `src/lib/geo.js` | Centroides aproximados por región + jitter determinístico por id, para el mapa (ver limitación de datos abajo). |
| `src/lib/useIncendios.js` | Hook que hace fetch + descompresión + parseo del JSON, con refresco cada 5 min. |
| `src/components/*.jsx` | Header, Footer, KpiRow, LeftPanel (filtros + tabla región/comuna + 2 gráficos), FireMap, RightPanel (tabla hoy + listado). Todos reciben datos ya calculados vía props — no recalculan lógica de negocio. |
| `src/App.jsx` | Único punto que orquesta: carga datos, aplica filtros, llama a `derive.js`, arma las props de cada componente. |

## Vista principal — "Situación Actual Incendios Forestales"

Vista única por ahora (home / `/`). Layout de una sola pantalla tipo dashboard — evitar scroll de página completa; cada bloque interno (tablas, mapa) scrollea por su cuenta si el contenido excede el alto disponible.

### 1. Encabezado (barra roja institucional, ancho completo)
- Izquierda: 3 logos institucionales (Gobierno de Chile, CONAF, tercer sello del programa de incendios forestales)
- Centro: título `SITUACIÓN ACTUAL INCENDIOS FORESTALES` + subtítulo con la temporada activa (ej. "Temporada 2026-2027")
- Derecha: "Fecha y hora:" con fecha/hora de la última actualización + leyenda "Actualización cada 5 minutos"

### 2. Fila de KPIs (debajo del encabezado)
Cuatro bloques horizontales separados por líneas verticales:
1. **N° de incendios** — número grande con ícono de llama (incendios vigentes/temporada)
2. **Superficie (ha)** — número grande, mismo estilo visual
3. **Incendios de magnitud (>200 ha) vigentes** — dos métricas lado a lado: N° de incendios / Superficie (ha)
4. **Estado actual de los incendios** — 5 estados con ícono de llama coloreado + contador, en este orden y color:
   - Gris = En trayecto
   - Azul = Bajo observación
   - Rojo/naranjo = En Combate
   - Amarillo = Controlado
   - Verde = Extinguido (hoy)

Regla de formato: valores en cero se muestran como `--`, nunca `0`.

### 3. Columna izquierda
- **Filtros**: Región (dropdown, default "Todas"), Estado (dropdown, default "Todas"), rango de Fecha (dos date pickers, default = inicio de temporada hasta hoy)
- **Tabla "N° de incendios y superficie afectada por región y comuna"**: árbol expandible Región → Comuna; columnas Región | N° incendios | Superficie (ha); columna Superficie con shading tipo heatmap proporcional al valor; fila Total al final en negrita
- **Gráfico de barras "N° incendios por fecha de inicio"**: eje X = fechas de la temporada, eje Y = conteo de incendios
- **Gráfico de barras "N° incendios por rango de hora"**: eje X = hora del día (0-23), eje Y = conteo de incendios

### 4. Columna central — Mapa
Mapa de Chile continental con marcador por incendio, color = estado (mismo código de color que el punto 2). Controles estilo Esri/ArcGIS: capas, leyenda, herramienta de selección, búsqueda, compartir. Zoom inicial: Chile completo. Atribución del proveedor de mapas visible al pie del mapa.

Nota de negocio que debe quedar visible sobre el mapa: **"Vigente: Incendio que aun no ha sido declarado extinguido."**

### 5. Columna derecha
- **Tabla "Incendios en el día de hoy"**: una fila por cada una de las 16 regiones de Chile (siempre todas listadas, incluso en 0 — Magallanes incluida aunque quede fuera del recorte visible de la referencia); columnas Región | Total incendios | En trayecto | Bajo observación | En combate | Controlado | Extinguido (hoy) | Superficie (ha); fila Total al final
- **Tabla "Listado de incendios registrados durante la temporada"**: columnas Nombre | Región | Comuna | Superficie (ha) (ordenable) | Estado | Inicio; scroll interno, sin paginación visible

### 6. Pie de página (barra roja, igual estilo que el encabezado)
- Texto con el rango de la temporada (ej. "Temporada 2026-2027 desde el 01 de julio 2026 al 30 de junio 2027")
- Botón de refresco manual (ícono de recarga circular) en la esquina inferior derecha

## Convenciones de estilo (extraídas de la referencia visual)

- Rojo institucional CONAF para encabezado, pie de página, y banner de título de cada tabla/gráfico (texto blanco sobre fondo rojo)
- Código de color de estado de incendio — usar el mismo en KPIs, tabla "hoy" y mapa (ver punto 2)
- Tablas: encabezado de columna gris claro, zebra striping sutil en filas, columnas numéricas alineadas a la derecha
- Números grandes de KPI en rojo oscuro, bold

## Fuentes de datos

Fuente: tabla `incendio` de SIDCO (CONAF), espejada en DuckDB, exportada por un ETL externo a **`frontend/public/data/incendios.json.gz`** — JSON array (~211.800 registros), sin backend propio (mismo patrón que INTERNO_SAFF con `public/data2/*.csv.gz`).

Esquema de cada elemento (tipo `Incendio` en `derive.js`/componentes):

| Campo | Tipo | Notas |
|---|---|---|
| `id` | number | Nunca nulo. |
| `nombre` | string \| null | Nulo en algunos registros — no asumir string. |
| `tipo` | `'Foco'` \| `'Incendio'` \| null | **Filtrado en el primer paso de `App.jsx`** — ver regla de negocio abajo, es la más crítica del proyecto. |
| `region` | string \| null | Uno de los 16 valores de `regiones.js`, o null. |
| `comuna` | string \| null | |
| `superficieHa` | number \| null | **null ≠ 0** — dato no registrado en origen, no superficie cero. `formatHa` solo muestra `'--'` para null, nunca oculta un 0 real. |
| `estado` | string | Uno de los 5 de `estados.js`. Nunca nulo. |
| `inicio` | string ISO `'YYYY-MM-DDTHH:MM:SS'` \| null | Hora local de Chile, **sin timezone** — parsear con `fechaHoraLocal()` (split de string), nunca `new Date(inicio)` directo, para no reinterpretar la hora con el timezone del navegador. |

Reglas de negocio (implementadas en `derive.js`, no reimplementar en componentes):
- **Solo `tipo === 'Incendio'` cuenta para esta vista** (`esIncendioFormal`/`soloIncendiosFormales` en `derive.js`, aplicado como primer paso en `App.jsx` antes de cualquier filtro de usuario). Un "Foco" es un punto de calor detectado que puede o no escalar a incendio — el Power BI de referencia NO los cuenta. Verificado con datos reales: incluyendo Focos la temporada 2026-2027 da 26 incendios/16.61ha; filtrando solo 'Incendio' da 19/16.57ha, que calza con la referencia (19/16.6). Si algún día se necesita mostrar Focos, debe ser explícito (ej. un filtro nuevo), nunca mezclado por defecto con incendios formales.
- **Temporada**: 1 de julio → 30 de junio del año siguiente, derivada de `inicio` (no viene en el dato).
- **Vigente**: `estado !== 'Extinguido'`.
- **"Estado actual de los incendios" (bloque 4 de KPIs) y "Extinguido (hoy)"**: se calculan sobre incendios cuyo `inicio` cae HOY (mismo set que la tabla "Incendios en el día de hoy"), **no** sobre el total de la temporada — el dataset no trae fecha de extinción, así que "extinguido hoy" se aproxima como "empezó hoy y ya está extinguido". Si se usara el total de la temporada acá, el número queda dominado por el histórico completo de extinguidos y deja de decir algo útil.
- **"Incendios de magnitud >200ha vigentes"**: vigentes ahora mismo (no acotado a temporada ni a los filtros de fecha del usuario — es una foto del presente).
- **`hoyEnChile()`** usa `Intl.DateTimeFormat` con `timeZone: 'America/Santiago'` en vez de la hora local del navegador, para que "hoy" sea consistente sin importar dónde esté el usuario (recordar: audiencia es público general).

## Limitaciones conocidas

- **El mapa no tiene coordenadas reales por incendio.** El dato solo trae `region`/`comuna`, no lat/lng. `geo.js` posiciona cada incendio en un punto aproximado (centroide de la capital regional + jitter determinístico por `id`) — está declarado en pantalla como aproximado. Si se necesita precisión real, hay que pedirle al ETL/SIDCO coordenadas por incendio o al menos por comuna.
- **Proveedor de mapa**: se usa OpenStreetMap (tiles públicos, sin API key) en vez de Esri/ArcGIS como en la referencia visual — decisión de proveedor todavía pendiente de confirmar con el usuario.
- **Logos institucionales**: son placeholders (círculos con iniciales) en `Header.jsx` — no tenemos los assets oficiales de Gobierno de Chile/CONAF todavía.
- **Tabla "Incendios en el día de hoy"** (8 columnas) necesita scroll horizontal interno dentro de la columna derecha (~420px) — no entra completa sin scroll a ese ancho.

## Gotchas técnicos (ya resueltos, no reintroducir)

- **Recharts 3.x no renderiza con React 19.2.x** (bug abierto upstream, [recharts#6857](https://github.com/recharts/recharts/issues/6857)): las barras quedan vacías (`<g class="recharts-inactive-bar">` sin `<rect>` adentro) sin ningún error en consola. Se downgradeó a **Recharts 2.15.x** (misma API pública, cero cambios de código) — no actualizar a Recharts 3 hasta que ese issue se resuelva.
- **`Content-Encoding: gzip` en archivos `.gz` servidos como estáticos**: tanto Vite dev (sirv) como muchos servidores de producción (nginx `gzip_static`, etc.) detectan la extensión `.gz` y descomprimen por transporte automáticamente — el navegador ya entrega el JSON plano en `fetch().arrayBuffer()`. `useIncendios.js` detecta el magic byte gzip (`0x1f 0x8b`) antes de decidir si descomprimir con `pako` o no, para funcionar en ambos escenarios (servidor que sí decodifica vs. uno que sirve el `.gz` tal cual).
- Al instalar/actualizar dependencias con cambios de paquete de gráficos/UI, correr `rm -rf node_modules/.vite` antes de reiniciar el dev server — Vite puede cachear el pre-bundle viejo y esconder el fix.

## Preguntas abiertas

- ¿Cuáles son las ~10 pantallas adicionales planeadas y en qué orden se construyen? (define si conviene meter router desde ya o esperar)
- ¿Cuál es la fuente de datos que alimenta el Power BI de referencia actual? (el ETL nuevo debería beber de la misma fuente, o de una equivalente, para poder calzar cifras)
- ¿Cómo se va a validar número a número contra el Power BI antes de publicar? (¿snapshot manual lado a lado? ¿script de diff automatizado?)
- ¿Se consigue algún día coordenadas reales por incendio/comuna para el mapa, o se acepta la aproximación por región de forma permanente?
- ¿Proveedor de mapa final: OpenStreetMap (gratis, ya andando) o Esri/ArcGIS (como la referencia visual, requiere licencia)?