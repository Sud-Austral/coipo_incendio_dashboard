# Problema, reconstruido desde el codigo

Este documento se escribe hacia atras: primero se leyo lo que se construyo y
desde ahi se deduce que problema pudo haberlo motivado. La cadena de
inferencia es debil por definicion y va escrita como tal.

## Que estaba roto

[INFERIDO] El sistema presenta el estado de eventos de incendio agrupados por
region, por estado y por fecha, porque existen constantes de regiones
[frontend/src/lib/regiones.js], un catalogo de estados con color y metadatos
[frontend/src/lib/estados.js] y un componente de filtros
[frontend/src/components/Filters.jsx]. Luego probablemente habia un problema
para mirar esa informacion agrupada y filtrada en un solo lugar.

[INFERIDO] El sistema distingue lo que ocurre hoy de la situacion acumulada,
porque hay un panel especifico para el dia [frontend/src/components/TodayPanel.jsx]
separado del panel de tendencia [frontend/src/components/TrendPanel.jsx] y del
panel de temporada [frontend/src/components/SeasonPanel.jsx]. Luego
probablemente habia un problema para separar la urgencia del acumulado.

[INFERIDO] El sistema ordena los eventos por prioridad, porque existe un panel
de prioridad [frontend/src/components/PriorityPanel.jsx] y un umbral de
magnitud declarado como constante [frontend/src/lib/derive.js]. Luego
probablemente habia un problema para decidir a que mirar primero.

[INFERIDO] El sistema ubica los eventos sobre un mapa, porque hay un
componente de mapa que importa la libreria de cartografia
[frontend/src/components/FireMap.jsx:1] y un modulo con centroides y encuadre
inicial [frontend/src/lib/geo.js:2]. Luego probablemente habia un problema
para ver donde estan.

Todo lo anterior es hipotesis con respaldo, no un hecho del negocio. El codigo
dice que se construyo; no dice que se quiso resolver ni para quien.

## Quien sufre el problema

[PENDIENTE] No hay guard, decorador, middleware de autorizacion ni tabla de
permisos en la evidencia, y el bloque de endpoints viene vacio. No hay ningun
rol tecnico que nombrar con cita.

[INFERIDO] Existe una vista rotulada como ejecutiva
[frontend/src/components/ExecutiveView.jsx] junto a la vista general
[frontend/src/App.jsx:49], lo que sugiere al menos dos publicos distintos con
distinto nivel de detalle. Que publicos son, y si esa separacion responde a
cargos o solo a formato de pantalla: [PENDIENTE].

Cuantas personas son: [PENDIENTE] siempre.

## Como lo resolvian antes

[INFERIDO] Los datos llegan como un archivo unico depositado en el propio
repositorio [frontend/public/data/incendios.json.gz], no desde un servicio en
linea, porque el bloque de endpoints de la evidencia esta vacio y la unica
lectura de datos declarada es una constante de ruta local
[frontend/src/lib/useIncendios.js]. Eso es compatible con un traspaso de
archivo entre areas, pero no lo prueba.

Quien producia y entregaba ese archivo, con que periodicidad y cuanto tardaba:
[PENDIENTE].

[INFERIDO] El README del repositorio se refiere a una version anterior del
tablero cuya logica de negocio se conserva [README.md:1]. Existia entonces
algo antes de esto. Que era, quien lo hizo y por que se rehizo: [PENDIENTE].

## Que pasa si no se hace nada

[PENDIENTE], sin excepcion. El codigo no lo responde, y que el sistema exista
no es una respuesta.

## Volumen

[INFERIDO] El archivo de datos comprimido pesa cerca de 4,6 MB
[frontend/public/data/incendios.json.gz]. Un archivo comprimido de ese tamano
con registros de eventos sugiere un orden de magnitud de decenas de miles de
filas, no de cientos ni de millones. Es un indicio de tamano de archivo, no un
conteo.

[INFERIDO] Existe una constante de intervalo de refresco
[frontend/src/lib/useIncendios.js], lo que indica que el conjunto de datos se
espera cambiante en el tiempo. Con que frecuencia cambia de verdad:
[PENDIENTE].

La cifra real de registros, su periodo de cobertura y su tasa de crecimiento:
[PENDIENTE].

## Quien decide que esta terminado

[PENDIENTE], sin excepcion.
