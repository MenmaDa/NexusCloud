import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faEdit,
  faFileContract,
  faFileExcel,
  faHome,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Form,
  Modal,
  Table,
} from "@themesberg/react-bootstrap";

import {
  actualizarContrato,
  crearContrato,
  eliminarContrato,
  listarContratos,
} from "../../services/contratoApi";

import { listarClientes } from "../../services/clienteApi";
import ImportarExcelModal from "../components/ImportarExcelModal";

const formularioInicial = {
  numero: "",
  clienteId: "",
  fechaInicio: "",
  fechaFin: "",
  valor: "",
  estado: "BORRADOR",
};

const colorEstado = {
  BORRADOR: "warning",
  VIGENTE: "success",
  FINALIZADO: "primary",
  CANCELADO: "danger",
};

const etiquetasEstado = {
  BORRADOR: "Draft",
  VIGENTE: "Active",
  FINALIZADO: "Completed",
  CANCELADO: "Cancelled",
};

const formatearDinero = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor || 0);

export default function ContractsPage() {
  const [contratos, setContratos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [contratoEditando, setContratoEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarImportacion, setMostrarImportacion] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const [datosContratos, datosClientes] = await Promise.all([
        listarContratos(),
        listarClientes(),
      ]);

      setContratos(datosContratos);
      setClientes(datosClientes.filter((cliente) => cliente.activo !== false));
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
    setContratoEditando(null);
    setFormulario(formularioInicial);
    setError("");
    setMostrarModal(true);
  };

  const abrirEditar = (contrato) => {
    setContratoEditando(contrato);

    setFormulario({
      numero: contrato.numero || "",
      clienteId: contrato.cliente?.id || "",
      fechaInicio: contrato.fechaInicio || "",
      fechaFin: contrato.fechaFin || "",
      valor: contrato.valor ?? "",
      estado: contrato.estado || "BORRADOR",
    });

    setError("");
    setMostrarModal(true);
  };

  const cambiarCampo = (evento) => {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const guardarContrato = async (evento) => {
    evento.preventDefault();

    try {
      setError("");

      const datos = {
        ...formulario,
        valor: Number(formulario.valor),
      };

      if (contratoEditando) {
        await actualizarContrato(contratoEditando.id, datos);
      } else {
        await crearContrato(datos);
      }

      setMostrarModal(false);
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const borrarContrato = async (contrato) => {
    const confirmar = window.confirm(
      `Do you want to delete contract "${contrato.numero}"?`,
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");
      await eliminarContrato(contrato.id);
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  // Transform an Excel row into the existing contract API format
  const transformarContratoExcel = (fila) => {
    const numero = String(fila.numero || "").trim();
    const clienteNit = String(fila.clienteNit || "").trim();
    const fechaInicio = String(fila.fechaInicio || "").trim();
    const fechaFin = String(fila.fechaFin || "").trim();
    const valorTexto = String(fila.valor || "").trim();

    const estadoTexto = String(fila.estado || "DRAFT")

    if (!numero) {
      throw new Error("Contract number is required.");
    }

    if (!clienteNit) {
      throw new Error("Client NIT is required.");
    }

    const clientesEncontrados = clientes.filter(
      (cliente) => String(cliente.nit ?? "").trim() === clienteNit,
    );

    if (clientesEncontrados.length === 0) {
      throw new Error(`No active client found with NIT "${clienteNit}".`);
    }

    if (clientesEncontrados.length > 1) {
      throw new Error(
        `Multiple active clients found with NIT "${clienteNit}".`,
      );
    }

    const fechaValida = (fecha) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return false;
      }

      const fechaObjeto = new Date(`${fecha}T00:00:00Z`);

      return (
        !Number.isNaN(fechaObjeto.getTime()) &&
        fechaObjeto.toISOString().slice(0, 10) === fecha
      );
    };

    if (!fechaValida(fechaInicio)) {
      throw new Error("Start Date must use the YYYY-MM-DD format.");
    }

    if (!fechaValida(fechaFin)) {
      throw new Error("End Date must use the YYYY-MM-DD format.");
    }

    if (fechaFin < fechaInicio) {
      throw new Error("End Date cannot be earlier than Start Date.");
    }

    const valorNormalizado = valorTexto.replace(/\s/g, "").replace(/COP/gi, "");

    let valorLimpio = valorNormalizado;

    if (/^\d{1,3}(\.\d{3})+$/.test(valorNormalizado)) {
      valorLimpio = valorNormalizado.replace(/\./g, "");
    } else if (/^\d{1,3}(,\d{3})+$/.test(valorNormalizado)) {
      valorLimpio = valorNormalizado.replace(/,/g, "");
    }

    const valor = Number(valorLimpio);

    if (valorTexto === "" || !Number.isFinite(valor) || valor < 0) {
      throw new Error(
        `Invalid contract value: "${valorTexto}". Enter a non-negative number.`,
      );
    }

    const estadosValidos = {
      DRAFT: "BORRADOR",
      ACTIVE: "VIGENTE",
      COMPLETED: "FINALIZADO",
      CANCELLED: "CANCELADO",
      BORRADOR: "BORRADOR",
      VIGENTE: "VIGENTE",
      FINALIZADO: "FINALIZADO",
      CANCELADO: "CANCELADO",
    };

    const estado = estadosValidos[estadoTexto];

    if (!estado) {
      throw new Error("Status must be Draft, Active, Completed, or Cancelled.");
    }

    return {
      numero,
      clienteId: clientesEncontrados[0].id,
      fechaInicio,
      fechaFin,
      valor,
      estado,
    };
  };

  return (
    <>
      {/* Page header */}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div>
          <Breadcrumb className="d-none d-md-inline-block">
            <Breadcrumb.Item href="#/dashboard/overview">
              <FontAwesomeIcon icon={faHome} />
            </Breadcrumb.Item>

            <Breadcrumb.Item active>Contracts</Breadcrumb.Item>
          </Breadcrumb>

          <h2 className="h4">Contracts</h2>

          <p className="mb-0">Register and track client service agreements.</p>
        </div>

        <div className="d-flex flex-wrap" style={{ gap: "10px" }}>
          <Button variant="primary" onClick={abrirCrear}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            New contract
          </Button>

          <Button
            variant="outline-primary"
            onClick={() => setMostrarImportacion(true)}
            disabled={cargando}
          >
            <FontAwesomeIcon icon={faFileExcel} className="me-2" />
            Import Excel
          </Button>
        </div>
      </div>

      {/* Error messages */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Contracts table */}
      <Card border="light" className="shadow-sm mb-4">
        <Card.Header>
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faFileContract} className="me-2" />

            <h5 className="mb-0">Registered contracts</h5>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <Table
            responsive
            hover
            className="user-table align-items-center mb-0"
          >
            <thead>
              <tr>
                <th>Number</th>
                <th>Client</th>
                <th>Start date</th>
                <th>End date</th>
                <th>Value</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Loading contracts...
                  </td>
                </tr>
              ) : contratos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No contracts registered yet.
                  </td>
                </tr>
              ) : (
                contratos.map((contrato) => (
                  <tr key={contrato.id}>
                    <td className="fw-bold">{contrato.numero}</td>

                    <td>{contrato.cliente?.razonSocial || "Not available"}</td>

                    <td>{contrato.fechaInicio || "-"}</td>

                    <td>{contrato.fechaFin || "-"}</td>

                    <td>{formatearDinero(contrato.valor)}</td>

                    <td>
                      <Badge bg={colorEstado[contrato.estado] || "secondary"}>
                        {etiquetasEstado[contrato.estado] || contrato.estado}
                      </Badge>
                    </td>

                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => abrirEditar(contrato)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => borrarContrato(contrato)}
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

      {/* Manual contract modal */}
      <Modal
        as={Modal.Dialog}
        centered
        show={mostrarModal}
        onHide={() => setMostrarModal(false)}
      >
        <Form onSubmit={guardarContrato}>
          <Modal.Header>
            <Modal.Title>
              {contratoEditando ? "Edit contract" : "New contract"}
            </Modal.Title>

            <Button
              variant="close"
              aria-label="Close"
              onClick={() => setMostrarModal(false)}
            />
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Contract number</Form.Label>

              <Form.Control
                required
                name="numero"
                value={formulario.numero}
                onChange={cambiarCampo}
                placeholder="Example: CTR-001"
              />
            </Form.Group>

            <Form.Group className="mb-3">
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
                    {cliente.nit ? ` - ${cliente.nit}` : ""}
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
              <Form.Label>Contract value (COP)</Form.Label>

              <Form.Control
                required
                min="0"
                type="number"
                name="valor"
                value={formulario.valor}
                onChange={cambiarCampo}
                placeholder="2500000"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Status</Form.Label>

              <Form.Select
                required
                name="estado"
                value={formulario.estado}
                onChange={cambiarCampo}
              >
                <option value="BORRADOR">Draft</option>

                <option value="VIGENTE">Active</option>

                <option value="FINALIZADO">Completed</option>

                <option value="CANCELADO">Cancelled</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setMostrarModal(false)}>
              Cancel
            </Button>

            <Button variant="primary" type="submit">
              {contratoEditando ? "Save changes" : "Create contract"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Excel import modal */}
      <ImportarExcelModal
        show={mostrarImportacion}
        onHide={() => setMostrarImportacion(false)}
        campos={[
          "numero",
          "clienteId",
          "fechaInicio",
          "fechaFin",
          "valor",
          "estado",
        ]}
        transformarFila={transformarContratoExcel}
        onSave={crearContrato}
        onSaved={async () => {
          await cargarDatos();
        }}
        mapeoColumnas={{
          numero: ["Contract Number", "Número de contrato", "Numero de contrato"],
          clienteNit: ["Client NIT", "NIT cliente", "NIT del cliente"],
          fechaInicio: ["Start Date", "Fecha inicio", "Fecha de inicio"],
          fechaFin: ["End Date", "Fecha fin", "Fecha de finalización"],
          valor: ["Value", "Contract Value", "Valor", "Valor contrato"],
          estado: ["Status", "Estado"]
        }}
      />
    </>
  );
}