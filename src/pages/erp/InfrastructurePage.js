import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Chartist from "react-chartist";
import ChartistTooltip from "chartist-plugin-tooltips-updated";
import ImportarExcelModal from "../components/ImportarExcelModal";
import {
    faChartLine,
    faSyncAlt,
    faWifi,
    faCloud,
    faEdit,
    faExclamationTriangle,
    faFileExcel,
    faHome,
    faPlus,
    faServer,
    faTrash,
    faNetworkWired,
} from "@fortawesome/free-solid-svg-icons";
import {
    Badge,
    Breadcrumb,
    Button,
    Card,
    Col,
    Form,
    Modal,
    Row,
    Table
} from "@themesberg/react-bootstrap";

import {
    obtenerResumenMonitoreo,
    verificarInfraestructura
} from "../../services/monitoreoInfraestructuraApi";

import { listarEmpleados } from "../../services/empleadoApi";
import { listarSedes } from "../../services/sedeApi";
import {
    actualizarInfraestructura,
    crearInfraestructura,
    eliminarInfraestructura,
    importarInfraestructura,
    listarInfraestructuras
} from "../../services/infraestructuraApi";

import {
    listarDireccionesRed,
    crearDireccionRed,
    actualizarDireccionRed,
    eliminarDireccionRed
} from "../../services/direccionRedApi";

