package com.project.bookingya;

import java.time.LocalDateTime;
import java.lang.reflect.Type;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;


import com.project.bookingya.dtos.ReservationDto;
import com.project.bookingya.entities.GuestEntity;
import com.project.bookingya.entities.ReservationEntity;
import com.project.bookingya.entities.RoomEntity;
import com.project.bookingya.models.Reservation;
import com.project.bookingya.repositories.IGuestRepository;
import com.project.bookingya.repositories.IReservationRepository;
import com.project.bookingya.repositories.IRoomRepository;
import com.project.bookingya.services.ReservationService;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


//@ExtendWith(MockitoExtension.class) habilita Mockito en JUnit 5 
// para inicializar mocks e inyectar dependencias automáticamente.
@ExtendWith(MockitoExtension.class)

class ReservationServiceTDDTest {

// Mock del repositorio de reservas (simula acceso a base de datos).
// Permite definir respuestas (when) y verificar llamadas (verify).
    @Mock
    private IReservationRepository reservationRepository;

// Mock del repositorio de habitaciones (simula validaciones de existencia y disponibilidad).
    @Mock
    private IRoomRepository roomRepository;

// Mock del repositorio de huéspedes (simula validación de existencia).
    @Mock
    private IGuestRepository guestRepository;

// Mock para simular la transformación de objetos entre capas.
    @Mock
    private ModelMapper mapper;

// Inyecta los mocks en el servicio real para probar su lógica de forma aislada.
    @InjectMocks
    private ReservationService service;




@Test
@Order(1) // Define el orden de ejecución. 
void CrearReservaCorrectamente() {
    
    // Datos únicos para evitar interferencia entre ejecuciones de pruebas
    UUID roomId = UUID.randomUUID();
    UUID guestId = UUID.randomUUID();

    // Construcción del DTO de entrada con datos válidos para el flujo exitoso
    ReservationDto dtoReservation = new ReservationDto();
    dtoReservation.setRoomId(roomId);
    dtoReservation.setGuestId(guestId);
    dtoReservation.setCheckIn(LocalDateTime.now().plusDays(1));
    dtoReservation.setCheckOut(LocalDateTime.now().plusDays(2));
    dtoReservation.setGuestsCount(2);
    dtoReservation.setNotes("Reserva de prueba");

    // Simulación de entidades existentes en el sistema
    RoomEntity room = new RoomEntity();
    room.setId(roomId);
    room.setAvailable(true);
    room.setMaxGuests(4);

    GuestEntity guest = new GuestEntity();
    guest.setId(guestId);

    // Entidad que será persistida y objeto esperado como resultado del servicio
    ReservationEntity entity = new ReservationEntity();

    Reservation expected = new Reservation();
    expected.setRoomId(roomId);
    expected.setGuestId(guestId);
    expected.setCheckIn(dtoReservation.getCheckIn());
    expected.setCheckOut(dtoReservation.getCheckOut());
    expected.setGuestsCount(2);
    expected.setNotes("Reserva de prueba");

    // Configuración de mocks para simular comportamiento de dependencias
    when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));
    when(guestRepository.findById(guestId)).thenReturn(Optional.of(guest));

    when(reservationRepository.existsOverlappingReservationForRoom(
            eq(roomId), any(), any(), isNull()))
        .thenReturn(false);

    when(reservationRepository.existsOverlappingReservationForGuest(
            eq(guestId), any(), any(), isNull()))
        .thenReturn(false);

    when(mapper.map(dtoReservation, ReservationEntity.class)).thenReturn(entity);
    when(reservationRepository.saveAndFlush(entity)).thenReturn(entity);
    when(mapper.map(entity, Reservation.class)).thenReturn(expected);

    // Ejecución del método bajo prueba
    Reservation result = service.create(dtoReservation);

    // Validación del resultado esperado
    assertNotNull(result);
    assertEquals(roomId, result.getRoomId());
    assertEquals(guestId, result.getGuestId());
    assertEquals(dtoReservation.getCheckIn(), result.getCheckIn());
    assertEquals(dtoReservation.getCheckOut(), result.getCheckOut());
    assertEquals(2, result.getGuestsCount());
    assertEquals("Reserva de prueba", result.getNotes());
}


