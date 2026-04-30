# language: es
Característica: Gestion de reservas
  Como consumidor de la API
  Quiero gestionar reservas
  Para administrar el ciclo de vida de una reserva

  Escenario: Creacion de una reserva
    Dado existe una habitacion disponible y un huesped valido
    Cuando creo una reserva con datos validos
    Entonces la reserva es creada exitosamente

  Escenario: Actualizacion de una reserva existente
    Dado existe una reserva previamente creada
    Cuando actualizo la reserva existente con datos validos
    Entonces la reserva es actualizada exitosamente

  Escenario: Eliminacion de una reserva
    Dado existe una reserva previamente creada
    Cuando elimino la reserva existente
    Entonces la reserva es eliminada exitosamente

  Escenario: Consulta de todas las reservas
    Dado existen varias reservas creadas
    Cuando consulto todas las reservas
    Entonces el sistema retorna la lista de reservas

  Escenario: Obtencion de una reserva por ID
    Dado existe una reserva previamente creada
    Cuando consulto la reserva por su id
    Entonces el sistema retorna la reserva correspondiente

  Escenario: Consulta de reservas por usuario
    Dado existe una reserva previamente creada
    Cuando consulto las reservas por usuario
    Entonces el sistema retorna las reservas del usuario