const formularioInicial = () => ({
    nombre: "",
    tipo: "SERVIDOR",
    proveedor: "",
    modelo: "",
    numeroSerie: "",
    direccionIp: "",
    puertoMonitoreo: "",
    monitoreoHabilitado: true,
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
const formularioDireccionInicial = {
    direccionIp: "",
    mascara: "",
    gateway: "",
    dns: "",
    direccionMac: "",
    servidorDhcp: ""
};

const transformarActivoExcel = (fila) => {
    const nombre = String(fila.nombre || "").trim();

    if (!nombre) {
        throw new Error("Asset name is required.");
    }

    const ips = String(fila.ips || "");

    return {
        nombre,
        tipoFuente: String(fila.tipoFuente || "").trim(),
        modelo: String(fila.modelo || "").trim(),
        numeroSerie: String(fila.numeroSerie || "").trim(),
        direccionIp: ips.split(";")[0]?.trim() || ""
    };
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

    const [mostrarImportador, setMostrarImportador] = useState(false);
    const [mostrarDirecciones, setMostrarDirecciones] = useState(false);
    const [infraestructuraDirecciones, setInfraestructuraDirecciones] =
        useState(null);
    const [direccionesRed, setDireccionesRed] = useState([]);
    const [formularioDireccion, setFormularioDireccion] =
        useState(formularioDireccionInicial);
    const [direccionEditando, setDireccionEditando] = useState(null);
    const [guardandoDireccion, setGuardandoDireccion] = useState(false);
    const [monitoreos, setMonitoreos] = useState({});
    const [activoMonitoreado, setActivoMonitoreado] = useState(null);
    const [resumenMonitoreo, setResumenMonitoreo] = useState(null);
    const [mostrarMonitoreo, setMostrarMonitoreo] = useState(false);
    const [cargandoMonitoreo, setCargandoMonitoreo] = useState(false);
    const [verificando, setVerificando] = useState(false);

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
            const resultadosMonitoreo = await Promise.all(
                datosInfraestructura.map(async (infraestructura) => {
                    try {
                        const resumen = await obtenerResumenMonitoreo(
                            infraestructura.id
                        );

                        return [infraestructura.id, resumen];
                    } catch {
                        return [infraestructura.id, null];
                    }
                })
            );

            setMonitoreos(Object.fromEntries(resultadosMonitoreo));
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

    const cargarResumenMonitoreo = async (infraestructuraId) => {
        const resumen = await obtenerResumenMonitoreo(infraestructuraId);

        setResumenMonitoreo(resumen);

        setMonitoreos((anteriores) => ({
            ...anteriores,
            [infraestructuraId]: resumen
        }));
    };

    const abrirMonitoreo = async (infraestructura) => {
        setActivoMonitoreado(infraestructura);
        setResumenMonitoreo(monitoreos[infraestructura.id] || null);
        setMostrarMonitoreo(true);

        try {
            setCargandoMonitoreo(true);
            await cargarResumenMonitoreo(infraestructura.id);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargandoMonitoreo(false);
        }
    };

    const comprobarAhora = async () => {
        if (!activoMonitoreado) return;

        try {
            setVerificando(true);
            setError("");

            await verificarInfraestructura(activoMonitoreado.id);
            await cargarResumenMonitoreo(activoMonitoreado.id);
        } catch (err) {
            setError(err.message);
        } finally {
            setVerificando(false);
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
            puertoMonitoreo: infraestructura.puertoMonitoreo || "",
            monitoreoHabilitado: infraestructura.monitoreoHabilitado !== false,
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

    const abrirDirecciones = async (infraestructura) => {
        setInfraestructuraDirecciones(infraestructura);
        setMostrarDirecciones(true);
        setDireccionEditando(null);
        setFormularioDireccion(formularioDireccionInicial);

        try {
            const datos = await listarDireccionesRed(infraestructura.id);
            setDireccionesRed(datos);
        } catch (error) {
            setError(error.message);
        }
    };

    const guardarDireccion = async (event) => {
        event.preventDefault();

        if (!infraestructuraDirecciones) return;

        setGuardandoDireccion(true);
        setError("");

        try {
            if (direccionEditando) {
                await actualizarDireccionRed(
                    infraestructuraDirecciones.id,
                    direccionEditando.id,
                    formularioDireccion
                );
            } else {
                await crearDireccionRed(
                    infraestructuraDirecciones.id,
                    formularioDireccion
                );
            }

            const datos = await listarDireccionesRed(
                infraestructuraDirecciones.id
            );

            setDireccionesRed(datos);
            setDireccionEditando(null);
            setFormularioDireccion(formularioDireccionInicial);
        } catch (error) {
            setError(error.message);
        } finally {
            setGuardandoDireccion(false);
        }
    };

    const editarDireccion = (direccion) => {
        setDireccionEditando(direccion);

        setFormularioDireccion({
            direccionIp: direccion.direccionIp || "",
            mascara: direccion.mascara || "",
            gateway: direccion.gateway || "",
            dns: direccion.dns || "",
            direccionMac: direccion.direccionMac || "",
            servidorDhcp: direccion.servidorDhcp || ""
        });
    };

    const borrarDireccion = async (direccionId) => {
        if (
            !infraestructuraDirecciones ||
            !window.confirm("Delete this network address?")
        ) {
            return;
        }

        try {
            await eliminarDireccionRed(
                infraestructuraDirecciones.id,
                direccionId
            );

            setDireccionesRed((actuales) =>
                actuales.filter((direccion) => direccion.id !== direccionId)
            );
        } catch (error) {
            setError(error.message);
        }
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
                puertoMonitoreo: formulario.puertoMonitoreo
                    ? Number(formulario.puertoMonitoreo)
                    : null,
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

                <div className="d-flex gap-2">
                    <Button
                        variant="outline-success"
                        onClick={() => setMostrarImportador(true)}
                    >
                        <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                        Import Excel
                    </Button>

                    <Button variant="primary" onClick={abrirCrear}>
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        New asset
                    </Button>
                </div>
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
                                            {monitoreos[infraestructura.id]?.ultimaRevision && (
                                                <div className="small mt-1">
                                                    <Badge
                                                        bg={
                                                            monitoreos[infraestructura.id]
                                                                .ultimaRevision.disponible
                                                                ? "success"
                                                                : "danger"
                                                        }
                                                    >
                                                        {monitoreos[infraestructura.id]
                                                            .ultimaRevision.disponible
                                                            ? "ONLINE"
                                                            : "OFFLINE"}
                                                    </Badge>

                                                    {monitoreos[infraestructura.id]
                                                        .ultimaRevision.latenciaMs != null && (
                                                            <span className="text-gray ms-2">
                                                                {monitoreos[infraestructura.id]
                                                                    .ultimaRevision.latenciaMs} ms
                                                            </span>
                                                        )}
                                                </div>
                                            )}
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
                                                variant="outline-info"
                                                className="me-2"
                                                title="Monitor activity"
                                                onClick={() => abrirMonitoreo(infraestructura)}
                                            >
                                                <FontAwesomeIcon icon={faChartLine} />
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                className="me-2"
                                                title="Network addresses"
                                                onClick={() => abrirDirecciones(infraestructura)}
                                            >
                                                <FontAwesomeIcon icon={faNetworkWired} />
                                            </Button>

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

                            <Form.Group className="col-md-2 mb-3">
                                <Form.Label>Monitor port</Form.Label>
                                <Form.Control
                                    min="1"
                                    max="65535"
                                    type="number"
                                    name="puertoMonitoreo"
                                    value={formulario.puertoMonitoreo}
                                    onChange={cambiarCampo}
                                    placeholder="443"
                                />
                            </Form.Group>

                            <Form.Group className="col-md-3 mb-3">
                                <Form.Label>Capacity</Form.Label>
                                <Form.Control
                                    name="capacidad"
                                    value={formulario.capacidad}
                                    onChange={cambiarCampo}
                                    placeholder="Example: 1 TB / 1 Gbps"
                                />
                            </Form.Group>

                            <Form.Group className="col-md-3 mb-3">
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

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="switch"
                                id="monitoreoHabilitado"
                                label="Enable automatic monitoring for this asset"
                                checked={formulario.monitoreoHabilitado}
                                onChange={(event) => {
                                    const habilitado = event.target.checked;

                                    setFormulario((anterior) => ({
                                        ...anterior,
                                        monitoreoHabilitado: habilitado
                                    }));
                                }}
                            />

                            <Form.Text className="text-muted">
                                Use a port for a real TCP connection check. Leave it empty
                                to perform an IP reachability check.
                            </Form.Text>
                        </Form.Group>

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
            <Modal
                as={Modal.Dialog}
                centered
                size="xl"
                show={mostrarMonitoreo}
                onHide={() => setMostrarMonitoreo(false)}
            >
                <Modal.Header>
                    <Modal.Title>
                        <FontAwesomeIcon icon={faWifi} className="me-2" />
                        Monitoring: {activoMonitoreado?.nombre}
                    </Modal.Title>

                    <Button
                        variant="close"
                        onClick={() => setMostrarMonitoreo(false)}
                    />
                </Modal.Header>

                <Modal.Body>
                    {cargandoMonitoreo ? (
                        <div className="text-center py-5">
                            Loading monitoring history...
                        </div>
                    ) : !resumenMonitoreo ? (
                        <div className="text-center py-5 text-gray">
                            No monitoring information is available yet.
                        </div>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h6 className="mb-1">
                                        IP: {resumenMonitoreo.direccionIp || "Not configured"}
                                    </h6>

                                    <small className="text-gray">
                                        {resumenMonitoreo.puertoMonitoreo
                                            ? `TCP port: ${resumenMonitoreo.puertoMonitoreo}`
                                            : "IP reachability check"}
                                    </small>
                                </div>

                                <Button
                                    variant="primary"
                                    onClick={comprobarAhora}
                                    disabled={verificando}
                                >
                                    <FontAwesomeIcon
                                        icon={faSyncAlt}
                                        spin={verificando}
                                        className="me-2"
                                    />
                                    {verificando ? "Checking..." : "Check now"}
                                </Button>
                            </div>

                            <div className="row mb-4">
                                <div className="col-md-3 mb-3">
                                    <Card border="light" className="bg-soft h-100">
                                        <Card.Body>
                                            <small className="text-gray">
                                                Current status
                                            </small>

                                            <h4 className="mb-0">
                                                {resumenMonitoreo.ultimaRevision ? (
                                                    <Badge
                                                        bg={
                                                            resumenMonitoreo.ultimaRevision
                                                                .disponible
                                                                ? "success"
                                                                : "danger"
                                                        }
                                                    >
                                                        {resumenMonitoreo.ultimaRevision
                                                            .disponible
                                                            ? "ONLINE"
                                                            : "OFFLINE"}
                                                    </Badge>
                                                ) : (
                                                    "NO DATA"
                                                )}
                                            </h4>
                                        </Card.Body>
                                    </Card>
                                </div>

                                <div className="col-md-3 mb-3">
                                    <Card border="light" className="bg-soft h-100">
                                        <Card.Body>
                                            <small className="text-gray">
                                                Availability
                                            </small>
                                            <h4 className="mb-0">
                                                {resumenMonitoreo.disponibilidadPorcentaje}%
                                            </h4>
                                        </Card.Body>
                                    </Card>
                                </div>

                                <div className="col-md-3 mb-3">
                                    <Card border="light" className="bg-soft h-100">
                                        <Card.Body>
                                            <small className="text-gray">
                                                Average latency
                                            </small>
                                            <h4 className="mb-0">
                                                {resumenMonitoreo.latenciaPromedioMs != null
                                                    ? `${Math.round(
                                                        resumenMonitoreo.latenciaPromedioMs
                                                    )} ms`
                                                    : "-"}
                                            </h4>
                                        </Card.Body>
                                    </Card>
                                </div>

                                <div className="col-md-3 mb-3">
                                    <Card border="light" className="bg-soft h-100">
                                        <Card.Body>
                                            <small className="text-gray">
                                                Latency range
                                            </small>
                                            <h4 className="mb-0">
                                                {resumenMonitoreo.latenciaMinimaMs != null
                                                    ? `${resumenMonitoreo.latenciaMinimaMs} - ${resumenMonitoreo.latenciaMaximaMs} ms`
                                                    : "-"}
                                            </h4>
                                        </Card.Body>
                                    </Card>
                                </div>
                            </div>

                            {resumenMonitoreo.historial.length > 0 ? (
                                <>
                                    <Card border="light" className="shadow-sm mb-4">
                                        <Card.Header>
                                            <strong>Latency history</strong>
                                        </Card.Header>

                                        <Card.Body>
                                            <div style={{ height: "280px" }}>
                                                <Chartist
                                                    type="Line"
                                                    className="ct-series-g ct-double-octave"
                                                    data={{
                                                        labels: resumenMonitoreo.historial.map(
                                                            (revision) =>
                                                                new Date(
                                                                    revision.fechaHora
                                                                ).toLocaleTimeString(
                                                                    "es-CO",
                                                                    {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit"
                                                                    }
                                                                )
                                                        ),
                                                        series: [
                                                            resumenMonitoreo.historial.map(
                                                                (revision) =>
                                                                    revision.disponible
                                                                        ? revision.latenciaMs
                                                                        : null
                                                            )
                                                        ]
                                                    }}
                                                    options={{
                                                        low: 0,
                                                        showArea: true,
                                                        fullWidth: true,
                                                        lineSmooth: true,
                                                        axisX: {
                                                            position: "end",
                                                            showGrid: true
                                                        },
                                                        axisY: {
                                                            showGrid: false,
                                                            labelInterpolationFnc: (
                                                                value
                                                            ) => `${value} ms`
                                                        },
                                                        plugins: [
                                                            ChartistTooltip({
                                                                transformTooltipTextFnc: (
                                                                    value
                                                                ) => `${value} ms`
                                                            })
                                                        ]
                                                    }}
                                                />
                                            </div>
                                        </Card.Body>
                                    </Card>

                                    <h6 className="mb-3">Recent checks</h6>

                                    <Table responsive hover className="user-table">
                                        <thead>
                                            <tr>
                                                <th>Date and time</th>
                                                <th>Status</th>
                                                <th>Latency</th>
                                                <th>Method</th>
                                                <th>Message</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {[...resumenMonitoreo.historial]
                                                .reverse()
                                                .slice(0, 10)
                                                .map((revision) => (
                                                    <tr key={revision.id}>
                                                        <td>
                                                            {new Date(
                                                                revision.fechaHora
                                                            ).toLocaleString("es-CO")}
                                                        </td>

                                                        <td>
                                                            <Badge
                                                                bg={
                                                                    revision.disponible
                                                                        ? "success"
                                                                        : "danger"
                                                                }
                                                            >
                                                                {revision.disponible
                                                                    ? "ONLINE"
                                                                    : "OFFLINE"}
                                                            </Badge>
                                                        </td>

                                                        <td>
                                                            {revision.latenciaMs != null
                                                                ? `${revision.latenciaMs} ms`
                                                                : "-"}
                                                        </td>

                                                        <td>
                                                            {revision.tipoVerificacion}
                                                        </td>

                                                        <td>{revision.mensaje}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </Table>
                                </>
                            ) : (
                                <div className="alert alert-info mb-0">
                                    There are no checks yet. Select <strong>Check now</strong>
                                    to create the first monitoring record.
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setMostrarMonitoreo(false)}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal
                show={mostrarDirecciones}
                onHide={() => setMostrarDirecciones(false)}
                size="xl"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Network addresses
                        {infraestructuraDirecciones &&
                            ` - ${infraestructuraDirecciones.nombre}`}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form onSubmit={guardarDireccion}>
                        <Row>
                            <Col md={4} className="mb-3">
                                <Form.Label>IP address</Form.Label>
                                <Form.Control
                                    value={formularioDireccion.direccionIp}
                                    onChange={(event) =>
                                        setFormularioDireccion({
                                            ...formularioDireccion,
                                            direccionIp: event.target.value
                                        })
                                    }
                                    placeholder="10.0.0.2"
                                />
                            </Col>

                            <Col md={4} className="mb-3">
                                <Form.Label>MAC address</Form.Label>
                                <Form.Control
                                    value={formularioDireccion.direccionMac}
                                    onChange={(event) =>
                                        setFormularioDireccion({
                                            ...formularioDireccion,
                                            direccionMac: event.target.value
                                        })
                                    }
                                    placeholder="0002.4A50.A801"
                                />
                            </Col>

                            <Col md={4} className="mb-3">
                                <Form.Label>Subnet mask</Form.Label>
                                <Form.Control
                                    value={formularioDireccion.mascara}
                                    onChange={(event) =>
                                        setFormularioDireccion({
                                            ...formularioDireccion,
                                            mascara: event.target.value
                                        })
                                    }
                                    placeholder="255.255.255.0"
                                />
                            </Col>

                            <Col md={4} className="mb-3">
                                <Form.Label>Gateway</Form.Label>
                                <Form.Control
                                    value={formularioDireccion.gateway}
                                    onChange={(event) =>
                                        setFormularioDireccion({
                                            ...formularioDireccion,
                                            gateway: event.target.value
                                        })
                                    }
                                />
                            </Col>

                            <Col md={4} className="mb-3">
                                <Form.Label>DNS</Form.Label>
                                <Form.Control
                                    value={formularioDireccion.dns}
                                    onChange={(event) =>
                                        setFormularioDireccion({
                                            ...formularioDireccion,
                                            dns: event.target.value
                                        })
                                    }
                                    placeholder="8.8.8.8"
                                />
                            </Col>

                            <Col md={4} className="mb-3">
                                <Form.Label>DHCP server</Form.Label>
                                <Form.Control
                                    value={formularioDireccion.servidorDhcp}
                                    onChange={(event) =>
                                        setFormularioDireccion({
                                            ...formularioDireccion,
                                            servidorDhcp: event.target.value
                                        })
                                    }
                                />
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end mb-4">
                            {direccionEditando && (
                                <Button
                                    variant="outline-gray"
                                    className="me-2"
                                    onClick={() => {
                                        setDireccionEditando(null);
                                        setFormularioDireccion(formularioDireccionInicial);
                                    }}
                                >
                                    Cancel edit
                                </Button>
                            )}

                            <Button
                                variant="primary"
                                type="submit"
                                disabled={guardandoDireccion}
                            >
                                <FontAwesomeIcon icon={faPlus} className="me-2" />
                                {guardandoDireccion
                                    ? "Saving..."
                                    : direccionEditando
                                        ? "Save changes"
                                        : "Add address"}
                            </Button>
                        </div>
                    </Form>

                    <Table responsive hover className="align-items-center">
                        <thead>
                            <tr>
                                <th>IP address</th>
                                <th>MAC address</th>
                                <th>Mask</th>
                                <th>Gateway</th>
                                <th>DNS</th>
                                <th>DHCP</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {direccionesRed.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted py-4">
                                        No network addresses registered for this asset.
                                    </td>
                                </tr>
                            ) : (
                                direccionesRed.map((direccion) => (
                                    <tr key={direccion.id}>
                                        <td>{direccion.direccionIp || "-"}</td>
                                        <td>{direccion.direccionMac || "-"}</td>
                                        <td>{direccion.mascara || "-"}</td>
                                        <td>{direccion.gateway || "-"}</td>
                                        <td>{direccion.dns || "-"}</td>
                                        <td>{direccion.servidorDhcp || "-"}</td>
                                        <td>
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                className="me-2"
                                                onClick={() => editarDireccion(direccion)}
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="outline-danger"
                                                onClick={() => borrarDireccion(direccion.id)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="gray"
                        onClick={() => setMostrarDirecciones(false)}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <ImportarExcelModal
                show={mostrarImportador}
                onHide={() => setMostrarImportador(false)}
                hoja="01 Inventario"
                campos={[
                    "nombre",
                    "tipoFuente",
                    "modelo",
                    "numeroSerie",
                    "direccionIp"
                ]}
                transformarFila={transformarActivoExcel}
                onImportFile={importarInfraestructura}
                onSaved={async () => {
                    await cargarDatos();
                    setMostrarImportador(false);
                }}
                mapeoColumnas={{
                    nombre: ["Nombre", "Name", "Asset name"],
                    tipoFuente: ["Tipo PT", "Tipo", "Type"],
                    modelo: ["Modelo", "Model"],
                    numeroSerie: [
                        "Serial",
                        "Número de serie",
                        "Numero de serie",
                        "Serial number"
                    ],
                    ips: ["IP(s)", "IP", "Dirección IP", "Direccion IP"]
                }}
                formatearResultadoImportacion={(resultado) =>
                    `Import completed. Assets created: ${resultado.activosCreados}. ` +
                    `Assets updated: ${resultado.activosActualizados}. ` +
                    `Network addresses created: ${resultado.direccionesCreadas}.`
                }
            />
        </>
    );
}