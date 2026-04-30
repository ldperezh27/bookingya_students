# Explicación Técnica de la Carpeta `playwright`

## 1. Propósito de esta carpeta

La carpeta `playwright` contiene la automatización ATDD del módulo de reservas de BookingYa. Su objetivo es validar, desde el comportamiento observable de la API real, que las funcionalidades principales de reservas cumplen los criterios de aceptación definidos a partir del enunciado académico y del análisis del backend.

Esta carpeta no implementa TDD ni BDD. Su alcance es exclusivamente ATDD con Playwright + TypeScript.

## 2. Qué es Playwright y por qué se usó aquí

Playwright es un framework de automatización creado para probar aplicaciones web y APIs. Aunque normalmente se asocia con automatización de navegador, también incluye capacidades sólidas para pruebas de API HTTP.

En este proyecto se usó Playwright para API testing por estas razones:

- El sistema disponible en el repositorio es un backend REST.
- La fase pedida es ATDD, no pruebas visuales de frontend.
- La validación por API es la forma más estable y directa de comprobar el comportamiento real del sistema.
- Permite ejecutar escenarios automatizados, generar resultados repetibles y producir un reporte HTML.

## 3. Qué significa ATDD en este trabajo

ATDD significa Acceptance Test-Driven Development. En este contexto académico, se traduce en definir criterios de aceptación orientados al usuario o al negocio y automatizarlos para verificar que el sistema real cumple esos comportamientos.

En esta carpeta, ATDD se aplicó así:

1. Se analizó el backend real.
2. Se identificaron rutas, contratos y respuestas HTTP observables.
3. Se definieron escenarios de aceptación sobre reservas.
4. Se automatizaron esos escenarios con Playwright + TypeScript.
5. Se ejecutó la suite contra el sistema bajo prueba.

## 4. Estructura de la carpeta `playwright`

```text
playwright/
  .env
  .env.example
  .gitignore
  package.json
  playwright.config.ts
  tsconfig.json
  README.md
  data/
    reservation-data.ts
  services/
    api-client.ts
    guest-api.ts
    reservation-api.ts
    room-api.ts
  tests/
    reservations/
      reservation-create.spec.ts
      reservation-delete.spec.ts
      reservation-list.spec.ts
      reservation-negative.spec.ts
      reservation-read.spec.ts
      reservation-test-support.ts
      reservation-update.spec.ts
      reservation-user.spec.ts
  utils/
    assertions.ts
    env.ts
    ids.ts
    test-data-builder.ts
  results/
    reporte-playwright-es.md
  explicacion/
    explicacion.md
```

## 5. Cómo está organizada la solución

La solución sigue una separación por responsabilidades para mantener el código limpio, legible y mantenible.

### 5.1 Configuración

- `package.json`: define dependencias y scripts de ejecución.
- `playwright.config.ts`: centraliza la configuración de Playwright.
- `tsconfig.json`: define la compilación TypeScript.
- `.env` y `.env.example`: definen la configuración variable de la suite.

### 5.2 Datos base

- `data/reservation-data.ts`: contiene valores base para huéspedes, habitaciones y reservas.

### 5.3 Utilidades

- `utils/env.ts`: carga variables de entorno y valida que tengan formato correcto.
- `utils/ids.ts`: genera identificadores únicos para datos de prueba y escenarios negativos.
- `utils/test-data-builder.ts`: construye payloads válidos para crear guest, room y reservation.
- `utils/assertions.ts`: concentra las aserciones reutilizables sobre contratos HTTP y cuerpos de respuesta.

### 5.4 Servicios de acceso a la API

- `services/api-client.ts`: encapsula la comunicación HTTP base.
- `services/guest-api.ts`: maneja llamadas al módulo de huéspedes.
- `services/room-api.ts`: maneja llamadas al módulo de habitaciones.
- `services/reservation-api.ts`: maneja llamadas al módulo de reservas.

### 5.5 Escenarios ATDD

- `tests/reservations/*.spec.ts`: contienen los escenarios de aceptación automatizados.
- `tests/reservations/reservation-test-support.ts`: crea precondiciones y cleanup común para no duplicar lógica entre escenarios.

### 5.6 Documentación y resultados

- `README.md`: explica instalación, configuración y ejecución.
- `results/reporte-playwright-es.md`: registra resultados de ejecución y hallazgos.
- `explicacion/explicacion.md`: este documento.

## 6. Explicación de cada archivo principal

## 6.1 `package.json`

Este archivo define:

- El nombre del proyecto de pruebas.
- Las dependencias necesarias para la suite.
- Los scripts para ejecutar los tests.

Dependencias principales:

- `@playwright/test`: framework de pruebas.
- `typescript`: soporte tipado y compilación estática.
- `@types/node`: tipos de Node.js.
- `dotenv`: carga de variables de entorno.

