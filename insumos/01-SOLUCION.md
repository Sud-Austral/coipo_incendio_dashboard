# Solucion, leida del codigo

## Que hace el sistema

[INFERIDO] Permite consultar eventos de incendio a partir de un unico conjunto
de datos que viaja con la aplicacion [frontend/public/data/incendios.json.gz],
cargado por un enganche de lectura que declara la ruta del dato y un intervalo
de refresco [frontend/src/lib/useIncendios.js]. Sobre ese conjunto permite
filtrar [frontend/src/components/Filters.jsx], ubicar los eventos en un mapa
[frontend/src/components/FireMap.jsx:1], seleccionar uno y ver su detalle
[frontend/src/components/DetailPanel.jsx], y leer indicadores agregados
[frontend/src/components/KpiRow.jsx].

[INFERIDO] Permite ademas mirar el mismo conjunto desde cinco cortes
distintos, cada uno con su propio panel: lo iniciado hoy
[frontend/src/components/TodayPanel.jsx], la evolucion en el tiempo
[frontend/src/components/TrendPanel.jsx], la distribucion por region
[frontend/src/components/RegionalPanel.jsx], la comparacion de temporada
[frontend/src/components/SeasonPanel.jsx] y el orden por prioridad
[frontend/src/components/PriorityPanel.jsx]. Y permite cambiar a una lectura
resumida distinta de la operativa [frontend/src/components/ExecutiveView.jsx],
alimentada por su propio modulo de derivacion
[frontend/src/lib/deriveExecutive.js].

[INFERIDO] Todo el calculo ocurre del lado de quien mira: los agregados salen
de modulos de derivacion que corren junto a la interfaz
[frontend/src/lib/derive.js], no de un servicio que los entregue ya
calculados. Esto se deduce de que el bloque de endpoints de la evidencia esta
vacio.

## Reglas de negocio que estan escritas en el codigo

[INFERIDO] Hay un umbral de magnitud declarado como constante con nombre
propio [frontend/src/lib/derive.js]. Ese umbral separa eventos en dos
categorias y por lo tanto es una regla de negocio, no una decision de
presentacion. Cual es el valor correcto del umbral y quien lo fija:
[PENDIENTE].

[INFERIDO] Hay un catalogo cerrado de estados con su color y su metadato
asociado [frontend/src/lib/estados.js] y un conjunto de claves de estado
declarado aparte [frontend/src/lib/derive.js]. Es decir, los estados posibles
de un evento estan fijados en el codigo, no vienen del dato. Si ese catalogo
coincide con el catalogo oficial del negocio: [PENDIENTE].

[INFERIDO] Hay un catalogo de regiones [frontend/src/lib/regiones.js] y
centroides geograficos por region con encuadre inicial del pais
[frontend/src/lib/geo.js:2], tambien fijados en el codigo.

[INFERIDO] El README del repositorio declara que solo se cuentan los registros
de un tipo determinado y que esa logica viene de la version anterior
[README.md:1]. Esa es una regla de negocio heredada; que la respalda:
[PENDIENTE].

## Roles: quien ve que

No hay ningun rol que citar, y esto es una ausencia afirmable porque el
analizador recorrio esas categorias completas:

- [INFERIDO] El bloque de endpoints de la evidencia esta vacio: no hay
  ninguna ruta de servidor ni ninguna llamada autenticada detectada.
- [INFERIDO] El bloque de variables de entorno de la evidencia contiene una
  sola entrada, y es la ruta base de publicacion
  [frontend/src/lib/useIncendios.js:6]. No hay variable de credencial, de
  proveedor de identidad ni de secreto.

[INFERIDO] En consecuencia, quien alcanza la direccion publicada ve el
conjunto completo de datos, porque el archivo se sirve como recurso estatico
junto a la aplicacion [frontend/public/data/incendios.json.gz].

[VERIFICAR] Si ese conjunto de datos contiene informacion que no deba quedar
accesible sin control de acceso, el diseno actual no lo impide. Esto lo cierra
Fiscalia o Auditoria, no el analizador, porque la evidencia entrega la ruta y
el peso del archivo, no su contenido.

## De donde salen los datos

[INFERIDO] La fuente es un archivo unico comprimido depositado en el
repositorio [frontend/public/data/incendios.json.gz], leido por la aplicacion
a traves de una constante de ruta [frontend/src/lib/useIncendios.js]. La
aplicacion declara una dependencia de descompresion
[frontend/package.json:15], lo que es consistente con que ese archivo se lea
comprimido en el navegador; consistente, no probado.

Quien es dueno de esa fuente, de que sistema se exporta y quien autoriza su
actualizacion: [PENDIENTE].

## Que NO hace

Solo se listan ausencias que el analizador comprobo de forma exhaustiva:

- [INFERIDO] No existe ningun endpoint de ningun tipo: el bloque de API de la
  evidencia esta vacio. No hay, por lo tanto, ninguna ruta de exportacion,
  descarga o informe servida por el sistema.
- [INFERIDO] No existe ninguna tabla de base de datos: el bloque
  correspondiente de la evidencia esta vacio. El sistema no persiste nada.
- [INFERIDO] No hay dependencias de servidor declaradas: los bloques de
  dependencias de Python vienen vacios y el unico manifiesto de dependencias
  de la evidencia es el de la interfaz [frontend/package.json].

Estas ausencias describen lo que el sistema no contiene. No permiten afirmar
que el proceso completo carezca de esas funciones en otro lugar.

## Como se publica

[INFERIDO] Existen dos flujos de integracion continua clasificados por la
evidencia como archivos de despliegue [.github/workflows/deploy.yml] y
[.github/workflows/readme.yml]. La existencia de una variable de ruta base
[frontend/src/lib/useIncendios.js:6] es consistente con una publicacion en un
subdirectorio y no en la raiz de un dominio. Donde se publica realmente y quien
administra ese destino: [PENDIENTE].

## Iteraciones

[INFERIDO] El README declara ser un rediseno de una version anterior entregada
[README.md:1]. Hay entonces al menos dos iteraciones. No hay etiquetas,
CHANGELOG ni migraciones numeradas en la evidencia con las que fechar ninguna
de las dos: [PENDIENTE].

## Donde el analizador quedo ciego

- El contenido del conjunto de datos [frontend/public/data/incendios.json.gz]
  no se leyo: no se sabe que columnas trae, que periodo cubre ni cuantas filas
  tiene.
- Los pasos concretos de los dos flujos de publicacion no se leyeron.
- El archivo de instrucciones internas [CLAUDE.md] aparece en la evidencia
  solo como origen de dos coincidencias de palabra clave [CLAUDE.md:5] y
  [CLAUDE.md:16]; su contenido no se incorporo.