@Test
@Order(2) // Define el orden de ejecución. 
void ConsultarReservaCorrectamente() {

    // Preparación del escenario con datos independientes y únicos
    UUID roomId = UUID.randomUUID();
    UUID guestId = UUID.randomUUID();

    // Simulación de una reserva existente en base de datos (capa de persistencia)
    ReservationEntity reservationEntity = new ReservationEntity();
    reservationEntity.setRoomId(roomId);
    reservationEntity.setGuestId(guestId);
    reservationEntity.setCheckIn(LocalDateTime.now().plusDays(1));
    reservationEntity.setCheckOut(LocalDateTime.now().plusDays(2));
    reservationEntity.setGuestsCount(2);
    reservationEntity.setNotes("Consulta de prueba");

    // Modelo esperado que debe retornar el servicio tras mapear la entidad
    Reservation expectedReservation = new Reservation();
    expectedReservation.setRoomId(roomId);
    expectedReservation.setGuestId(guestId);
    expectedReservation.setCheckIn(reservationEntity.getCheckIn());
    expectedReservation.setCheckOut(reservationEntity.getCheckOut());
    expectedReservation.setGuestsCount(2);
    expectedReservation.setNotes("Consulta de prueba");

    // Simulación del resultado del repositorio (lista de entidades)
    List<ReservationEntity> entities = List.of(reservationEntity);

    // Resultado esperado luego de la transformación a modelo de dominio
    List<Reservation> expected = List.of(expectedReservation);

    // Configuración de mocks:
    // - El repositorio retorna datos simulados
    // - El mapper transforma entidades a modelos sin ejecutar lógica real
    when(reservationRepository.findAll()).thenReturn(entities);
    when(mapper.map(eq(entities), any(Type.class))).thenReturn(expected);

    // Ejecución del método que consulta todas las reservas, método objeto de prueba 
    List<Reservation> result = service.getAll();

    // Validación del comportamiento del servicio
    // Verifica que la respuesta exista y contenga datos
    assertNotNull(result);
    assertEquals(1, result.size());

    // Verifica que los datos retornados coincidan con la entidad simulada
    assertEquals(roomId, result.get(0).getRoomId());
    assertEquals(guestId, result.get(0).getGuestId());
    assertEquals(reservationEntity.getCheckIn(), result.get(0).getCheckIn());
    assertEquals(reservationEntity.getCheckOut(), result.get(0).getCheckOut());
    assertEquals(2, result.get(0).getGuestsCount());
    assertEquals("Consulta de prueba", result.get(0).getNotes());
}