Scripts:

- `npm test`: ejecuta toda la suite.
- `npm run test:debug`: ejecuta con reporter de lista.
- `npm run test:one`: pensado para usar `--grep`.

## 6.2 `playwright.config.ts`

Este archivo define el comportamiento general de la suite.

Configuraciones importantes:

- `testDir`: indica dónde están las pruebas.
- `workers: 1`: fuerza ejecución secuencial para evitar interferencias entre escenarios que comparten estado persistido.
- `timeout`: timeout global por prueba.
- `reporter`: genera salida en consola y reporte HTML.
- `baseURL`: apunta al backend.
- `extraHTTPHeaders`: fija cabeceras JSON por defecto.

Esta configuración permite que todas las specs compartan una base estable sin repetir configuración.

## 6.3 `tsconfig.json`

Este archivo configura TypeScript para la carpeta de automatización.

Puntos importantes:

- `target: ES2022`: salida compatible con un runtime moderno.
- `module: Node16` y `moduleResolution: node16`: estrategia moderna de resolución de módulos.
- `strict: true`: fuerza chequeo estricto de tipos.
- `noEmit: true`: no genera archivos compilados.

El objetivo aquí es detectar problemas temprano sin añadir complejidad de build.

## 6.4 `.env` y `.env.example`

Permiten separar la configuración del código.

Variables:

- `BASE_URL`: URL base del backend.
- `API_TIMEOUT_MS`: timeout de llamadas HTTP.
- `TEST_TIMEOUT_MS`: timeout de cada prueba.

Esto permite mover la suite entre entornos sin editar código fuente.

## 6.5 `data/reservation-data.ts`

Contiene valores base reutilizables:

- prefijos para guests y rooms
- ciudad base
- capacidad de habitación
- precio base
- notas de reserva

No contiene datos fijos completos de prueba. Los builders agregan unicidad para evitar colisiones.

## 6.6 `utils/env.ts`

Responsabilidad:

- cargar `.env`
- normalizar la URL base
- validar timeouts numéricos

Esto evita que cada archivo tenga que resolver variables o manejar errores de configuración.

## 6.7 `utils/ids.ts`

Responsabilidad:

- generar sufijos únicos para datos de prueba
- generar UUIDs aleatorios para escenarios negativos

Esto ayuda a que las pruebas sean repetibles y no dependan de datos existentes.

## 6.8 `utils/test-data-builder.ts`

Este archivo es clave para mantener la suite estable.

Construye:

- `GuestInput`
- `RoomInput`
- `ReservationInput`

Funciones principales:

- `buildGuestInput()`
- `buildRoomInput()`
- `buildReservationInput()`

Ventajas de usar builders:

- se evita duplicar payloads en cada spec
- se centraliza el conocimiento del contrato esperado
- se pueden cambiar datos base en un único punto
- se generan datos únicos por ejecución

## 6.9 `utils/assertions.ts`

Este archivo encapsula validaciones repetidas para que las specs expresen comportamiento de negocio y no detalles de parsing o verificación.

Funciones principales:

- `expectGuestResponse()`
- `expectRoomResponse()`
- `expectReservationResponse()`
- `expectReservationListIncludes()`
- `expectDeleteSucceeded()`
- `expectErrorResponse()`

Beneficios:

- baja duplicación
- aserciones consistentes
- mensajes de validación más claros
- mayor mantenibilidad

## 6.10 `services/api-client.ts`

Es el cliente HTTP base.

Su responsabilidad es:

- recibir un `APIRequestContext` de Playwright
- aplicar la `baseUrl`
- aplicar timeouts
- ejecutar `GET`, `POST`, `PUT`, `DELETE`
- devolver respuestas sin fallar automáticamente por códigos 4xx/5xx esperados en pruebas negativas

Esto evita que las specs conozcan detalles técnicos repetitivos de construcción de URL o configuración de requests.

## 6.11 `services/guest-api.ts`, `room-api.ts`, `reservation-api.ts`

Estos archivos implementan fachadas por dominio.

### `guest-api.ts`

Se usa para:

- crear huéspedes de precondición
- eliminar huéspedes de cleanup

### `room-api.ts`

Se usa para:

- crear habitaciones de precondición
- eliminar habitaciones de cleanup

### `reservation-api.ts`

Se usa para:

- listar reservas
- consultar por id
- consultar por huésped
- crear reserva
- actualizar reserva
- eliminar reserva

La ventaja de estas fachadas es que las rutas reales del backend quedan aisladas del nivel de escenario.

## 6.12 `tests/reservations/reservation-test-support.ts`

Este archivo existe para que las specs no tengan que repetir setup y teardown.

Funciones principales:

- `provisionReservationPreconditions()`
- `cleanupReservationArtifacts()`

