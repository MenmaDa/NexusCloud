import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCloud,
    faEdit,
    faExclamationTriangle,
    faHome,
    faPlus,
    faServer,
    faTrash
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
import { listarSedes } from "../../services/sedeApi";
import {
    actualizarInfraestructura,
    crearInfraestructura,
    eliminarInfraestructura,
    listarInfraestructuras
} from "../../services/infraestructuraApi";

const formularioInicial = () => ({
    nombre: "",
    tipo: "SERVIDOR",
    proveedor: "",
    modelo: "",
    numeroSerie: "",
    direccionIp: "",
    capacidad: "",
    sedeId: "",
    responsableId: "",
    estado: "OPERATIVO",
    fechaAdquisicion: "",
    fechaVencimiento: "",
    descripcion: ""
});

const colorEstado = {
    OPERATIVO: "success",
    MANTENIMIENTO: "warning",
    INCIDENTE: "danger",
    INACTIVO: "secondary"
};

const tipos = [
    "SERVIDOR",
    "EQUIPO_RED",
    "DISPOSITIVO_SEGURIDAD",
    "SERVICIO_CLOUD",
    "HOSTING_DOMINIO",
    "BACKUP",
    "OTRO"
];

const estados = [
    "OPERATIVO",
    "MANTENIMIENTO",
    "INCIDENTE",
    "INACTIVO"
];

const estaPorVencer = (fecha) => {
    if (!fecha) return false;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const limite = new Date(hoy);
    limite.setDate(limite.getDate() + 30);

    const vencimiento = new Date(`${fecha}T00:00:00`);

    return vencimiento >= hoy && vencimiento <= limite;
};

