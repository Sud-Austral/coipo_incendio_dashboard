# COIPO Incendios Forestales — Dashboard 10/10

Rediseño operacional del dashboard de incendios forestales a partir de la versión original entregada.

## Qué incluye

- Situación actual separada de incendios iniciados hoy.
- KPIs operacionales: incendios del período, superficie, vigentes, en combate, observación, controlados y magnitud >200 ha.
- Mapa central con marcadores por estado y tamaño proporcional a superficie.
- Ranking de incendios prioritarios.
- Panel de detalle al seleccionar un incendio.
- Distribución regional y evolución diaria.
- Distribución horaria de inicio.
- Comparación de temporada actual con temporada anterior cuando los datos lo permiten.
- Filtros de región, estado y fecha.
- Estado de frescura de los datos: no se inventa una actualización cuando el archivo local no contiene registros recientes.
- Diseño responsive y accesible, con estado identificado por color + texto/icono.

## Ejecutar

```bash
cd frontend
npm install
npm run dev
```

Luego abrir la URL mostrada por Vite.

## Build de producción

```bash
cd frontend
npm run build
```

## Fuente de datos

Se conserva el archivo:

`frontend/public/data/incendios.json.gz`

El dashboard cuenta solamente registros `tipo === "Incendio"`, manteniendo la lógica de negocio de la versión original.
