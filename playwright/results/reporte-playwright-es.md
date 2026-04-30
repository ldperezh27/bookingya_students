# Reporte ATDD con Playwright - BookingYa

## 1. Fecha y hora de ejecución

- `2026-04-17 11:38:13 -05:00`

## 2. Objetivo de la automatización ATDD

Validar por API el comportamiento observable del módulo de reservas de BookingYa según la fase ATDD del ejercicio académico, cubriendo creación, consulta, actualización, eliminación y consulta por huésped con Playwright + TypeScript.

## 3. Entorno probado

- Sistema bajo prueba: backend Spring Boot de BookingYa.
- Estrategia ATDD: API testing con Playwright.
- Runtime Java detectado: OpenJDK 25.
- Base de datos usada para la ejecución: H2 en memoria, levantada solo para el arranque técnico local del SUT.
- URL base usada por la suite: `http://localhost:8080/api`

## 4. Cómo se puso a correr el sistema

Se usó el camino mínimo que permitió arrancar el backend sin alterar la lógica de negocio:

1. Se habilitó el procesamiento de anotaciones de Lombok en `pom.xml` para resolver el bloqueo real de compilación.
2. Se ejecutó el backend con Maven Wrapper, classpath de test y H2 en memoria.
3. Se verificó disponibilidad del endpoint `GET /api/reservation` con respuesta HTTP `200`.

Comando utilizado:

```powershell
$env:MAVEN_USER_HOME = Join-Path (Get-Location) ".m2"
.\mvnw.cmd "-DskipTests" "-Dspring-boot.run.useTestClasspath=true" "-Dspring-boot.run.arguments=--server.port=8080 --server.servlet.context-path=/api --spring.datasource.url=jdbc:h2:mem:bookingya;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE --spring.datasource.driver-class-name=org.h2.Driver --spring.datasource.username=sa --spring.datasource.password= --spring.jpa.hibernate.ddl-auto=create-drop --spring.jpa.show-sql=false" spring-boot:run
```

## 5. Escenarios ejecutados

- Crear una reserva correctamente.
- Consultar una reserva por ID.
- Consultar todas las reservas.
- Consultar reservas por huésped.
- Actualizar una reserva existente.
- Eliminar una reserva existente.
- Consultar una reserva inexistente.

## 6. Resultado por escenario

| Escenario | Resultado |
|---|---|
| Crear una reserva correctamente | Pasó |
| Consultar una reserva por ID | Pasó |
| Consultar todas las reservas | Pasó |
| Consultar reservas por huésped | Pasó |
| Actualizar una reserva existente | Pasó |
| Eliminar una reserva existente | Pasó |
| Consultar una reserva inexistente | Pasó |

Resumen de ejecución:

- `7` escenarios ejecutados.
- `7` escenarios aprobados.
- `0` escenarios fallidos.
- Tiempo total observado por Playwright: `6.6s`.

## 7. Hallazgos relevantes

- El backend implementa la consulta por usuario mediante la ruta real `GET /api/reservation/guest/{guestId}`.
- La creación y eliminación de reservas responden con HTTP `200`, no con `201` o `204`.
- El contrato de reserva observado fue estable para los campos `id`, `guestId`, `roomId`, `checkIn`, `checkOut`, `guestsCount` y `notes`.
- La suite evita depender de conteos absolutos y valida inclusión por identificador para no introducir fragilidad.

## 8. Defectos observados del sistema

No se detectaron defectos funcionales en los escenarios ATDD cubiertos del módulo de reservas.

Bloqueos técnicos de arranque detectados y tratados solo para habilitar la prueba:

- El proyecto no compilaba en este entorno porque Lombok no estaba siendo procesado por Maven.
- La configuración principal del backend está ubicada en `src/main/java/resources/application.properties`, que no es la ruta estándar de Spring Boot para recursos.
- No había PostgreSQL local ni Docker operativo en este entorno, por lo que se usó H2 en memoria como soporte técnico mínimo del SUT.

## 9. Conclusión breve

La suite ATDD quedó operativa, documentada y ejecutable. En el alcance cubierto, el comportamiento observable del módulo de reservas fue consistente con los criterios de aceptación definidos a partir del backend real.

## 10. Cómo ejecutar nuevamente la suite

1. Levantar el backend con el comando documentado en la sección 4.
2. Ir a `playwright/`.
3. Instalar dependencias si aún no existen con `npm install`.
4. Ejecutar `npx playwright test`.
5. Revisar este reporte y el HTML generado en `playwright/playwright-report/index.html`.
