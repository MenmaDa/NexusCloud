import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCheckSquare,
  faCog,
  faEnvelopeOpen,
  faSearch,
  faSignOutAlt,
  faUserShield
} from "@fortawesome/free-solid-svg-icons";
import { faUserCircle } from "@fortawesome/free-regular-svg-icons";
import {
  Row,
  Col,
  Nav,
  Form,
  Image,
  Navbar,
  Dropdown,
  Container,
  ListGroup,
  InputGroup
} from "@themesberg/react-bootstrap";

import { Routes } from "../routes";
import {
  contarNoLeidas,
  listarMisNotificaciones
} from "../services/notificacionApi";
import {
  cerrarSesion,
  obtenerFotoPerfil,
  obtenerNombreUsuario
} from "../services/authApi";

import Profile3 from "../assets/img/team/profile-picture-3.jpg";


export default (props) => {
  const [notifications, setNotifications] = useState([]);
  const [cantidadNoLeidas, setCantidadNoLeidas] = useState(0);

  const cargarNotificaciones = async () => {
    try {
      const [datosNotificaciones, resultadoCantidad] = await Promise.all([
        listarMisNotificaciones(),
        contarNoLeidas()
      ]);

      setNotifications(datosNotificaciones);
      setCantidadNoLeidas(resultadoCantidad.cantidad || 0);
    } catch {
      setNotifications([]);
      setCantidadNoLeidas(0);
    }
  };

  useEffect(() => {
    cargarNotificaciones();

    const intervalo = setInterval(cargarNotificaciones, 30000);

    return () => clearInterval(intervalo);
  }, []);

  const areNotificationsRead = cantidadNoLeidas === 0;

  const nombreUsuario = obtenerNombreUsuario();
  const fotoPerfil = obtenerFotoPerfil();

  const inicial = nombreUsuario.charAt(0).toUpperCase();

  const manejarCerrarSesion = () => {
    cerrarSesion();
    window.location.hash = "#/examples/sign-in";
  };


  const Notification = (notificacion) => {
    const fecha = notificacion.fecha
      ? notificacion.fecha.replace("T", " ")
      : "";

    return (
      <ListGroup.Item
        as={Link}
        to={Routes.Notificaciones.path}
        action
        className={`border-bottom border-light ${!notificacion.leida ? "bg-soft" : ""
          }`}
      >
        <Row className="align-items-center">
          <Col className="col-auto">
            <Image
              src={fotoPerfil || Profile3}
              className="user-avatar md-avatar rounded-circle"
            />
          </Col>

          <Col className="ps-0 ms--2">
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="h6 mb-0 text-small">
                {notificacion.titulo}
              </h4>

              <small className={!notificacion.leida ? "text-danger" : ""}>
                {fecha}
              </small>
            </div>

            <p className="font-small mt-1 mb-0">
              {notificacion.mensaje}
            </p>
          </Col>
        </Row>
      </ListGroup.Item>
    );
  };

  return (
    <Navbar variant="dark" expanded className="ps-0 pe-2 pb-0">
      <Container fluid className="px-0">
        <div className="d-flex justify-content-between w-100">
          <div className="d-flex align-items-center">
            <Form className="navbar-search">
              <Form.Group id="topbarSearch">
                <InputGroup className="input-group-merge search-bar">
                  <InputGroup.Text><FontAwesomeIcon icon={faSearch} /></InputGroup.Text>
                  <Form.Control type="text" placeholder="Search" />
                </InputGroup>
              </Form.Group>
            </Form>
          </div>
          <Nav className="align-items-center">
            <Dropdown
              as={Nav.Item}
              onToggle={(abierto) => {
                if (abierto) {
                  cargarNotificaciones();
                }
              }}
            >
              <Dropdown.Toggle as={Nav.Link} className="text-dark icon-notifications me-lg-3">
                <span className="icon icon-sm">
                  <div className="position-relative">
                    <FontAwesomeIcon icon={faBell} />

                    {cantidadNoLeidas > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: "0.6rem" }}
                      >
                        {cantidadNoLeidas > 9 ? "9+" : cantidadNoLeidas}
                      </span>
                    )}
                  </div>
                  {areNotificationsRead ? null : <span className="icon-badge rounded-circle unread-notifications" />}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu className="dashboard-dropdown notifications-dropdown dropdown-menu-lg dropdown-menu-center mt-2 py-0">
                <ListGroup className="list-group-flush">
                  <div className="text-center text-primary fw-bold border-bottom border-light py-3">
                    Notifications
                  </div>

                  {notifications.map(n => <Notification key={`notification-${n.id}`} {...n} />)}

                  <Dropdown.Item
                    as={Link}
                    to={Routes.Notificaciones.path}
                    className="text-center fw-bold"
                  >
                    View all notifications
                  </Dropdown.Item>
                </ListGroup>
              </Dropdown.Menu>
            </Dropdown>

            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle as={Nav.Link} className="pt-1 px-0">
                <div className="media d-flex align-items-center">
                  {fotoPerfil ? (
                    <Image
                      src={fotoPerfil}
                      className="user-avatar md-avatar rounded-circle"
                      alt={`Profile of ${nombreUsuario}`}
                    />
                  ) : (
                    <div
                      className="user-avatar md-avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                    >
                      {inicial}
                    </div>
                  )}
                  <div className="media-body ms-2 text-dark align-items-center d-none d-lg-block">
                    <span className="mb-0 font-small fw-bold">
                      {nombreUsuario}
                    </span>
                  </div>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu className="user-dropdown dropdown-menu-right mt-2">
                <Dropdown.Item className="fw-bold">
                  <FontAwesomeIcon icon={faUserCircle} className="me-2" /> My Profile
                </Dropdown.Item>
                <Dropdown.Item className="fw-bold">
                  <FontAwesomeIcon icon={faCog} className="me-2" /> Settings
                </Dropdown.Item>
                <Dropdown.Item className="fw-bold">
                  <FontAwesomeIcon icon={faEnvelopeOpen} className="me-2" /> Messages
                </Dropdown.Item>
                <Dropdown.Item className="fw-bold">
                  <FontAwesomeIcon icon={faUserShield} className="me-2" /> Support
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item as={Link} to={Routes.MisTareas.path}>
                  <FontAwesomeIcon icon={faCheckSquare} className="me-2" />
                  My Tasks
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item onClick={manejarCerrarSesion}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-danger me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </div>
      </Container>
    </Navbar>
  );
};
