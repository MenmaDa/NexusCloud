import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEdit,
    faHome,
    faPlus,
    faProjectDiagram,
    faTrash,
    faUsers
} from "@fortawesome/free-solid-svg-icons";
import {
    Badge,
    Breadcrumb,
    Button,
    Card,
    Form,
    Modal,
    Table
} from "@themesberg/react-bootstrap";

import { listarEmpleados } from "../../services/empleadoApi";
import { listarProyectos } from "../../services/proyectoApi";
import {
    actualizarAsignacionRecurso,
    crearAsignacionRecurso,
    eliminarAsignacionRecurso,
    listarAsignacionesRecursos
} from "../../services/asignacionRecursoApi";

const fechaActual = () => new Date().toISOString().slice(0, 10);

const formularioInicial = () => ({
    proyectoId: "",
    empleadoId: "",
    fechaInicio: fechaActual(),
    fechaFin: "",
    porcentajeDedicacion: 50
});

const colorDedicacion = (dedicacion) => {
    if (dedicacion >= 100) return "danger";
    if (dedicacion >= 75) return "warning";
    return "success";
};

export default function ResourcesPage() {
    const [asignaciones, setAsignaciones] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [proyectos, setProyectos] = useState([]);

    const [formulario, setFormulario] = useState(formularioInicial());
    const [asignacionEditando, setAsignacionEditando] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const cargarDatos = async () => {
        try {
            setCargando(true);
            setError("");

            const [
                datosAsignaciones,
                datosEmpleados,
                datosProyectos
            ] = await Promise.all([
                listarAsignacionesRecursos(),
                listarEmpleados(),
                listarProyectos()
            ]);

            setAsignaciones(datosAsignaciones);
            setEmpleados(
                datosEmpleados.filter((empleado) => empleado.activo !== false)
            );
            setProyectos(
                datosProyectos.filter((proyecto) => proyecto.activo !== false)
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const abrirCrear = () => {
        setAsignacionEditando(null);
        setFormulario(formularioInicial());
        setError("");
        setMostrarModal(true);
    };

    const abrirEditar = (asignacion) => {
        setAsignacionEditando(asignacion);

        setFormulario({
            proyectoId: asignacion.proyectoId || "",
            empleadoId: asignacion.empleadoId || "",
            fechaInicio: asignacion.fechaInicio || "",
            fechaFin: asignacion.fechaFin || "",
            porcentajeDedicacion: asignacion.porcentajeDedicacion || 50
        });

        setError("");
        setMostrarModal(true);
    };

    const cambiarCampo = (evento) => {
        const { name, value } = evento.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value
        }));
    };

    const guardarAsignacion = async (evento) => {
        evento.preventDefault();

        try {
            setError("");

            const datos = {
                ...formulario,
                porcentajeDedicacion: Number(
                    formulario.porcentajeDedicacion
                )
            };

            if (asignacionEditando) {
                await actualizarAsignacionRecurso(
                    asignacionEditando.id,
                    datos
                );
            } else {
                await crearAsignacionRecurso(datos);
            }

            setMostrarModal(false);
            await cargarDatos();
        } catch (err) {
            setError(err.message);
        }
    };

    const borrarAsignacion = async (asignacion) => {
        const confirmar = window.confirm(
            `Remove ${asignacion.empleadoNombre} from ${asignacion.proyectoNombre}?`
        );

        if (!confirmar) return;

        try {
            setError("");
            await eliminarAsignacionRecurso(asignacion.id);
            await cargarDatos();
        } catch (err) {
            setError(err.message);
        }
    };

    const asignacionesActivas = asignaciones.filter((asignacion) => {
        const hoy = fechaActual();

        return (
            asignacion.fechaInicio <= hoy
            && asignacion.fechaFin >= hoy
        );
    });

    const empleadosAsignados = new Set(
        asignacionesActivas.map((asignacion) => asignacion.empleadoId)
    ).size;

    const empleadosDedicacionCompleta = new Set(
        asignacionesActivas
            .filter(
                (asignacion) =>
                    asignacion.porcentajeDedicacion >= 100
            )
            .map((asignacion) => asignacion.empleadoId)
    ).size;

    return (
        <>
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                <div>
                    <Breadcrumb className="d-none d-md-inline-block">
                        <Breadcrumb.Item href="#/dashboard/overview">
                            <FontAwesomeIcon icon={faHome} />
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active>Resources</Breadcrumb.Item>
                    </Breadcrumb>

                    <h2 className="h4">Resource Allocation</h2>
                    <p className="mb-0">
                        Assign employees to projects and control team capacity.
                    </p>
                </div>

                <Button variant="primary" onClick={abrirCrear}>
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    New assignment
                </Button>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <div className="row">
                <div className="col-md-4 mb-4">
                    <Card border="light" className="shadow-sm">
                        <Card.Body>
                            <small className="text-gray">
                                Active assignments
                            </small>
                            <h3 className="mb-0">
                                {asignacionesActivas.length}
                            </h3>
                        </Card.Body>
                    </Card>
                </div>

                <div className="col-md-4 mb-4">
                    <Card border="light" className="shadow-sm">
                        <Card.Body>
                            <small className="text-gray">
                                Assigned employees
                            </small>
                            <h3 className="mb-0">
                                <FontAwesomeIcon
                                    icon={faUsers}
                                    className="text-primary me-2"
                                />
                                {empleadosAsignados}
                            </h3>
                        </Card.Body>
                    </Card>
                </div>

                <div className="col-md-4 mb-4">
                    <Card border="light" className="shadow-sm">
                        <Card.Body>
                            <small className="text-gray">
                                Full dedication
                            </small>
                            <h3 className="mb-0 text-warning">
                                {empleadosDedicacionCompleta}
                            </h3>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            <Card border="light" className="shadow-sm">
                <Card.Header>
                    <FontAwesomeIcon
                        icon={faProjectDiagram}
                        className="me-2"
                    />
                    <strong>Project assignments</strong>
                </Card.Header>

                <Card.Body className="p-0">
                    <Table
                        responsive
                        hover
                        className="user-table align-items-center mb-0"
                    >
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Position</th>
                                <th>Project</th>
                                <th>Start date</th>
                                <th>End date</th>
                                <th>Dedication</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {cargando ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">
                                        Loading assignments...
                                    </td>
                                </tr>
                            ) : asignaciones.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">
                                        No resource assignments registered yet.
                                    </td>
                                </tr>
                            ) : (
                                asignaciones.map((asignacion) => (
                                    <tr key={asignacion.id}>
                                        <td className="fw-bold">
                                            {asignacion.empleadoNombre}
                                        </td>
                                        <td>
                                            {asignacion.empleadoCargo || "-"}
                                        </td>
                                        <td>
                                            {asignacion.proyectoNombre}
                                        </td>
                                        <td>{asignacion.fechaInicio}</td>
                                        <td>{asignacion.fechaFin}</td>
                                        <td>
                                            <Badge
                                                bg={colorDedicacion(
                                                    asignacion.porcentajeDedicacion
                                                )}
                                            >
                                                {asignacion.porcentajeDedicacion}%
                                            </Badge>
                                        </td>
                                        <td className="text-end">
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                className="me-2"
                                                onClick={() =>
                                                    abrirEditar(asignacion)
                                                }
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="outline-danger"
                                                onClick={() =>
                                                    borrarAsignacion(asignacion)
                                                }
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal
                as={Modal.Dialog}
                centered
                show={mostrarModal}
                onHide={() => setMostrarModal(false)}
            >
                <Form onSubmit={guardarAsignacion}>
                    <Modal.Header>
                        <Modal.Title>
                            {asignacionEditando
                                ? "Edit assignment"
                                : "New resource assignment"}
                        </Modal.Title>

                        <Button
                            variant="close"
                            onClick={() => setMostrarModal(false)}
                        />
                    </Modal.Header>

                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Employee</Form.Label>
                            <Form.Select
                                required
                                name="empleadoId"
                                value={formulario.empleadoId}
                                onChange={cambiarCampo}
                            >
                                <option value="">Select an employee</option>

                                {empleados.map((empleado) => (
                                    <option
                                        key={empleado.id}
                                        value={empleado.id}
                                    >
                                        {empleado.nombres} {empleado.apellidos}
                                        {empleado.cargo
                                            ? ` — ${empleado.cargo}`
                                            : ""}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Project</Form.Label>
                            <Form.Select
                                required
                                name="proyectoId"
                                value={formulario.proyectoId}
                                onChange={cambiarCampo}
                            >
                                <option value="">Select a project</option>

                                {proyectos.map((proyecto) => (
                                    <option
                                        key={proyecto.id}
                                        value={proyecto.id}
                                    >
                                        {proyecto.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <div className="row">
                            <Form.Group className="col-md-6 mb-3">
                                <Form.Label>Start date</Form.Label>
                                <Form.Control
                                    required
                                    type="date"
                                    name="fechaInicio"
                                    value={formulario.fechaInicio}
                                    onChange={cambiarCampo}
                                />
                            </Form.Group>

                            <Form.Group className="col-md-6 mb-3">
                                <Form.Label>End date</Form.Label>
                                <Form.Control
                                    required
                                    type="date"
                                    name="fechaFin"
                                    value={formulario.fechaFin}
                                    onChange={cambiarCampo}
                                />
                            </Form.Group>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label>Dedication percentage</Form.Label>
                            <Form.Control
                                required
                                min="1"
                                max="100"
                                type="number"
                                name="porcentajeDedicacion"
                                value={formulario.porcentajeDedicacion}
                                onChange={cambiarCampo}
                            />
                            <Form.Text className="text-muted">
                                Example: 50 means half-time dedication.
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => setMostrarModal(false)}
                        >
                            Cancel
                        </Button>

                        <Button variant="primary" type="submit">
                            {asignacionEditando
                                ? "Save changes"
                                : "Create assignment"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}