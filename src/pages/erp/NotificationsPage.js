import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCheck,
  faHome
} from "@fortawesome/free-solid-svg-icons";
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  ListGroup
} from "@themesberg/react-bootstrap";

import {
  listarMisNotificaciones,
  marcarNotificacionLeida
} from "../../services/notificacionApi";

const colorTipo = {
  TAREA_ASIGNADA: "primary",
  TAREA_ACTUALIZADA: "info",
  TAREA_VENCIDA: "danger",
  FACTURA_VENCIDA: "danger",
  CONTRATO_POR_VENCER: "warning",
  GENERAL: "secondary"
};

export default function NotificationsPage() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarNotificaciones = async () => {
    try {
      setCargando(true);
      setError("");

      const datos = await listarMisNotificaciones();
      setNotificaciones(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const marcarLeida = async (notificacion) => {
    try {
      await marcarNotificacionLeida(notificacion.id);

      setNotificaciones((anteriores) =>
        anteriores.map((item) =>
          item.id === notificacion.id
            ? { ...item, leida: true }
            : item
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div>
          <Breadcrumb className="d-none d-md-inline-block">
            <Breadcrumb.Item href="#/dashboard/overview">
              <FontAwesomeIcon icon={faHome} />
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Notifications</Breadcrumb.Item>
          </Breadcrumb>

          <h2 className="h4">Notifications</h2>
          <p className="mb-0">
            Updates related to your assigned work and ERP activity.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <Card border="light" className="shadow-sm">
        <Card.Header>
          <FontAwesomeIcon icon={faBell} className="me-2" />
          <strong>My notifications</strong>
        </Card.Header>

        <ListGroup variant="flush">
          {cargando ? (
            <ListGroup.Item className="text-center py-4">
              Loading notifications...
            </ListGroup.Item>
          ) : notificaciones.length === 0 ? (
            <ListGroup.Item className="text-center py-4">
              You have no notifications.
            </ListGroup.Item>
          ) : (
            notificaciones.map((notificacion) => (
              <ListGroup.Item
                key={notificacion.id}
                className={`py-3 ${!notificacion.leida ? "bg-soft" : ""}`}
              >
                <div className="d-flex justify-content-between gap-3">
                  <div>
                    <div className="d-flex align-items-center mb-1">
                      <strong className="me-2">
                        {notificacion.titulo}
                      </strong>

                      <Badge
                        bg={colorTipo[notificacion.tipo] || "secondary"}
                      >
                        {notificacion.tipo}
                      </Badge>
                    </div>

                    <p className="mb-1">{notificacion.mensaje}</p>

                    <small className="text-gray">
                      {notificacion.fecha?.replace("T", " ") || ""}
                    </small>
                  </div>

                  {!notificacion.leida && (
                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={() => marcarLeida(notificacion)}
                    >
                      <FontAwesomeIcon icon={faCheck} className="me-1" />
                      Read
                    </Button>
                  )}
                </div>
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      </Card>
    </>
  );
}