@Test
@Order(3)
void ActualizarReservaCorrectamente() 
{
    // Identificadores únicos para aislar la prueba
    UUID reservationId = UUID.randomUUID();
    UUID roomId = UUID.randomUUID();
    UUID guestId = UUID.randomUUID();

    // DTO con los nuevos datos que se desean actualizar
    ReservationDto dtoReservation = new ReservationDto();
    dtoReservation.setRoomId(roomId);
    dtoReservation.setGuestId(guestId);
    dtoReservation.setCheckIn(LocalDateTime.now().plusDays(3));
    dtoReservation.setCheckOut(LocalDateTime.now().plusDays(5));
    dtoReservation.setGuestsCount(2);
    dtoReservation.setNotes("Reserva actualizada");

    // Entidad existente en base de datos (estado previo)
    ReservationEntity existing = new ReservationEntity();
    existing.setId(reservationId);

    // Simulación de dependencias necesarias para validaciones del servicio
    RoomEntity room = new RoomEntity();
    room.setId(roomId);
    room.setAvailable(true);
    room.setMaxGuests(4);

    GuestEntity guest = new GuestEntity();
    guest.setId(guestId);

    // Entidad resultante después de la actualización en persistencia
    ReservationEntity updatedEntity = new ReservationEntity();
    updatedEntity.setId(reservationId);
    updatedEntity.setRoomId(roomId);
    updatedEntity.setGuestId(guestId);
    updatedEntity.setCheckIn(dtoReservation.getCheckIn());
    updatedEntity.setCheckOut(dtoReservation.getCheckOut());
    updatedEntity.setGuestsCount(2);
    updatedEntity.setNotes("Reserva actualizada");

    // Modelo esperado que debe retornar el servicio tras la actualización
    Reservation expected = new Reservation();
    expected.setRoomId(roomId);
    expected.setGuestId(guestId);
    expected.setCheckIn(dtoReservation.getCheckIn());
    expected.setCheckOut(dtoReservation.getCheckOut());
    expected.setGuestsCount(2);
    expected.setNotes("Reserva actualizada");

    // Configuración de mocks:
    // - Se simula que la reserva existe
    // - Se validan dependencias necesarias (room y guest)
    when(reservationRepository.findById(reservationId)).thenReturn(Optional.of(existing));
    when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));
    when(guestRepository.findById(guestId)).thenReturn(Optional.of(guest));

    // Simulación de validaciones de solapamiento excluyendo la misma reserva (update)
    when(reservationRepository.existsOverlappingReservationForRoom(eq(roomId), any(), any(), eq(reservationId)))
        .thenReturn(false);
    when(reservationRepository.existsOverlappingReservationForGuest(eq(guestId), any(), any(), eq(reservationId)))
        .thenReturn(false);

    // Simula el comportamiento del mapper al copiar datos del DTO hacia la entidad existente
    doAnswer(invocation -> {
        ReservationDto source = invocation.getArgument(0);
        ReservationEntity destination = invocation.getArgument(1);

        destination.setRoomId(source.getRoomId());
        destination.setGuestId(source.getGuestId());
        destination.setCheckIn(source.getCheckIn());
        destination.setCheckOut(source.getCheckOut());
        destination.setGuestsCount(source.getGuestsCount());
        destination.setNotes(source.getNotes());

        return null;
    }).when(mapper).map(eq(dtoReservation), eq(existing));

    // Simula la persistencia de la entidad actualizada
    when(reservationRepository.saveAndFlush(existing)).thenReturn(updatedEntity);

    // Simula la transformación final a modelo de salida
    when(mapper.map(updatedEntity, Reservation.class)).thenReturn(expected);

    // Ejecución del método de actualización, método objeto de prueba 
    Reservation result = service.update(dtoReservation, reservationId);

    // Validación de que los datos fueron actualizados correctamente
    assertNotNull(result);
    assertEquals(roomId, result.getRoomId());
    assertEquals(guestId, result.getGuestId());
    assertEquals(dtoReservation.getCheckIn(), result.getCheckIn());
    assertEquals(dtoReservation.getCheckOut(), result.getCheckOut());
    assertEquals(2, result.getGuestsCount());
    assertEquals("Reserva actualizada", result.getNotes());

    verify(mapper).map(dtoReservation, existing);
    verify(reservationRepository).saveAndFlush(existing);
}

@Test
@Order(4)
void EliminarReservaCorrectamente() {

    // Identificador único de la reserva a eliminar
    UUID reservationId = UUID.randomUUID();

    // Simulación de una reserva existente en base de datos
    ReservationEntity existing = new ReservationEntity();
    existing.setId(reservationId);

    // Mock: el repositorio encuentra la reserva (condición necesaria para eliminar)
    when(reservationRepository.findById(reservationId)).thenReturn(Optional.of(existing));

    // Ejecución del método de eliminación, método objeto de prueba 
    service.delete(reservationId);

    // Validaciones (verificación de comportamiento):
    // - Se consulta la existencia de la reserva
    verify(reservationRepository).findById(reservationId);

    // - Se ejecuta la eliminación sobre la entidad encontrada
    verify(reservationRepository).delete(existing);

    // - Se confirma la persistencia del cambio en base de datos
    verify(reservationRepository).flush();
}


