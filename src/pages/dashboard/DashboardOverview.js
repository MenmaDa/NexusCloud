import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faCashRegister,
  faExclamationTriangle,
  faFileInvoiceDollar,
  faHome,
  faLightbulb,
  faPlus,
  faProjectDiagram,
  faTasks,
  faUsers,
  faWallet
} from "@fortawesome/free-solid-svg-icons";
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Col,
  Row,
  Spinner,
  ButtonGroup,
  Table
} from "@themesberg/react-bootstrap";

import {
  SalesValueWidget,
  SalesValueWidgetPhone
} from "../../components/Widgets";

import { Routes } from "../../routes";
import { obtenerResumenDashboard } from "../../services/dashboardApi";

const formatearDinero = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(valor || 0);

const colorEstadoFactura = {
  BORRADOR: "secondary",
  EMITIDA: "primary",
  PAGADA: "success",
  VENCIDA: "danger",
  ANULADA: "dark"
};

const Indicador = ({ titulo, valor, icono, color = "primary" }) => (
  <Card border="light" className="shadow-sm h-100">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <p className="text-gray mb-1">{titulo}</p>
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

export default function DashboardOverview() {
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [periodoGrafica, setPeriodoGrafica] = useState("mes");

  const cargarResumen = async () => {
    try {
      setCargando(true);
      setError("");

      const datos = await obtenerResumenDashboard();
      setResumen(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, []);

  if (cargando) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-gray">Loading ERP dashboard...</p>
      </div>
    );
  }
  const datosPeriodo = resumen
    ? (
      periodoGrafica === "mes"
        ? resumen.facturacionPorMes
        : resumen.facturacionPorSemana
    )
    : [];

  const datosGrafica = {
    labels: datosPeriodo.map((dato) => dato.etiqueta),
    datasets: [
      {
        label: "Invoiced value",
        data: datosPeriodo.map((dato) => Number(dato.total)),
        backgroundColor: "rgba(38, 43, 174, 0.55)",
        borderColor: "#262bae",
        borderWidth: 2
      }
    ]
  };

  const opcionesGrafica = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: false
    },
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            callback: (valor) =>
              new Intl.NumberFormat("es-CO", {
                notation: "compact",
                maximumFractionDigits: 1
              }).format(valor)
          }
        }
      ],
      xAxes: [
        {
          gridLines: {
            display: false
          }
        }
      ]
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
            <Breadcrumb.Item active>Dashboard</Breadcrumb.Item>
          </Breadcrumb>

          <h2 className="h4">Nexus ERP Overview</h2>
          <p className="mb-0">
            Real-time operational and financial summary.
          </p>
        </div>

        <div className="d-flex gap-2">
          <Button
            as={Link}
            to={Routes.Tareas.path}
            variant="outline-primary"
          >
            <FontAwesomeIcon icon={faTasks} className="me-2" />
            Tasks
          </Button>

          <Button
            as={Link}
            to={Routes.Facturas.path}
            variant="primary"
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            New invoice
          </Button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {resumen && (
        <>
          <Row>
            <Col xs={12} sm={6} xl={3} className="mb-4">
              <Indicador
                titulo="Active clients"
                valor={resumen.clientesActivos}
                icono={faUsers}
                color="primary"
              />
            </Col>

            <Col xs={12} sm={6} xl={3} className="mb-4">
              <Indicador
                titulo="Projects in progress"
                valor={resumen.proyectosEnProgreso}
                icono={faProjectDiagram}
                color="info"
              />
            </Col>

            <Col xs={12} sm={6} xl={3} className="mb-4">
              <Indicador
                titulo="Open tasks"
                valor={resumen.tareasPendientes}
                icono={faTasks}
                color="warning"
              />
            </Col>

            <Col xs={12} sm={6} xl={3} className="mb-4">
              <Indicador
                titulo="Blocked tasks"
                valor={resumen.tareasBloqueadas}
                icono={faExclamationTriangle}
                color="danger"
              />
            </Col>
          </Row>

          <Row>
            <Col xs={12} sm={6} xl={4} className="mb-4">
              <Indicador
                titulo="Total invoiced"
                valor={formatearDinero(
                  resumen.facturacionTotal
                )}
                icono={faFileInvoiceDollar}
                color="primary"
              />
            </Col>

            <Col xs={12} sm={6} xl={4} className="mb-4">
              <Indicador
                titulo="Payments received"
                valor={formatearDinero(
                  resumen.pagosRecibidos
                )}
                icono={faCashRegister}
                color="success"
              />
            </Col>

            <Col xs={12} sm={6} xl={4} className="mb-4">
              <Indicador
                titulo="Pending portfolio"
                valor={formatearDinero(
                  resumen.carteraPendiente
                )}
                icono={faWallet}
                color="warning"
              />
            </Col>
          </Row>

          <Row>
            <Col xs={12} xl={8} className="mb-4">
              <Card border="light" className="shadow-sm h-100">
                <Card.Header>
                  <strong>
                    <FontAwesomeIcon
                      icon={faFileInvoiceDollar}
                      className="me-2"
                    />
                    Recent invoices
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
                        <th>Invoice</th>
                        <th>Client</th>
                        <th>Issue date</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {resumen.facturasRecientes.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="text-center py-4"
                          >
                            No invoices registered yet.
                          </td>
                        </tr>
                      ) : (
                        resumen.facturasRecientes.map(
                          (factura) => (
                            <tr key={factura.numero}>
                              <td className="fw-bold">
                                {factura.numero}
                              </td>
                              <td>{factura.cliente}</td>
                              <td>
                                {factura.fechaEmision || "-"}
                              </td>
                              <td>
                                {formatearDinero(
                                  factura.total
                                )}
                              </td>
                              <td>
                                <Badge
                                  bg={
                                    colorEstadoFactura[
                                    factura.estado
                                    ] || "secondary"
                                  }
                                >
                                  {factura.estado}
                                </Badge>
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} xl={4} className="mb-4">
              <Card border="light" className="shadow-sm mb-4">
                <Card.Header>
                  <strong>
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="text-warning me-2"
                    />
                    Inventory alerts
                  </strong>
                </Card.Header>

                <Card.Body>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Low-stock products</span>
                    <Badge bg="warning" text="dark">
                      {resumen.cantidadProductosStockBajo}
                    </Badge>
                  </div>

                  {resumen.productosStockBajo.length === 0 ? (
                    <p className="text-gray mb-0">
                      There are no low-stock products.
                    </p>
                  ) : (
                    resumen.productosStockBajo.map(
                      (producto) => (
                        <div
                          key={producto.nombre}
                          className="d-flex justify-content-between border-top py-2"
                        >
                          <span>{producto.nombre}</span>
                          <Badge bg="danger">
                            {producto.stock} units
                          </Badge>
                        </div>
                      )
                    )
                  )}
                </Card.Body>
              </Card>

              <Card border="light" className="shadow-sm">
                <Card.Body>
                  <FontAwesomeIcon
                    icon={faLightbulb}
                    className="text-warning me-2"
                  />
                  <strong>Recommendation model</strong>

                  <p className="text-gray small mt-2 mb-3">
                    Generate personalized suggestions from
                    invoices, stock, quality and price.
                  </p>

                  <Button
                    as={Link}
                    to={Routes.Recomendaciones.path}
                    size="sm"
                    variant="outline-primary"
                  >
                    <FontAwesomeIcon
                      icon={faBoxOpen}
                      className="me-2"
                    />
                    Open recommendations
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xs={12} className="mb-4 d-none d-sm-block">
              <SalesValueWidget
                title="Invoicing trend"
                value={formatearDinero(resumen.facturacionTotal)}
                percentage={0}
                data={datosPeriodo}
                periodo={periodoGrafica}
                onCambiarPeriodo={setPeriodoGrafica}
              />
            </Col>

            <Col xs={12} className="mb-4 d-sm-none">
              <SalesValueWidgetPhone
                title="Invoicing trend"
                value={formatearDinero(resumen.facturacionTotal)}
                percentage={0}
                data={datosPeriodo}
                periodo={periodoGrafica}
                onCambiarPeriodo={setPeriodoGrafica}
              />
            </Col>
          </Row>
        </>
      )}
    </>
  );
}