export default function InfrastructurePage() {
    const [infraestructuras, setInfraestructuras] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [empleados, setEmpleados] = useState([]);

    const [formulario, setFormulario] = useState(formularioInicial());
    const [infraestructuraEditando, setInfraestructuraEditando] =
        useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const cargarDatos = async () => {
        try {
            setCargando(true);
            setError("");

            const [
                datosInfraestructura,
                datosSedes,
                datosEmpleados
            ] = await Promise.all([
                listarInfraestructuras(),
                listarSedes(),
                listarEmpleados()
            ]);

            setInfraestructuras(datosInfraestructura);
            setSedes(datosSedes.filter((sede) => sede.activo !== false));
            setEmpleados(
                datosEmpleados.filter((empleado) => empleado.activo !== false)
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
        setInfraestructuraEditando(null);
        setFormulario(formularioInicial());
        setError("");
        setMostrarModal(true);
    };

    const abrirEditar = (infraestructura) => {
        setInfraestructuraEditando(infraestructura);

        setFormulario({
            nombre: infraestructura.nombre || "",
            tipo: infraestructura.tipo || "SERVIDOR",
            proveedor: infraestructura.proveedor || "",
            modelo: infraestructura.modelo || "",
            numeroSerie: infraestructura.numeroSerie || "",
            direccionIp: infraestructura.direccionIp || "",
            capacidad: infraestructura.capacidad || "",
            sedeId: infraestructura.sedeId || "",
            responsableId: infraestructura.responsableId || "",
            estado: infraestructura.estado || "OPERATIVO",
            fechaAdquisicion: infraestructura.fechaAdquisicion || "",
            fechaVencimiento: infraestructura.fechaVencimiento || "",
            descripcion: infraestructura.descripcion || ""
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

    const guardarInfraestructura = async (evento) => {
        evento.preventDefault();

        try {
            setError("");

            const datos = {
                ...formulario,
                sedeId: formulario.sedeId || null,
                responsableId: formulario.responsableId || null,
                fechaAdquisicion: formulario.fechaAdquisicion || null,
                fechaVencimiento: formulario.fechaVencimiento || null
            };

            if (infraestructuraEditando) {
                await actualizarInfraestructura(
                    infraestructuraEditando.id,
                    datos
                );
            } else {
                await crearInfraestructura(datos);
            }

            setMostrarModal(false);
            await cargarDatos();
        } catch (err) {
            setError(err.message);
        }
    };

    const borrarInfraestructura = async (infraestructura) => {
        const confirmar = window.confirm(
            `Delete infrastructure asset "${infraestructura.nombre}"?`
        );

        if (!confirmar) return;

        try {
            setError("");
            await eliminarInfraestructura(infraestructura.id);
            await cargarDatos();
        } catch (err) {
            setError(err.message);
        }
    };

    const activas = infraestructuras.filter(
        (infraestructura) => infraestructura.activo !== false
    );

    const operativas = activas.filter(
        (infraestructura) => infraestructura.estado === "OPERATIVO"
    ).length;

    const incidentes = activas.filter(
        (infraestructura) => infraestructura.estado === "INCIDENTE"
    ).length;

    const porVencer = activas.filter((infraestructura) =>
        estaPorVencer(infraestructura.fechaVencimiento)
    ).length;

    return (
        <>
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                <div>
                    <Breadcrumb className="d-none d-md-inline-block">
                        <Breadcrumb.Item href="#/dashboard/overview">
                            <FontAwesomeIcon icon={faHome} />
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active>
                            Infrastructure
                        </Breadcrumb.Item>
                    </Breadcrumb>

                    <h2 className="h4">Infrastructure Inventory</h2>
                    <p className="mb-0">
                        Manage servers, network devices, cloud services and backups.
                    </p>
                </div>

                <Button variant="primary" onClick={abrirCrear}>
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    New asset
                </Button>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <div className="row">
                <div className="col-md-3 mb-4">
                    <Card border="light" className="shadow-sm">
                        <Card.Body>
                            <small className="text-gray">Active assets</small>
                            <h3 className="mb-0">
                                <FontAwesomeIcon
                                    icon={faServer}
                                    className="text-primary me-2"
                                />
                                {activas.length}
                            </h3>
                        </Card.Body>
                    </Card>
                </div>

                <div className="col-md-3 mb-4">
                    <Card border="light" className="shadow-sm">
                        <Card.Body>
                            <small className="text-gray">Operational</small>
                            <h3 className="mb-0 text-success">
                                {operativas}
                            </h3>
                        </Card.Body>
                    </Card>
                </div>

                <div className="col-md-3 mb-4">
                    <Card border="light" className="shadow-sm">
                        <Card.Body>
                            <small className="text-gray">Incidents</small>
                            <h3 className="mb-0 text-danger">
                                {incidentes}
                            </h3>
                        </Card.Body>
                    </Card>
                </div>

                <div className="col-md-3 mb-4">
                    <Card border="light" className="shadow-sm">
                        <Card.Body>
                            <small className="text-gray">
                                Expiring within 30 days
                            </small>
                            <h3 className="mb-0 text-warning">
                                <FontAwesomeIcon
                                    icon={faCloud}
                                    className="me-2"
                                />
                                {porVencer}
                            </h3>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            <Card border="light" className="shadow-sm">
                <Card.Header>
                    <FontAwesomeIcon icon={faServer} className="me-2" />
                    <strong>Registered assets</strong>
                </Card.Header>

                <Card.Body className="p-0">
                    <Table
                        responsive
                        hover
                        className="user-table align-items-center mb-0"
                    >
                        <thead>
                            <tr>
                                <th>Asset</th>
                                <th>Type</th>
                                <th>Branch</th>
                                <th>IP / Capacity</th>
                                <th>Responsible</th>
                                <th>Status</th>
                                <th>Expiration</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {cargando ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">
                                        Loading infrastructure...
                                    </td>
                                </tr>
                            ) : infraestructuras.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">
                                        No infrastructure assets registered yet.
                                    </td>
                                </tr>
                            ) : (
                                infraestructuras.map((infraestructura) => (
                                    <tr key={infraestructura.id}>
                                        <td>
                                            <strong>{infraestructura.nombre}</strong>
                                            <div className="small text-gray">
                                                {infraestructura.proveedor || "-"}
                                            </div>
                                        </td>

                                        <td>{infraestructura.tipo}</td>

                                        <td>
                                            {infraestructura.sedeNombre || "Cloud / Remote"}
                                        </td>

                                        <td>
                                            <div>
                                                {infraestructura.direccionIp || "-"}
                                            </div>
                                            <small className="text-gray">
                                                {infraestructura.capacidad || ""}
                                            </small>
                                        </td>

                                        <td>
                                            {infraestructura.responsableNombre || "-"}
                                        </td>

                                        <td>
                                            <Badge
                                                bg={
                                                    colorEstado[
                                                        infraestructura.estado
                                                    ] || "secondary"
                                                }
                                            >
                                                {infraestructura.estado}
                                            </Badge>
                                        </td>

                                        <td>
                                            {infraestructura.fechaVencimiento || "-"}
                                            {estaPorVencer(
                                                infraestructura.fechaVencimiento
                                            ) && (
                                                <FontAwesomeIcon
                                                    icon={faExclamationTriangle}
                                                    className="text-warning ms-2"
                                                />
                                            )}
                                        </td>

                                        <td className="text-end">
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                className="me-2"
                                                onClick={() =>
                                                    abrirEditar(infraestructura)
                                                }
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="outline-danger"
                                                onClick={() =>
                                                    borrarInfraestructura(
                                                        infraestructura
                                                    )
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
                size="xl"
                show={mostrarModal}
                onHide={() => setMostrarModal(false)}
            >
                <Form onSubmit={guardarInfraestructura}>
                    <Modal.Header>
                        <Modal.Title>
                            {infraestructuraEditando
                                ? "Edit infrastructure asset"
                                : "New infrastructure asset"}
                        </Modal.Title>

                        <Button
                            variant="close"
                            onClick={() => setMostrarModal(false)}
                        />
                    </Modal.Header>

                    <Modal.Body>
                        <div className="row">
                            <Form.Group className="col-md-6 mb-3">
                                <Form.Label>Asset name</Form.Label>
                                <Form.Control
                                    required
                                    name="nombre"
                                    value={formulario.nombre}
                                    onChange={cambiarCampo}
                                    placeholder="Example: Main Firewall"
                                />
                            </Form.Group>

                            <Form.Group className="col-md-6 mb-3">
                                <Form.Label>Type</Form.Label>
                                <Form.Select
                                    required
                                    name="tipo"
                                    value={formulario.tipo}
                                    onChange={cambiarCampo}
                                >
                                    {tipos.map((tipo) => (
                                        <option key={tipo} value={tipo}>
                                            {tipo}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </div>

                        <div className="row">
                            <Form.Group className="col-md-4 mb-3">
                                <Form.Label>Provider</Form.Label>
                                <Form.Control
                                    name="proveedor"
                                    value={formulario.proveedor}
                                    onChange={cambiarCampo}
                                    placeholder="Example: AWS, Cisco"
                                />
                            </Form.Group>

                            <Form.Group className="col-md-4 mb-3">
                                <Form.Label>Model</Form.Label>
                                <Form.Control
                                    name="modelo"
                                    value={formulario.modelo}
                                    onChange={cambiarCampo}
                                />
                            </Form.Group>

                            <Form.Group className="col-md-4 mb-3">
                                <Form.Label>Serial number</Form.Label>
                                <Form.Control
                                    name="numeroSerie"
                                    value={formulario.numeroSerie}
                                    onChange={cambiarCampo}
                                />
                            </Form.Group>
                        </div>

                        <div className="row">
                            <Form.Group className="col-md-4 mb-3">
                                <Form.Label>IP address</Form.Label>
                                <Form.Control
                                    name="direccionIp"
                                    value={formulario.direccionIp}
                                    onChange={cambiarCampo}
                                    placeholder="Example: 192.168.1.1"
                                />
                            </Form.Group>

                            <Form.Group className="col-md-4 mb-3">
                                <Form.Label>Capacity</Form.Label>
                                <Form.Control
                                    name="capacidad"
                                    value={formulario.capacidad}
                                    onChange={cambiarCampo}
                                    placeholder="Example: 1 TB / 1 Gbps"
                                />
                            </Form.Group>

                            <Form.Group className="col-md-4 mb-3">
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    name="estado"
                                    value={formulario.estado}
                                    onChange={cambiarCampo}
                                >
                                    {estados.map((estado) => (
                                        <option key={estado} value={estado}>
                                            {estado}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </div>

                        <div className="row">
                            <Form.Group className="col-md-6 mb-3">
                                <Form.Label>Branch (optional)</Form.Label>
                                <Form.Select
                                    name="sedeId"
                                    value={formulario.sedeId}
                                    onChange={cambiarCampo}
                                >
                                    <option value="">Cloud / Remote</option>

                                    {sedes.map((sede) => (
                                        <option key={sede.id} value={sede.id}>
                                            {sede.nombre}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="col-md-6 mb-3">
                                <Form.Label>Responsible employee</Form.Label>
                                <Form.Select
                                    name="responsableId"
                                    value={formulario.responsableId}
                                    onChange={cambiarCampo}
                                >
                                    <option value="">No responsible employee</option>

                                    {empleados.map((empleado) => (
                                        <option
                                            key={empleado.id}
                                            value={empleado.id}
                                        >
                                            {empleado.nombres} {empleado.apellidos}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </div>

                        <div className="row">
                            <Form.Group className="col-md-6 mb-3">
                                <Form.Label>Acquisition date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="fechaAdquisicion"
                                    value={formulario.fechaAdquisicion}
                                    onChange={cambiarCampo}
                                />
                            </Form.Group>

                            <Form.Group className="col-md-6 mb-3">
                                <Form.Label>Expiration date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="fechaVencimiento"
                                    value={formulario.fechaVencimiento}
                                    onChange={cambiarCampo}
                                />
                            </Form.Group>
                        </div>

                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows="3"
                                name="descripcion"
                                value={formulario.descripcion}
                                onChange={cambiarCampo}
                                placeholder="Technical notes, configuration or observations."
                            />
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
                            {infraestructuraEditando
                                ? "Save changes"
                                : "Create asset"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}