Qué hace:

1. crea un huésped válido
2. crea una habitación válida
3. devuelve referencias para cleanup
4. elimina reserva, habitación y huésped al final en orden seguro

Esto hace que cada escenario sea autónomo y disminuye el acoplamiento entre pruebas.

## 6.13 Specs ATDD

Cada archivo `*.spec.ts` representa un criterio de aceptación concreto.

### `reservation-create.spec.ts`

Valida que:

- se pueda crear una reserva válida
- la API responda `200`
- se genere un `id`
- la reserva pueda consultarse después

### `reservation-read.spec.ts`

Valida que:

- una reserva existente pueda consultarse por su identificador

### `reservation-list.spec.ts`

Valida que:

- el listado general incluya la reserva creada por la prueba
- no se dependa de conteos absolutos

### `reservation-user.spec.ts`

Valida que:

- `GET /api/reservation/guest/{guestId}` devuelva las reservas del huésped

### `reservation-update.spec.ts`

Valida que:

- una reserva existente pueda actualizarse
- los cambios persistan al consultar nuevamente

### `reservation-delete.spec.ts`

Valida que:

- una reserva existente pueda eliminarse
- una consulta posterior devuelva `404`

### `reservation-negative.spec.ts`

Valida que:

- consultar un `id` inexistente produzca `404`
- el mensaje de error corresponda al comportamiento real del backend

## 7. Cómo funciona una prueba típica en esta suite

El flujo general de una spec es:

1. Se crea una instancia del servicio API necesario.
2. Se preparan precondiciones con `provisionReservationPreconditions()`.
3. Se construye el payload con los builders.
4. Se ejecuta la acción del escenario.
5. Se validan código HTTP y cuerpo con las aserciones reutilizables.
6. Se limpian los datos creados en un bloque `finally`.

Esto garantiza que:

- la prueba sea independiente
- el escenario quede enfocado en aceptación
- haya cleanup incluso si la prueba falla

## 8. Cómo corre Playwright esta suite

Cuando se ejecuta:

```bash
npx playwright test
```

Playwright:

1. Lee `playwright.config.ts`.
2. Carga las pruebas dentro de `tests/`.
3. Crea el contexto de ejecución.
4. Inyecta `request` en cada test.
5. Ejecuta los escenarios.
6. Muestra resultados en consola.
7. Genera el reporte HTML.

En este proyecto no se abre navegador porque las pruebas usan el cliente HTTP de Playwright.

## 9. Cómo generar y leer el reporte HTML

Después de ejecutar:

```bash
npx playwright test
```

Playwright crea el reporte HTML en:

```text
playwright/playwright-report/index.html
```

Ese reporte permite ver:

- cuántas pruebas corrieron
- cuáles pasaron o fallaron
- duración por escenario
- estructura de ejecución

También se dejó un reporte funcional adicional en español:

```text
playwright/results/reporte-playwright-es.md
```

## 10. Cómo se aplicaron principios SOLID de forma pragmática

## 10.1 Responsabilidad única

Cada archivo tiene una función específica:

- config
- builders
- assertions
- servicios
- specs
- soporte común

## 10.2 Abierto/cerrado

La solución permite agregar nuevas specs o nuevas operaciones de API sin reescribir las existentes.

## 10.3 Segregación de interfaces

No se creó una clase gigante que haga todo. Cada servicio expone solo las operaciones de su dominio.

## 10.4 Inversión de dependencias pragmática

Las specs no dependen directamente del detalle HTTP. Dependen de servicios de dominio y utilidades.

## 10.5 Diseño limpio sin sobreingeniería

Se evitó:

- crear demasiadas abstracciones innecesarias
- introducir patrones complejos sin valor real
- mezclar setup, datos y aserciones dentro de cada spec

## 11. Cómo ejecutar el sistema bajo prueba

Desde la raíz del proyecto:

```powershell
$env:MAVEN_USER_HOME = Join-Path (Get-Location) ".m2"
.\mvnw.cmd "-DskipTests" "-Dspring-boot.run.useTestClasspath=true" "-Dspring-boot.run.arguments=--server.port=8080 --server.servlet.context-path=/api --spring.datasource.url=jdbc:h2:mem:bookingya;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE --spring.datasource.driver-class-name=org.h2.Driver --spring.datasource.username=sa --spring.datasource.password= --spring.jpa.hibernate.ddl-auto=create-drop --spring.jpa.show-sql=false" spring-boot:run
```

Este comando:

- usa Maven Wrapper
- utiliza classpath de test
- levanta H2 en memoria
- expone la API en `http://localhost:8080/api`

## 12. Cómo ejecutar la suite

Desde la carpeta `playwright`:

```bash
npm install
npx playwright test
```

Para una prueba puntual:

