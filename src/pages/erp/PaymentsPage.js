import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faMoneyBillWave,
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

import { listarFacturas } from "../../services/facturaApi";
import {
  crearPago,
  eliminarPago,
  listarPagosPorFactura
} from "../../services/pagoApi";

const fechaActual = () => new Date().toISOString().slice(0, 10);

const formularioInicial = {
  facturaId: "",
  fechaPago: fechaActual(),
  monto: "",
  medioPago: "Transferencia bancaria",
  referencia: ""
};

const formatearDinero = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(valor || 0);

export default function PaymentsPage() {
  const [facturas, setFacturas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState("");
  const [formulario, setFormulario] = useState(formularioInicial);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarFacturas = async () => {
    try {
      setCargando(true);
      setError("");

      const datos = await listarFacturas();

      // Solo se pueden recibir pagos de facturas emitidas o vencidas.
      setFacturas(
        datos.filter((factura) =>
          ["EMITIDA", "VENCIDA"].includes(factura.estado)
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const cargarPagos = async (facturaId) => {
    if (!facturaId) {
      setPagos([]);
      return;
    }

    try {
      setError("");
      setPagos(await listarPagosPorFactura(facturaId));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargarFacturas();
  }, []);

  const cambiarFactura = async (evento) => {
    const facturaId = evento.target.value;

    setFacturaSeleccionada(facturaId);
    await cargarPagos(facturaId);
  };

  const facturaActual = facturas.find(
    (factura) => factura.id === facturaSeleccionada
  );

  const totalPagado = pagos.reduce(
    (total, pago) => total + Number(pago.monto || 0),
    0
  );

  const saldo = Math.max(
    0,
    Number(facturaActual?.total || 0) - totalPagado
  );

  const abrirRegistrarPago = () => {
    if (!facturaSeleccionada) {
      setError("Select an invoice first.");
      return;
    }

    setFormulario({
      ...formularioInicial,
      facturaId: facturaSeleccionada
    });

    setError("");
    setMostrarModal(true);
  };

  const guardarPago = async (evento) => {
    evento.preventDefault();

    try {
      setError("");

      await crearPago({
        ...formulario,
        monto: Number(formulario.monto)
      });

      setMostrarModal(false);

      await cargarPagos(facturaSeleccionada);
      await cargarFacturas();
    } catch (err) {
      setError(err.message);
    }
  };

  const borrarPago = async (pago) => {
    if (!window.confirm(`¿Deseas eliminar el pago de ${formatearDinero(pago.monto)}?`)) {
      return;
    }

    try {
      setError("");

      await eliminarPago(pago.id);

      await cargarPagos(facturaSeleccionada);
      await cargarFacturas();
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
            <Breadcrumb.Item active>Payments</Breadcrumb.Item>
          </Breadcrumb>

          <h2 className="h4">Payments</h2>
          <p className="mb-0">
            Register payments and review the outstanding balance of invoices.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={abrirRegistrarPago}
          disabled={!facturaSeleccionada || saldo <= 0}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Register payment
        </Button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <Card border="light" className="shadow-sm mb-4">
        <Card.Body>
          <Form.Group>
            <Form.Label>Select invoice</Form.Label>

            <Form.Select
              value={facturaSeleccionada}
              onChange={cambiarFactura}
              disabled={cargando}
            >
              <option value="">Select an invoice</option>

              {facturas.map((factura) => (
                <option key={factura.id} value={factura.id}>
                  {factura.numero} — {factura.cliente?.razonSocial} —{" "}
                  {formatearDinero(factura.total)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {facturaActual && (
            <div className="row mt-4">
              <div className="col-md-4">
                <small className="text-gray d-block">Invoice total</small>
                <strong>{formatearDinero(facturaActual.total)}</strong>
              </div>

              <div className="col-md-4">
                <small className="text-gray d-block">Total paid</small>
                <strong className="text-success">
                  {formatearDinero(totalPagado)}
                </strong>
              </div>

              <div className="col-md-4">
                <small className="text-gray d-block">Outstanding balance</small>
                <strong className={saldo > 0 ? "text-danger" : "text-success"}>
                  {formatearDinero(saldo)}
                </strong>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <Card border="light" className="shadow-sm">
        <Card.Header>
          <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
          <strong>Payment history</strong>
        </Card.Header>

        <Card.Body className="p-0">
          <Table responsive hover className="user-table align-items-center mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment method</th>
                <th>Reference</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {!facturaSeleccionada ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Select an invoice to view its payments.
                  </td>
                </tr>
              ) : pagos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No payments registered for this invoice.
                  </td>
                </tr>
              ) : (
                pagos.map((pago) => (
                  <tr key={pago.id}>
                    <td>{pago.fechaPago || "-"}</td>
                    <td className="fw-bold text-success">
                      {formatearDinero(pago.monto)}
                    </td>
                    <td>
                      <Badge bg="primary">
                        {pago.medioPago || "Not specified"}
                      </Badge>
                    </td>
                    <td>{pago.referencia || "-"}</td>
                    <td className="text-end">
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => borrarPago(pago)}
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
        <Form onSubmit={guardarPago}>
          <Modal.Header>
            <Modal.Title>Register payment</Modal.Title>
            <Button
              variant="close"
              onClick={() => setMostrarModal(false)}
            />
          </Modal.Header>

          <Modal.Body>
            <p className="mb-3">
              Available balance:{" "}
              <strong>{formatearDinero(saldo)}</strong>
            </p>

            <Form.Group className="mb-3">
              <Form.Label>Payment date</Form.Label>
              <Form.Control
                required
                type="date"
                value={formulario.fechaPago}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    fechaPago: e.target.value
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount (COP)</Form.Label>
              <Form.Control
                required
                min="1"
                max={saldo}
                type="number"
                value={formulario.monto}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    monto: e.target.value
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Payment method</Form.Label>
              <Form.Select
                value={formulario.medioPago}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    medioPago: e.target.value
                  })
                }
              >
                <option value="Transferencia bancaria">
                  Bank transfer
                </option>
                <option value="Efectivo">Cash</option>
                <option value="Tarjeta">Card</option>
                <option value="PSE">PSE</option>
                <option value="Otro">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Reference</Form.Label>
              <Form.Control
                value={formulario.referencia}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    referencia: e.target.value
                  })
                }
                placeholder="Example: TRX-45872"
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
              Save payment
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}