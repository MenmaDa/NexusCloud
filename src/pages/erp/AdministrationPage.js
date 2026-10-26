import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBell,
    faBuilding,
    faHistory,
    faHome,
    faShieldAlt,
    faUserShield,
    faUsers
} from "@fortawesome/free-solid-svg-icons";
import {
    Badge,
    Breadcrumb,
    Button,
    Card,
    Col,
    Row,
    Spinner,
    Table
} from "@themesberg/react-bootstrap";

import { Routes } from "../../routes";
import { obtenerDatosAdministracion } from "../../services/administracionApi";

const colorAccion = {
    CREAR: "success",
    ACTUALIZAR: "primary",
    ELIMINAR: "danger",
    INICIAR_SESION: "info"
};

const formatearFecha = (fecha) => {
    if (!fecha) return "-";

    return new Date(fecha).toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short"
    });
};

const Indicador = ({ titulo, valor, icono, color }) => (
    <Card border="light" className="shadow-sm h-100">
        <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <small className="text-gray">{titulo}</small>
                    <h3 className="mb-0">{valor}</h3>
                </div>

                <div
                    className={`icon icon-shape icon-md bg-${color} text-white rounded-circle`}
                >
                    <FontAwesomeIcon icon={icono} />
                </div>
            </div>
        </Card.Body>
    </Card>
);

export default function AdministrationPage() {
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const cargarDatos = async () => {
        try {
            setCargando(true);
            setError("");

            const respuesta = await obtenerDatosAdministracion();
            setDatos(respuesta);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    if (cargando) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="text-gray mt-3">
                    Loading administration information...
                </p>
            </div>
        );
    }

    const usuariosHabilitados = datos
        ? datos.usuarios.filter((usuario) => usuario.habilitado).length
        : 0;

    const empleadosActivos = datos
        ? datos.empleados.filter((empleado) => empleado.activo !== false).length
        : 0;

    const sedesActivas = datos
        ? datos.sedes.filter((sede) => sede.activo !== false).length
        : 0;

    return (
        <>
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                <div>
                    <Breadcrumb className="d-none d-md-inline-block">
                        <Breadcrumb.Item href="#/dashboard/overview">
                            <FontAwesomeIcon icon={faHome} />
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active>
                            Administration
                        </Breadcrumb.Item>
                    </Breadcrumb>

                    <h2 className="h4">Administration Center</h2>
                    <p className="mb-0">
                        Control access, users, organizational structure and audit history.
                    </p>
                </div>

                <Button
                    variant="outline-primary"
                    onClick={cargarDatos}
                >
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {datos && (
                <>
                    <Row>
                        <Col xs={12} sm={6} xl={3} className="mb-4">
                            <Indicador
                                titulo="Enabled users"
                                valor={usuariosHabilitados}
                                icono={faUsers}
                                color="primary"
                            />
                        </Col>

                        <Col xs={12} sm={6} xl={3} className="mb-4">
                            <Indicador
                                titulo="Configured roles"
                                valor={datos.roles.length}
                                icono={faShieldAlt}
                                color="info"
                            />
                        </Col>

                        <Col xs={12} sm={6} xl={3} className="mb-4">
                            <Indicador
                                titulo="Active employees"
                                valor={empleadosActivos}
                                icono={faUserShield}
                                color="success"
                            />
                        </Col>

                        <Col xs={12} sm={6} xl={3} className="mb-4">
                            <Indicador
                                titulo="Active branches"
                                valor={sedesActivas}
                                icono={faBuilding}
                                color="warning"
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={12} xl={4} className="mb-4">
                            <Card border="light" className="shadow-sm h-100">
                                <Card.Header>
                                    <strong>
                                        <FontAwesomeIcon
                                            icon={faUserShield}
                                            className="me-2"
                                        />
                                        Administration shortcuts
                                    </strong>
                                </Card.Header>

                                <Card.Body className="d-grid gap-2">
                                    <Button
                                        as={Link}
                                        to={Routes.Usuarios.path}
                                        variant="outline-primary"
                                    >
                                        <FontAwesomeIcon
                                            icon={faUsers}
                                            className="me-2"
                                        />
                                        Manage users
                                    </Button>

                                    <Button
                                        as={Link}
                                        to={Routes.Roles.path}
                                        variant="outline-primary"
                                    >
                                        <FontAwesomeIcon
                                            icon={faShieldAlt}
                                            className="me-2"
                                        />
                                        Manage roles
                                    </Button>

                                    <Button
                                        as={Link}
                                        to={Routes.Empleados.path}
                                        variant="outline-primary"
                                    >
                                        <FontAwesomeIcon
                                            icon={faUserShield}
                                            className="me-2"
                                        />
                                        Manage employees
                                    </Button>

                                    <Button
                                        as={Link}
                                        to={Routes.Sedes.path}
                                        variant="outline-primary"
                                    >
                                        <FontAwesomeIcon
                                            icon={faBuilding}
                                            className="me-2"
                                        />
                                        Manage branches
                                    </Button>

                                    <Button
                                        as={Link}
                                        to={Routes.Notificaciones.path}
                                        variant="outline-primary"
                                    >
                                        <FontAwesomeIcon
                                            icon={faBell}
                                            className="me-2"
                                        />
                                        Notifications
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} xl={8} className="mb-4">
                            <Card border="light" className="shadow-sm h-100">
                                <Card.Header>
                                    <strong>
                                        <FontAwesomeIcon
                                            icon={faHistory}
                                            className="me-2"
                                        />
                                        Recent audit activity
                                    </strong>
                                </Card.Header>

                                <Card.Body className="p-0">
                                    <Table
                                        responsive
                                        hover
                                        className="user-table align-items-center mb-0"
                                    >
                                        <thead>
                                            <tr>
                                                <th>Action</th>
                                                <th>Entity</th>
                                                <th>Detail</th>
                                                <th>User</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {datos.auditorias.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan="5"
                                                        className="text-center py-4"
                                                    >
                                                        No audit events registered yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                datos.auditorias.map((auditoria) => (
                                                    <tr key={auditoria.id}>
                                                        <td>
                                                            <Badge
                                                                bg={
                                                                    colorAccion[
                                                                        auditoria.accion
                                                                    ] || "secondary"
                                                                }
                                                            >
                                                                {auditoria.accion}
                                                            </Badge>
                                                        </td>

                                                        <td>{auditoria.entidad}</td>

                                                        <td>
                                                            {auditoria.detalle || "-"}
                                                        </td>

                                                        <td>
                                                            {auditoria.usuarioEmail}
                                                        </td>

                                                        <td>
                                                            {formatearFecha(
                                                                auditoria.fecha
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </>
    );
}