@Test
@Order(5)
void ObtenerporIDReservaCorrectamente() {

    // Identificadores únicos para aislar la prueba
    UUID reservationId = UUID.randomUUID();
    UUID roomId = UUID.randomUUID();
    UUID guestId = UUID.randomUUID();

    // Entidad que simula la reserva existente en base de datos
    ReservationEntity entity = new ReservationEntity();
    entity.setId(reservationId);
    entity.setRoomId(roomId);
    entity.setGuestId(guestId);
    entity.setCheckIn(LocalDateTime.now().plusDays(1));
    entity.setCheckOut(LocalDateTime.now().plusDays(2));
    entity.setGuestsCount(2);
    entity.setNotes("Reserva por id");

    // Modelo esperado que debe retornar el servicio tras mapear la entidad
    Reservation expected = new Reservation();
    expected.setRoomId(roomId);
    expected.setGuestId(guestId);
    expected.setCheckIn(entity.getCheckIn());
    expected.setCheckOut(entity.getCheckOut());
    expected.setGuestsCount(2);
    expected.setNotes("Reserva por id");

    // Configuración de mocks:
    // - El repositorio retorna la entidad existente
    // - El mapper transforma la entidad al modelo de salida
    when(reservationRepository.findById(reservationId)).thenReturn(Optional.of(entity));
    when(mapper.map(entity, Reservation.class)).thenReturn(expected);

    // Ejecución del método que consulta la reserva por ID, método objeto de prueba
    Reservation result = service.getById(reservationId);

    // Validación de que la información retornada corresponde a la entidad simulada
    assertNotNull(result);
    assertEquals(roomId, result.getRoomId());
    assertEquals(guestId, result.getGuestId());
    assertEquals(entity.getCheckIn(), result.getCheckIn());
    assertEquals(entity.getCheckOut(), result.getCheckOut());
    assertEquals(2, result.getGuestsCount());
    assertEquals("Reserva por id", result.getNotes());

    // Verificación de interacciones clave:
    // - Se consulta la reserva en el repositorio
    // - Se realiza la transformación a modelo de dominio
    verify(reservationRepository).findById(reservationId);
    verify(mapper).map(entity, Reservation.class);

}

@Test
@Order(6)
void ConsultarReservasPorUsuarioCorrectamente() {
    UUID guestId = UUID.randomUUID();
    UUID roomId = UUID.randomUUID();

    ReservationEntity reservationEntity = new ReservationEntity();
    reservationEntity.setId(UUID.randomUUID());
    reservationEntity.setGuestId(guestId);
    reservationEntity.setRoomId(roomId);
    reservationEntity.setCheckIn(LocalDateTime.now().plusDays(1));
    reservationEntity.setCheckOut(LocalDateTime.now().plusDays(2));
    reservationEntity.setGuestsCount(2);
    reservationEntity.setNotes("Reserva por usuario");

    List<ReservationEntity> entities = List.of(reservationEntity);

    Reservation expectedReservation = new Reservation();
    expectedReservation.setId(reservationEntity.getId());
    expectedReservation.setGuestId(guestId);
    expectedReservation.setRoomId(roomId);
    expectedReservation.setCheckIn(reservationEntity.getCheckIn());
    expectedReservation.setCheckOut(reservationEntity.getCheckOut());
    expectedReservation.setGuestsCount(2);
    expectedReservation.setNotes("Reserva por usuario");

    List<Reservation> expected = List.of(expectedReservation);

    when(reservationRepository.findByGuestId(guestId)).thenReturn(entities);
    when(mapper.map(eq(entities), any(Type.class))).thenReturn(expected);

    List<Reservation> result = service.getByGuestId(guestId);

    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(guestId, result.get(0).getGuestId());
    assertEquals(roomId, result.get(0).getRoomId());
    assertEquals("Reserva por usuario", result.get(0).getNotes());
    verify(reservationRepository).findByGuestId(guestId);
}
}


