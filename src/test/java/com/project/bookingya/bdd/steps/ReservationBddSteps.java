package com.project.bookingya.bdd.steps;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.project.bookingya.dtos.ReservationDto;
import com.project.bookingya.entities.GuestEntity;
import com.project.bookingya.entities.RoomEntity;
import com.project.bookingya.models.Reservation;
import com.project.bookingya.repositories.IGuestRepository;
import com.project.bookingya.repositories.IReservationRepository;
import com.project.bookingya.repositories.IRoomRepository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class ReservationBddSteps {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private IRoomRepository roomRepository;

    @Autowired
    private IGuestRepository guestRepository;

    @Autowired
    private IReservationRepository reservationRepository;

    @LocalServerPort
    private int port;

    private ReservationDto requestDto;
    private ResponseEntity<Reservation> response;
    private ResponseEntity<Void> deleteResponse;
    private ResponseEntity<Reservation[]> listResponse;
    private UUID existingReservationId;
    private Reservation existingReservation;
    private int expectedReservationsCount;

    @Given("existe una habitacion disponible y un huesped valido")
    public void existe_una_habitacion_disponible_y_un_huesped_valido() {
        reservationRepository.deleteAll();
        guestRepository.deleteAll();
        roomRepository.deleteAll();

        RoomEntity room = new RoomEntity();
        room.setCode("BDD-ROOM-001");
        room.setName("Habitacion BDD");
        room.setCity("Bogota");
        room.setMaxGuests(3);
        room.setNightlyPrice(new BigDecimal("250000.00"));
        room.setAvailable(true);
        RoomEntity savedRoom = roomRepository.saveAndFlush(room);

        GuestEntity guest = new GuestEntity();
        guest.setIdentification("BDD-CC-001");
        guest.setName("Huesped BDD");
        guest.setEmail("bdd.guest@example.com");
        GuestEntity savedGuest = guestRepository.saveAndFlush(guest);

        requestDto = new ReservationDto();
        requestDto.setRoomId(savedRoom.getId());
        requestDto.setGuestId(savedGuest.getId());
        requestDto.setCheckIn(LocalDateTime.now().plusDays(1));
        requestDto.setCheckOut(LocalDateTime.now().plusDays(2));
        requestDto.setGuestsCount(2);
        requestDto.setNotes("Reserva creada desde escenario BDD");
    }

    @Given("existe una reserva previamente creada")
    public void existe_una_reserva_previamente_creada() {
        existe_una_habitacion_disponible_y_un_huesped_valido();
        creo_una_reserva_con_datos_validos();
        la_reserva_es_creada_exitosamente();
        existingReservation = response.getBody();
        existingReservationId = existingReservation.getId();
    }

    @Given("existen varias reservas creadas")
    public void existen_varias_reservas_creadas() {
        existe_una_habitacion_disponible_y_un_huesped_valido();
        creo_una_reserva_con_datos_validos();
        la_reserva_es_creada_exitosamente();

        ReservationDto secondRequest = createValidReservationRequest("BDD-ROOM-002", "BDD-CC-002", "bdd.guest2@example.com");
        ResponseEntity<Reservation> secondResponse = restTemplate.exchange(
            "http://localhost:" + port + "/api/reservation",
            HttpMethod.POST,
            new HttpEntity<>(secondRequest),
            Reservation.class
        );
        assertEquals(HttpStatus.OK, secondResponse.getStatusCode());
        expectedReservationsCount = 2;
    }

    @When("creo una reserva con datos validos")
    public void creo_una_reserva_con_datos_validos() {
        response = restTemplate.exchange(
            "http://localhost:" + port + "/api/reservation",
            HttpMethod.POST,
            new HttpEntity<>(requestDto),
            Reservation.class
        );
    }

    @Then("la reserva es creada exitosamente")
    public void la_reserva_es_creada_exitosamente() {
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getId());
        assertEquals(requestDto.getRoomId(), response.getBody().getRoomId());
        assertEquals(requestDto.getGuestId(), response.getBody().getGuestId());
        assertEquals(requestDto.getGuestsCount(), response.getBody().getGuestsCount());
    }

    @When("actualizo la reserva existente con datos validos")
    public void actualizo_la_reserva_existente_con_datos_validos() {
        requestDto.setCheckIn(LocalDateTime.now().plusDays(3));
        requestDto.setCheckOut(LocalDateTime.now().plusDays(4));
        requestDto.setNotes("Reserva actualizada desde BDD");

        response = restTemplate.exchange(
            "http://localhost:" + port + "/api/reservation/" + existingReservationId,
            HttpMethod.PUT,
            new HttpEntity<>(requestDto),
            Reservation.class
        );
    }

    @Then("la reserva es actualizada exitosamente")
    public void la_reserva_es_actualizada_exitosamente() {
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(existingReservationId, response.getBody().getId());
        assertEquals("Reserva actualizada desde BDD", response.getBody().getNotes());
    }

    @When("elimino la reserva existente")
    public void elimino_la_reserva_existente() {
        deleteResponse = restTemplate.exchange(
            "http://localhost:" + port + "/api/reservation/" + existingReservationId,
            HttpMethod.DELETE,
            null,
            Void.class
        );
    }

    @Then("la reserva es eliminada exitosamente")
    public void la_reserva_es_eliminada_exitosamente() {
        assertNotNull(deleteResponse);
        assertEquals(HttpStatus.OK, deleteResponse.getStatusCode());
        assertFalse(reservationRepository.findById(existingReservationId).isPresent());
    }

    @When("consulto todas las reservas")
    public void consulto_todas_las_reservas() {
        listResponse = restTemplate.exchange(
            "http://localhost:" + port + "/api/reservation",
            HttpMethod.GET,
            null,
            Reservation[].class
        );
    }

    @Then("el sistema retorna la lista de reservas")
    public void el_sistema_retorna_la_lista_de_reservas() {
        assertNotNull(listResponse);
        assertEquals(HttpStatus.OK, listResponse.getStatusCode());
        assertNotNull(listResponse.getBody());
        assertTrue(listResponse.getBody().length >= expectedReservationsCount);
    }

    @When("consulto la reserva por su id")
    public void consulto_la_reserva_por_su_id() {
        response = restTemplate.exchange(
            "http://localhost:" + port + "/api/reservation/" + existingReservationId,
            HttpMethod.GET,
            null,
            Reservation.class
        );
    }

    @Then("el sistema retorna la reserva correspondiente")
    public void el_sistema_retorna_la_reserva_correspondiente() {
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(existingReservationId, response.getBody().getId());
    }

    @When("consulto las reservas por usuario")
    public void consulto_las_reservas_por_usuario() {
        listResponse = restTemplate.exchange(
            "http://localhost:" + port + "/api/reservation/guest/" + requestDto.getGuestId(),
            HttpMethod.GET,
            null,
            Reservation[].class
        );
    }

    @Then("el sistema retorna las reservas del usuario")
    public void el_sistema_retorna_las_reservas_del_usuario() {
        assertNotNull(listResponse);
        assertEquals(HttpStatus.OK, listResponse.getStatusCode());
        assertNotNull(listResponse.getBody());
        assertTrue(listResponse.getBody().length >= 1);
        assertEquals(requestDto.getGuestId(), listResponse.getBody()[0].getGuestId());
    }

    private ReservationDto createValidReservationRequest(String roomCode, String guestIdentification, String guestEmail) {
        RoomEntity room = new RoomEntity();
        room.setCode(roomCode);
        room.setName("Habitacion " + roomCode);
        room.setCity("Bogota");
        room.setMaxGuests(3);
        room.setNightlyPrice(new BigDecimal("200000.00"));
        room.setAvailable(true);
        RoomEntity savedRoom = roomRepository.saveAndFlush(room);

        GuestEntity guest = new GuestEntity();
        guest.setIdentification(guestIdentification);
        guest.setName("Huesped " + guestIdentification);
        guest.setEmail(guestEmail);
        GuestEntity savedGuest = guestRepository.saveAndFlush(guest);

        ReservationDto dto = new ReservationDto();
        dto.setRoomId(savedRoom.getId());
        dto.setGuestId(savedGuest.getId());
        dto.setCheckIn(LocalDateTime.now().plusDays(1));
        dto.setCheckOut(LocalDateTime.now().plusDays(2));
        dto.setGuestsCount(2);
        dto.setNotes("Reserva creada desde escenario BDD");
        return dto;
    }
}