```bash
npx playwright test tests/reservations/reservation-create.spec.ts
```

## 13. Qué debería saber alguien que explique este código

Debe entender:

- que Playwright aquí se usa para API testing, no para navegador
- que la suite valida aceptación, no pruebas unitarias
- que cada spec representa un criterio de aceptación
- que las precondiciones se crean por API
- que el cleanup se hace automáticamente
- que el reporte HTML es de Playwright
- que la suite está desacoplada en servicios, utilidades y escenarios

## 14. Qué debería contener el video explicativo

La docente pide un video donde ambos integrantes participen en voz, muestren ejecución desde terminal y expliquen la automatización. Para esta carpeta, lo recomendable es estructurarlo así:

### 14.1 Introducción breve

Cada integrante debe presentarse y explicar que esta parte corresponde a la fase ATDD con Playwright + TypeScript sobre el módulo de reservas.

### 14.2 Explicación del alcance

Se debe decir claramente:

- qué funcionalidades se cubrieron
- que el sistema probado es el backend real
- que las pruebas se diseñaron a partir del comportamiento observable del backend

### 14.3 Mostrar la estructura de la carpeta

Desde el explorador o terminal, mostrar:

- `services`
- `utils`
- `tests/reservations`
- `results`
- `README.md`

Explicar brevemente qué hace cada carpeta.

### 14.4 Mostrar cómo se levanta el sistema

Desde la terminal:

1. ubicarse en la raíz del proyecto
2. ejecutar el comando de arranque del backend
3. explicar que se usó la preparación técnica mínima necesaria para usar el sistema como SUT

### 14.5 Mostrar la ejecución de Playwright

Desde la terminal:

1. entrar a `playwright`
2. ejecutar `npx playwright test`
3. dejar visible la salida de consola

Aquí conviene explicar:

- qué escenarios corren
- qué valida cada uno
- por qué son escenarios de aceptación

### 14.6 Mostrar el reporte HTML de Playwright

Después de la ejecución:

1. abrir `playwright/playwright-report/index.html`
2. mostrar que allí aparecen los escenarios ejecutados y sus resultados

### 14.7 Mostrar el reporte funcional en español

También conviene abrir:

```text
playwright/results/reporte-playwright-es.md
```

y explicar:

- objetivo
- entorno
- resultados
- hallazgos

## 15. Cómo manejar el texto de la docente sobre TDD y BDD Serenity

La instrucción de la docente que mencionas mezcla varios entregables o varias fases:

- explicación de TDD
- evidencia de HTML generado por BDD Serenity
- ejecución del script de Playwright TypeScript

Sin embargo, esta carpeta corresponde únicamente a ATDD con Playwright. Por tanto, desde la honestidad técnica, en el video no se debe atribuir a esta carpeta algo que no contiene.

La forma profesional de manejarlo es:

1. explicar que esta carpeta corresponde a la fase ATDD
2. mostrar la automatización Playwright que sí fue desarrollada aquí
3. mostrar el reporte HTML generado por Playwright
4. si el curso efectivamente exige TDD o BDD Serenity en otros entregables, aclarar que esos artefactos pertenecen a otras fases o carpetas, no a `playwright`

No es correcto afirmar que Playwright aquí implementa TDD ni que genera reportes HTML de Serenity, porque eso no sería verdad.

## 16. Guion sugerido para el video

### Participante 1

- Explica brevemente el objetivo de la fase ATDD.
- Presenta la estructura de la carpeta `playwright`.
- Explica la separación entre `services`, `utils` y `tests`.

### Participante 2

- Explica los escenarios cubiertos.
- Muestra cómo se levanta el backend.
- Ejecuta `npx playwright test`.

### Participante 1

- Explica uno o dos archivos clave, por ejemplo `reservation-api.ts` y `test-data-builder.ts`.
- Explica cómo se generan datos únicos y por qué eso hace la suite estable.

### Participante 2

- Abre el reporte HTML de Playwright.
- Muestra el `reporte-playwright-es.md`.
- Cierra con resultados y hallazgos.

## 17. Puntos importantes que no deberían omitirse en la explicación oral

- Por qué se eligió API testing con Playwright.
- Cuáles son las rutas reales de reservas.
- Cómo se crean huéspedes y habitaciones como precondiciones.
- Cómo se evita la dependencia de datos manuales.
- Cómo se limpia la información creada por la prueba.
- Cómo se aplicó diseño limpio.
- Qué resultados obtuvieron al ejecutar la suite.

## 18. Conclusión

La carpeta `playwright` fue diseñada para resolver la fase ATDD de manera clara, estable y profesional. Su estructura separa configuración, construcción de datos, acceso a la API, validaciones y escenarios. Esto facilita explicar la solución, ejecutarla desde terminal, mostrar resultados y justificar técnicamente las decisiones tomadas.
