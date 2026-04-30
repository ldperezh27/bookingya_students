# Playwright ATDD de BookingYa

Esta carpeta contiene la suite de pruebas de aceptación automatizadas del módulo de reservas de BookingYa. La estrategia se implementó como API testing con Playwright + TypeScript porque el sistema disponible en el repositorio es un backend REST y ese enfoque ofrece la validación más estable para la fase ATDD.

## Qué contiene esta carpeta

- `tests/reservations`: escenarios ATDD principales del módulo de reservas.
- `services`: clientes por dominio para consumir la API real.
- `utils`: carga de variables, builders de datos y aserciones reutilizables.
- `data`: valores base para datos de prueba.
- `results/reporte-playwright-es.md`: reporte consolidado de ejecución y hallazgos.

## Propósito de los archivos principales

- `playwright.config.ts`: centraliza la configuración de ejecución de Playwright, los timeouts y los reporters.
- `services/api-client.ts`: abstrae el acceso HTTP base para evitar duplicación en las fachadas de dominio.
- `services/guest-api.ts`: encapsula las operaciones mínimas de huéspedes usadas como precondiciones.
- `services/room-api.ts`: encapsula las operaciones mínimas de habitaciones usadas como precondiciones.
- `services/reservation-api.ts`: encapsula las rutas reales del módulo de reservas.
- `utils/env.ts`: carga y valida variables de entorno de la suite.
- `utils/test-data-builder.ts`: construye payloads válidos y únicos para escenarios repetibles.
- `utils/assertions.ts`: concentra aserciones reutilizables del contrato observable de la API.
- `utils/ids.ts`: genera identificadores auxiliares para datos únicos y escenarios negativos.
- `tests/reservations/reservation-test-support.ts`: prepara y limpia precondiciones para mantener specs enfocadas en aceptación.
- `tests/reservations/*.spec.ts`: automatiza los criterios de aceptación del módulo de reservas.
- `data/reservation-data.ts`: define valores base para builders de datos.
- `results/reporte-playwright-es.md`: documenta la ejecución, resultados y hallazgos.

## Prerrequisitos

- Node.js 20+ con `npm`.
- Java disponible para levantar el backend.
- El backend de BookingYa ejecutándose en `http://localhost:8080/api` o en la URL que se configure en `.env`.

## Cómo instalar dependencias

Desde la carpeta `playwright`:

```bash
npm install
```

## Cómo configurar variables

1. Copia `.env.example` como `.env`.
2. Ajusta `BASE_URL` si el backend no corre en `http://localhost:8080/api`.

Variables disponibles:

- `BASE_URL`: URL base del backend.
- `API_TIMEOUT_MS`: timeout por llamada HTTP.
- `TEST_TIMEOUT_MS`: timeout por prueba.

## Cómo correr el sistema bajo prueba

La forma mínima validada para este entorno fue ejecutar el backend con H2 en memoria y classpath de test, evitando depender de Docker o PostgreSQL local. Desde la raíz del proyecto:

```powershell
$env:MAVEN_USER_HOME = Join-Path (Get-Location) ".m2"
.\mvnw.cmd "-DskipTests" "-Dspring-boot.run.useTestClasspath=true" "-Dspring-boot.run.arguments=--server.port=8080 --server.servlet.context-path=/api --spring.datasource.url=jdbc:h2:mem:bookingya;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE --spring.datasource.driver-class-name=org.h2.Driver --spring.datasource.username=sa --spring.datasource.password= --spring.jpa.hibernate.ddl-auto=create-drop --spring.jpa.show-sql=false" spring-boot:run
```

## Cómo correr toda la suite

Desde `playwright`:

```bash
npx playwright test
```

## Cómo correr una prueba específica

Por archivo:

```bash
npx playwright test tests/reservations/reservation-create.spec.ts
```

Por nombre:

```bash
npx playwright test --grep "Crear una reserva correctamente"
```

## Dónde queda el reporte

- Reporte funcional en español: `playwright/results/reporte-playwright-es.md`
- Reporte HTML de Playwright: `playwright/playwright-report/index.html`

## Qué funcionalidades valida la suite

- Crear una reserva correctamente.
- Consultar una reserva por ID.
- Consultar todas las reservas.
- Consultar reservas por huésped.
- Actualizar una reserva existente.
- Eliminar una reserva existente.
- Consultar una reserva inexistente.

## Criterios de diseño aplicados

- Responsabilidad única: cada archivo tiene un rol acotado y explícito.
- Separación por capas: configuración, acceso API, datos de prueba, aserciones y escenarios están desacoplados.
- Reutilización controlada: las precondiciones y validaciones comunes viven fuera de las specs.
- Legibilidad: los nombres y comentarios priorizan intención de negocio y comportamiento observable.
