import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBriefcase,
    faCashRegister,
    faChartLine,
    faFileInvoiceDollar,
    faHome,
    faProjectDiagram,
    faWallet
} from "@fortawesome/free-solid-svg-icons";
import {
    Badge,
    Breadcrumb,
    Button,
    Card,
    Col,
    Nav,
    Row,
    Spinner,
    Table
} from "@themesberg/react-bootstrap";

import {
    obtenerReporteCartera,
    obtenerReporteFinanciero,
    obtenerRentabilidadProyectos
} from "../../services/reporteApi";

const formatearDinero = (valor) =>
    new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(valor || 0);

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

export default function ReportsPage() {
    const [financiero, setFinanciero] = useState(null);
    const [cartera, setCartera] = useState([]);
    const [rentabilidad, setRentabilidad] = useState([]);
    const [pestana, setPestana] = useState("financiero");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const cargarReportes = async () => {
        try {
            setCargando(true);
            setError("");

            const [
                resumenFinanciero,
                reporteCartera,
                reporteRentabilidad
            ] = await Promise.all([
                obtenerReporteFinanciero(),
                obtenerReporteCartera(),
                obtenerRentabilidadProyectos()
            ]);

            setFinanciero(resumenFinanciero);
            setCartera(reporteCartera);
            setRentabilidad(reporteRentabilidad);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarReportes();
    }, []);

    const carteraVencida = cartera.filter((factura) => factura.vencida);
    const margenColor = (margen) =>
        Number(margen) < 0 ? "text-danger" : "text-success";

    if (cargando) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="text-gray mt-3">Loading reports...</p>
            </div>
        );
    }

    return (
        <>
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                <div>
                    <Breadcrumb className="d-none d-md-inline-block">
                        <Breadcrumb.Item href="#/dashboard/overview">
                            <FontAwesomeIcon icon={faHome} />
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active>Reports</Breadcrumb.Item>
                    </Breadcrumb>

                    <h2 className="h4">Management Reports</h2>
                    <p className="mb-0">
                        Financial performance, accounts receivable and project profitability.
                    </p>
                </div>

                <Button variant="outline-primary" onClick={cargarReportes}>
                    Refresh reports
                </Button>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {financiero && (
                <>
                    <Row>
                        <Col xs={12} sm={6} xl={3} className="mb-4">
                            <Indicador
                                titulo="Total invoiced"
                                valor={formatearDinero(financiero.facturado)}
                                icono={faFileInvoiceDollar}
                                color="primary"
                            />
                        </Col>

                        <Col xs={12} sm={6} xl={3} className="mb-4">
                            <Indicador
                                titulo="Payments received"
                                valor={formatearDinero(financiero.recibido)}
                                icono={faCashRegister}
                                color="success"
                            />
                        </Col>

                        <Col xs={12} sm={6} xl={3} className="mb-4">
                            <Indicador
                                titulo="Pending portfolio"
                                valor={formatearDinero(
                                    financiero.carteraPendiente
                                )}
                                icono={faWallet}
                                color="warning"
                            />
                        </Col>

                        <Col xs={12} sm={6} xl={3} className="mb-4">
                            <Indicador
                                titulo="Invoices with balance"
                                valor={financiero.facturasConSaldo}
                                icono={faChartLine}
                                color="danger"
                            />
                        </Col>
                    </Row>

                    <Card border="light" className="shadow-sm">
                        <Card.Header className="pb-0">
                            <Nav variant="tabs">
                                <Nav.Item>
                                    <Nav.Link
                                        active={pestana === "financiero"}
                                        onClick={() => setPestana("financiero")}
                                        role="button"
                                    >
                                        Financial Summary
                                    </Nav.Link>
                                </Nav.Item>

                                <Nav.Item>
                                    <Nav.Link
                                        active={pestana === "cartera"}
                                        onClick={() => setPestana("cartera")}
                                        role="button"
                                    >
                                        Accounts Receivable
                                        {carteraVencida.length > 0 && (
                                            <Badge bg="danger" className="ms-2">
                                                {carteraVencida.length}
                                            </Badge>
                                        )}
                                    </Nav.Link>
                                </Nav.Item>

                                <Nav.Item>
                                    <Nav.Link
                                        active={pestana === "rentabilidad"}
                                        onClick={() => setPestana("rentabilidad")}
                                        role="button"
                                    >
                                        Project Profitability
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Card.Header>

                        <Card.Body className={pestana === "financiero" ? "" : "p-0"}>
                            {pestana === "financiero" && (
                                <Row className="align-items-center">
                                    <Col md={7}>
                                        <h5>
                                            <FontAwesomeIcon
                                                icon={faChartLine}
                                                className="text-primary me-2"
                                            />
                                            Financial overview
                                        </h5>

                                        <p className="text-gray mb-3">
                                            These values are calculated from issued
                                            invoices and registered payments.
                                        </p>

                                        <div className="d-flex justify-content-between border-top py-2">
                                            <span>Issued invoices</span>
                                            <strong>
                                                {financiero.facturasEmitidas}
                                            </strong>
                                        </div>

                                        <div className="d-flex justify-content-between border-top py-2">
                                            <span>Invoices with pending balance</span>
                                            <strong className="text-warning">
                                                {financiero.facturasConSaldo}
                                            </strong>
                                        </div>

                                        <div className="d-flex justify-content-between border-top py-2">
                                            <span>Overdue invoices</span>
                                            <strong className="text-danger">
                                                {carteraVencida.length}
                                            </strong>
                                        </div>
                                    </Col>

                                    <Col md={5}>
                                        <Card
                                            border="light"
                                            className="bg-soft p-3 text-center"
                                        >
                                            <FontAwesomeIcon
                                                icon={faWallet}
                                                className="fa-2x text-warning mb-3"
                                            />
                                            <small className="text-gray">
                                                Collection priority
                                            </small>
                                            <h4 className="mb-1">
                                                {formatearDinero(
                                                    carteraVencida.reduce(
                                                        (total, factura) =>
                                                            total
                                                            + Number(
                                                                factura.saldoPendiente
                                                            ),
                                                        0
                                                    )
                                                )}
                                            </h4>
                                            <small>Overdue portfolio</small>
                                        </Card>
                                    </Col>
                                </Row>
                            )}

                            {pestana === "cartera" && (
                                <Table
                                    responsive
                                    hover
                                    className="user-table align-items-center mb-0"
                                >
                                    <thead>
                                        <tr>
                                            <th>Invoice</th>
                                            <th>Client</th>
                                            <th>Issue date</th>
                                            <th>Due date</th>
                                            <th>Total</th>
                                            <th>Paid</th>
                                            <th>Balance</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {cartera.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="8"
                                                    className="text-center py-4"
                                                >
                                                    There are no invoices with
                                                    outstanding balances.
                                                </td>
                                            </tr>
                                        ) : (
                                            cartera.map((factura) => (
                                                <tr key={factura.facturaId}>
                                                    <td className="fw-bold">
                                                        {factura.numeroFactura}
                                                    </td>
                                                    <td>{factura.cliente}</td>
                                                    <td>
                                                        {factura.fechaEmision || "-"}
                                                    </td>
                                                    <td>
                                                        {factura.fechaVencimiento || "-"}
                                                    </td>
                                                    <td>
                                                        {formatearDinero(
                                                            factura.totalFactura
                                                        )}
                                                    </td>
                                                    <td>
                                                        {formatearDinero(
                                                            factura.pagosRecibidos
                                                        )}
                                                    </td>
                                                    <td className="fw-bold">
                                                        {formatearDinero(
                                                            factura.saldoPendiente
                                                        )}
                                                    </td>
                                                    <td>
                                                        <Badge
                                                            bg={
                                                                factura.vencida
                                                                    ? "danger"
                                                                    : "warning"
                                                            }
                                                        >
                                                            {factura.vencida
                                                                ? "OVERDUE"
                                                                : "PENDING"}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            )}

                            {pestana === "rentabilidad" && (
                                <Table
                                    responsive
                                    hover
                                    className="user-table align-items-center mb-0"
                                >
                                    <thead>
                                        <tr>
                                            <th>Project</th>
                                            <th>Client</th>
                                            <th>Budget</th>
                                            <th>Invoiced</th>
                                            <th>Labor cost</th>
                                            <th>Actual hours</th>
                                            <th>Margin</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {rentabilidad.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="7"
                                                    className="text-center py-4"
                                                >
                                                    No projects are available for
                                                    profitability analysis.
                                                </td>
                                            </tr>
                                        ) : (
                                            rentabilidad.map((proyecto) => (
                                                <tr key={proyecto.proyectoId}>
                                                    <td className="fw-bold">
                                                        <FontAwesomeIcon
                                                            icon={faProjectDiagram}
                                                            className="text-primary me-2"
                                                        />
                                                        {proyecto.proyecto}
                                                    </td>
                                                    <td>{proyecto.cliente}</td>
                                                    <td>
                                                        {formatearDinero(
                                                            proyecto.presupuesto
                                                        )}
                                                    </td>
                                                    <td>
                                                        {formatearDinero(
                                                            proyecto.facturado
                                                        )}
                                                    </td>
                                                    <td>
                                                        {formatearDinero(
                                                            proyecto.costoManoObra
                                                        )}
                                                    </td>
                                                    <td>
                                                        <FontAwesomeIcon
                                                            icon={faBriefcase}
                                                            className="text-gray me-2"
                                                        />
                                                        {proyecto.horasReales || 0}
                                                    </td>
                                                    <td
                                                        className={`fw-bold ${margenColor(
                                                            proyecto.margen
                                                        )}`}
                                                    >
                                                        {formatearDinero(
                                                            proyecto.margen
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </>
            )}
        </>
    );
}