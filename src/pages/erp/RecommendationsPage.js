import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHome,
    faLightbulb,
    faSearch
} from "@fortawesome/free-solid-svg-icons";
import {
    Badge,
    Breadcrumb,
    Button,
    Card,
    Form,
    Spinner
} from "@themesberg/react-bootstrap";

import { listarClientes } from "../../services/clienteApi";
import { obtenerRecomendaciones } from "../../services/recomendacionApi";

const formatearDinero = (valor) =>
    new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(valor || 0);

export default function RecommendationsPage() {
    const [clientes, setClientes] = useState([]);
    const [clienteId, setClienteId] = useState("");
    const [presupuesto, setPresupuesto] = useState("");
    const [limite, setLimite] = useState(5);

    const [recomendaciones, setRecomendaciones] = useState([]);
    const [cargandoClientes, setCargandoClientes] = useState(true);
    const [cargandoRecomendaciones, setCargandoRecomendaciones] =
        useState(false);
    const [error, setError] = useState("");
    const [busquedaRealizada, setBusquedaRealizada] = useState(false);

    useEffect(() => {
        const cargarClientes = async () => {
            try {
                setCargandoClientes(true);

                const datos = await listarClientes();

                setClientes(
                    datos.filter((cliente) => cliente.activo !== false)
                );
            } catch (err) {
                setError(err.message);
            } finally {
                setCargandoClientes(false);
            }
        };

        cargarClientes();
    }, []);

    const buscarRecomendaciones = async (evento) => {
        evento.preventDefault();

        if (!clienteId) {
            setError("Select a client first.");
            return;
        }

        try {
            setError("");
            setCargandoRecomendaciones(true);
            setBusquedaRealizada(true);

            const datos = await obtenerRecomendaciones(
                clienteId,
                presupuesto || null,
                limite
            );

            setRecomendaciones(Array.isArray(datos) ? datos : []);
        } catch (err) {
            setRecomendaciones([]);
            setError(err.message);
        } finally {
            setCargandoRecomendaciones(false);
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
                        <Breadcrumb.Item active>
                            Recommendations
                        </Breadcrumb.Item>
                    </Breadcrumb>

                    <h2 className="h4">Product & Service Recommendations</h2>
                    <p className="mb-0">
                        Personalized suggestions based on purchase history,
                        stock, quality and budget.
                    </p>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <Card border="light" className="shadow-sm mb-4">
                <Card.Body>
                    <Form onSubmit={buscarRecomendaciones}>
                        <div className="row align-items-end">
                            <Form.Group className="col-md-5 mb-3">
                                <Form.Label>Client</Form.Label>
                                <Form.Select
                                    required
                                    value={clienteId}
                                    onChange={(event) =>
                                        setClienteId(event.target.value)
                                    }
                                    disabled={cargandoClientes}
                                >
                                    <option value="">
                                        {cargandoClientes
                                            ? "Loading clients..."
                                            : "Select a client"}
                                    </option>

                                    {clientes.map((cliente) => (
                                        <option
                                            key={cliente.id}
                                            value={cliente.id}
                                        >
                                            {cliente.razonSocial}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="col-md-3 mb-3">
                                <Form.Label>
                                    Maximum budget (optional)
                                </Form.Label>
                                <Form.Control
                                    min="0"
                                    type="number"
                                    value={presupuesto}
                                    onChange={(event) =>
                                        setPresupuesto(event.target.value)
                                    }
                                    placeholder="Example: 1500000"
                                />
                            </Form.Group>

                            <Form.Group className="col-md-2 mb-3">
                                <Form.Label>Results</Form.Label>
                                <Form.Select
                                    value={limite}
                                    onChange={(event) =>
                                        setLimite(Number(event.target.value))
                                    }
                                >
                                    <option value="3">3</option>
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                </Form.Select>
                            </Form.Group>

                            <div className="col-md-2 mb-3">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-100"
                                    disabled={
                                        cargandoClientes
                                        || cargandoRecomendaciones
                                    }
                                >
                                    {cargandoRecomendaciones ? (
                                        <>
                                            <Spinner
                                                animation="border"
                                                size="sm"
                                                className="me-2"
                                            />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon
                                                icon={faSearch}
                                                className="me-2"
                                            />
                                            Recommend
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {busquedaRealizada
                && !cargandoRecomendaciones
                && recomendaciones.length === 0
                && !error && (
                <Card border="light" className="shadow-sm">
                    <Card.Body className="text-center py-5">
                        <FontAwesomeIcon
                            icon={faLightbulb}
                            className="text-warning fa-2x mb-3"
                        />
                        <h5>No recommendations available</h5>
                        <p className="text-gray mb-0">
                            Register issued invoices and active catalog items
                            to generate suggestions.
                        </p>
                    </Card.Body>
                </Card>
            )}

            {recomendaciones.length > 0 && (
                <div className="row">
                    {recomendaciones.map((recomendacion) => {
                        const esReglaCompra =
                            Number(recomendacion.confianza) > 0;

                        return (
                            <div
                                className="col-md-6 col-xl-4 mb-4"
                                key={recomendacion.productoServicioId}
                            >
                                <Card border="light" className="shadow-sm h-100">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex justify-content-between mb-3">
                                            <Badge
                                                bg={
                                                    recomendacion.tipo === "SERVICIO"
                                                        ? "info"
                                                        : "primary"
                                                }
                                            >
                                                {recomendacion.tipo}
                                            </Badge>

                                            <Badge
                                                bg={
                                                    esReglaCompra
                                                        ? "success"
                                                        : "secondary"
                                                }
                                            >
                                                {esReglaCompra
                                                    ? `${Math.round(
                                                        recomendacion.confianza * 100
                                                    )}% match`
                                                    : "Quality / price"}
                                            </Badge>
                                        </div>

                                        <h5>{recomendacion.nombre}</h5>

                                        <p className="text-gray small">
                                            {recomendacion.categoria}
                                        </p>

                                        <p className="mb-3">
                                            {recomendacion.motivo}
                                        </p>

                                        <div className="mt-auto border-top pt-3">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-gray">
                                                    Price
                                                </span>
                                                <strong>
                                                    {formatearDinero(
                                                        recomendacion.precio
                                                    )}
                                                </strong>
                                            </div>

                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-gray">
                                                    Quality
                                                </span>
                                                <strong>
                                                    {recomendacion.puntuacionCalidad}/5
                                                </strong>
                                            </div>

                                            <div className="d-flex justify-content-between">
                                                <span className="text-gray">
                                                    Score
                                                </span>
                                                <strong className="text-primary">
                                                    {Number(
                                                        recomendacion.puntaje
                                                    ).toFixed(1)}
                                                </strong>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}