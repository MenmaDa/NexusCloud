import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Routes } from "../../routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMoneyBillWave,
    faEdit,
    faFileInvoiceDollar,
    faHome,
    faPlus,
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

import { listarClientes } from "../../services/clienteApi";
import { listarProyectos } from "../../services/proyectoApi";
import { listarProductosServicios } from "../../services/productoServicioApi";
import {
    actualizarFactura,
    crearFactura,
    eliminarFactura,
    listarFacturas
} from "../../services/facturaApi";

const fechaActual = () => new Date().toISOString().slice(0, 10);

const formularioInicial = () => ({
    numero: "",
    clienteId: "",
    proyectoId: "",
    fechaEmision: fechaActual(),
    fechaVencimiento: "",
    estado: "BORRADOR",
    detalles: [
        {
            productoServicioId: "",
            cantidad: 1,
            descripcion: ""
        }
    ]
});

const colorEstado = {
    BORRADOR: "secondary",
    EMITIDA: "primary",
    ANULADA: "dark"
};

const formatearDinero = (valor) =>
    new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(valor || 0);

export default function BillingPage() {
    const [facturas, setFacturas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [proyectos, setProyectos] = useState([]);
    const [productos, setProductos] = useState([]);

    const [formulario, setFormulario] = useState(formularioInicial());
    const [facturaEditando, setFacturaEditando] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const cargarDatos = async () => {
        try {
            setCargando(true);
            setError("");

            const [
                datosFacturas,
                datosClientes,
                datosProyectos,
                datosProductos
            ] = await Promise.all([
                listarFacturas(),
                listarClientes(),
                listarProyectos(),
                listarProductosServicios()
            ]);

            setFacturas(datosFacturas);
            setClientes(datosClientes.filter((cliente) => cliente.activo !== false));
            setProyectos(datosProyectos);
            setProductos(
                datosProductos.filter((producto) => {
                    const disponible =
                        producto.tipo === "SERVICIO"
                        || (producto.stock || 0) > 0;

                    return producto.activo !== false && disponible;
                })
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
        setFacturaEditando(null);
        setFormulario(formularioInicial());
        setError("");
        setMostrarModal(true);
    };

    const abrirEditar = (factura) => {
        setFacturaEditando(factura);

        setFormulario({
            numero: factura.numero || "",
            clienteId: factura.cliente?.id || "",
            proyectoId: factura.proyecto?.id || "",
            fechaEmision: factura.fechaEmision || fechaActual(),
            fechaVencimiento: factura.fechaVencimiento || "",
            estado: factura.estado || "BORRADOR",
            detalles: factura.detalles?.map((detalle) => ({
                productoServicioId: detalle.productoServicio?.id || "",
                cantidad: detalle.cantidad || 1,
                descripcion: detalle.descripcion || ""
            })) || []
        });

        setError("");
        setMostrarModal(true);
    };

    const cambiarCampo = (evento) => {
        const { name, value } = evento.target;

        setFormulario((anterior) => {
            if (name === "clienteId") {
                return {
                    ...anterior,
                    clienteId: value,
                    proyectoId: ""
                };
            }

            return {
                ...anterior,
                [name]: value
            };
        });
    };

    const agregarDetalle = () => {
        setFormulario((anterior) => ({
            ...anterior,
            detalles: [
                ...anterior.detalles,
                {
                    productoServicioId: "",
                    cantidad: 1,
                    descripcion: ""
                }
            ]
        }));
    };

    const cambiarDetalle = (indice, campo, valor) => {
        setFormulario((anterior) => ({
            ...anterior,
            detalles: anterior.detalles.map((detalle, index) =>
                index === indice
                    ? { ...detalle, [campo]: valor }
                    : detalle
            )
        }));
    };

    const eliminarDetalle = (indice) => {
        setFormulario((anterior) => ({
            ...anterior,
            detalles: anterior.detalles.filter(
                (_, index) => index !== indice
            )
        }));
    };

    const obtenerProducto = (productoId) =>
        productos.find((producto) => producto.id === productoId);

    const calcularTotalVista = () =>
        formulario.detalles.reduce((total, detalle) => {
            const producto = obtenerProducto(detalle.productoServicioId);
            const cantidad = Number(detalle.cantidad) || 0;
            const precio = Number(producto?.precio) || 0;

            return total + precio * cantidad;
        }, 0);

    const guardarFactura = async (evento) => {
        evento.preventDefault();

        if (formulario.detalles.length === 0) {
            setError("The invoice must contain at least one item.");
            return;
        }

        if (formulario.detalles.some(
            (detalle) => !detalle.productoServicioId || Number(detalle.cantidad) <= 0
        )) {
            setError("Complete the product/service and quantity for every item.");
            return;
        }

        try {
            setError("");

            const datos = {
                ...formulario,
                proyectoId: formulario.proyectoId || null,
                detalles: formulario.detalles.map((detalle) => ({
                    ...detalle,
                    cantidad: Number(detalle.cantidad)
                }))
            };

            if (facturaEditando) {
                await actualizarFactura(facturaEditando.id, datos);
            } else {
                await crearFactura(datos);
            }

            setMostrarModal(false);
            await cargarDatos();
        } catch (err) {
            setError(err.message);
        }
    };

    const borrarFactura = async (factura) => {
        if (!window.confirm(`¿Deseas eliminar la factura ${factura.numero}?`)) {
            return;
        }

        try {
            setError("");
            await eliminarFactura(factura.id);
            await cargarDatos();
        } catch (err) {
            setError(err.message);
        }
    };

    const proyectosDelCliente = proyectos.filter(
        (proyecto) => proyecto.cliente?.id === formulario.clienteId
    );

    return (
        <>
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                <div>
                    <Breadcrumb className="d-none d-md-inline-block">
                        <Breadcrumb.Item href="#/dashboard/overview">
                            <FontAwesomeIcon icon={faHome} />
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active>Billing</Breadcrumb.Item>
                    </Breadcrumb>

                    <h2 className="h4">Billing</h2>
                    <p className="mb-0">
                        Create invoices from products and services sold to clients.
                    </p>
                </div>
                <Button
                    as={Link}
                    to={Routes.Pagos.path}
                    variant="outline-primary"
                    className="me-2"
                >
                    <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
                    Payments
                </Button>
                <Button variant="primary" onClick={abrirCrear}>
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    New invoice
                </Button>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <Card border="light" className="shadow-sm mb-4">
                <Card.Header>
                    <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" />
                    <strong>Registered invoices</strong>
                </Card.Header>

                <Card.Body className="p-0">
                    <Table responsive hover className="user-table align-items-center mb-0">
                        <thead>
                            <tr>
                                <th>Invoice</th>
                                <th>Client</th>
                                <th>Project</th>
                                <th>Issue date</th>
                                <th>Due date</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {cargando ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">
                                        Loading invoices...
                                    </td>
                                </tr>
                            ) : facturas.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">
                                        No invoices registered yet.
                                    </td>
                                </tr>
                            ) : (
                                facturas.map((factura) => (
                                    <tr key={factura.id}>
                                        <td className="fw-bold">{factura.numero}</td>
                                        <td>{factura.cliente?.razonSocial || "-"}</td>
                                        <td>{factura.proyecto?.nombre || "No project"}</td>
                                        <td>{factura.fechaEmision || "-"}</td>
                                        <td>{factura.fechaVencimiento || "-"}</td>
                                        <td>{formatearDinero(factura.total)}</td>
                                        <td>
                                            <Badge bg={colorEstado[factura.estado] || "secondary"}>
                                                {factura.estado}
                                            </Badge>
                                        </td>
                                        <td className="text-end">
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                className="me-2"
                                                onClick={() => abrirEditar(factura)}
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="outline-danger"
                                                onClick={() => borrarFactura(factura)}
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
                <Form onSubmit={guardarFactura}>
                    <Modal.Header>
                        <Modal.Title>
                            {facturaEditando ? "Edit invoice" : "New invoice"}
                        </Modal.Title>

                        <Button
                            variant="close"
                            onClick={() => setMostrarModal(false)}
                        />
                    </Modal.Header>

                    <Modal.Body>
                        <div className="row">
                            <Form.Group className="col-md-6 mb-3">
                                <Form.Label>Invoice number</Form.Label>
                                <Form.Control
                                    required
                                    name="numero"
                                    value={formulario.numero}
                                    onChange={cambiarCampo}
                                    placeholder="Example: FAC-001"
                                />
                            </Form.Group>

                            <Form.Group className="col-md-6 mb-3">
                                <Form.Label>Client</Form.Label>
                                <Form.Select
                                    required
                                    name="clienteId"
                                    value={formulario.clienteId}
                                    onChange={cambiarCampo}
                                >
                                    <option value="">Select a client</option>

                                    {clientes.map((cliente) => (
                                        <option key={cliente.id} value={cliente.id}>
                                            {cliente.razonSocial}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </div>

                        <div className="row">
                            <Form.Group className="col-md-4 mb-3">
                                <Form.Label>Project (optional)</Form.Label>
                                <Form.Select
                                    name="proyectoId"
                                    value={formulario.proyectoId}
                                    onChange={cambiarCampo}
                                    disabled={!formulario.clienteId}
                                >
                                    <option value="">No related project</option>

                                    {proyectosDelCliente.map((proyecto) => (
                                        <option key={proyecto.id} value={proyecto.id}>
                                            {proyecto.nombre}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="col-md-4 mb-3">
                                <Form.Label>Issue date</Form.Label>
                                <Form.Control
                                    required
                                    type="date"
                                    name="fechaEmision"
                                    value={formulario.fechaEmision}
                                    onChange={cambiarCampo}
                                />
                            </Form.Group>

                            <Form.Group className="col-md-4 mb-3">
                                <Form.Label>Due date</Form.Label>
                                <Form.Control
                                    required
                                    type="date"
                                    name="fechaVencimiento"
                                    value={formulario.fechaVencimiento}
                                    onChange={cambiarCampo}
                                />
                            </Form.Group>
                        </div>

                        <Form.Group className="mb-4">
                            <Form.Label>Invoice status</Form.Label>
                            <Form.Select
                                name="estado"
                                value={formulario.estado}
                                onChange={cambiarCampo}
                            >
                                <option value="BORRADOR">Draft</option>
                                <option value="EMITIDA">Issued</option>
                                <option value="ANULADA">Cancelled</option>
                            </Form.Select>
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Invoice items</h5>

                            <Button
                                type="button"
                                size="sm"
                                variant="outline-primary"
                                onClick={agregarDetalle}
                            >
                                <FontAwesomeIcon icon={faPlus} className="me-1" />
                                Add item
                            </Button>
                        </div>

                        {formulario.detalles.map((detalle, indice) => {
                            const producto = obtenerProducto(detalle.productoServicioId);
                            const subtotal =
                                (Number(producto?.precio) || 0)
                                * (Number(detalle.cantidad) || 0);

                            return (
                                <Card
                                    key={indice}
                                    border="light"
                                    className="bg-soft mb-3"
                                >
                                    <Card.Body>
                                        <div className="row align-items-end">
                                            <Form.Group className="col-md-5 mb-2">
                                                <Form.Label>Product or service</Form.Label>
                                                <Form.Select
                                                    required
                                                    value={detalle.productoServicioId}
                                                    onChange={(e) =>
                                                        cambiarDetalle(
                                                            indice,
                                                            "productoServicioId",
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="">Select an item</option>

                                                    {productos.map((productoItem) => (
                                                        <option
                                                            key={productoItem.id}
                                                            value={productoItem.id}
                                                        >
                                                            {productoItem.nombre} —{" "}
                                                            {formatearDinero(productoItem.precio)}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>

                                            <Form.Group className="col-md-2 mb-2">
                                                <Form.Label>Quantity</Form.Label>
                                                <Form.Control
                                                    required
                                                    min="1"
                                                    type="number"
                                                    value={detalle.cantidad}
                                                    onChange={(e) =>
                                                        cambiarDetalle(
                                                            indice,
                                                            "cantidad",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Form.Group>

                                            <Form.Group className="col-md-3 mb-2">
                                                <Form.Label>Description</Form.Label>
                                                <Form.Control
                                                    value={detalle.descripcion}
                                                    onChange={(e) =>
                                                        cambiarDetalle(
                                                            indice,
                                                            "descripcion",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Optional"
                                                />
                                            </Form.Group>

                                            <div className="col-md-1 mb-2">
                                                <small className="d-block text-gray">
                                                    Subtotal
                                                </small>
                                                <strong>{formatearDinero(subtotal)}</strong>
                                            </div>

                                            <div className="col-md-1 mb-2 text-end">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline-danger"
                                                    disabled={formulario.detalles.length === 1}
                                                    onClick={() => eliminarDetalle(indice)}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            );
                        })}

                        <div className="text-end mt-3">
                            <span className="text-gray me-2">Calculated total:</span>
                            <strong className="h5">
                                {formatearDinero(calcularTotalVista())}
                            </strong>
                        </div>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => setMostrarModal(false)}
                        >
                            Cancel
                        </Button>

                        <Button variant="primary" type="submit">
                            {facturaEditando ? "Save changes" : "Create invoice"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}