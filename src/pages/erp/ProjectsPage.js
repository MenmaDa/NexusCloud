import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faEdit,
  faFileExcel,
  faHome,
  faPlus,
  faProjectDiagram,
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

import { listarClientes } from "../../services/clienteApi";
import { listarContratos } from "../../services/contratoApi";

import {
  actualizarProyecto,
  crearProyecto,
  eliminarProyecto,
  listarProyectos,
} from "../../services/proyectoApi";

import ImportarExcelModal from "../components/ImportarExcelModal";

const formularioInicial = {
  nombre: "",
  descripcion: "",
  clienteId: "",
  contratoId: "",
  fechaInicio: "",
  fechaFinEstimada: "",
  estado: "PLANIFICADO",
  presupuesto: "",
};

const colorEstado = {
  PLANIFICADO: "primary",
  EN_PROGRESO: "warning",
  PAUSADO: "secondary",
  FINALIZADO: "success",
  CANCELADO: "danger",
};

const etiquetasEstado = {
  PLANIFICADO: "Planned",
  EN_PROGRESO: "In progress",
  PAUSADO: "Paused",
  FINALIZADO: "Completed",
  CANCELADO: "Cancelled",
};

const formatearDinero = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor || 0);

export default function ProjectsPage() {
  const [proyectos, setProyectos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [proyectoEditando, setProyectoEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarImportacion, setMostrarImportacion] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const [datosProyectos, datosClientes, datosContratos] = await Promise.all(
        [listarProyectos(), listarClientes(), listarContratos()],
      );

      setProyectos(datosProyectos);

      setClientes(datosClientes.filter((cliente) => cliente.activo !== false));

      setContratos(datosContratos);
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
    setProyectoEditando(null);
    setFormulario(formularioInicial);
    setError("");
    setMostrarModal(true);
  };

  const abrirEditar = (proyecto) => {
    setProyectoEditando(proyecto);

    setFormulario({
      nombre: proyecto.nombre || "",
      descripcion: proyecto.descripcion || "",
      clienteId: proyecto.cliente?.id || "",
      contratoId: proyecto.contrato?.id || "",
      fechaInicio: proyecto.fechaInicio || "",
      fechaFinEstimada: proyecto.fechaFinEstimada || "",
      estado: proyecto.estado || "PLANIFICADO",
      presupuesto: proyecto.presupuesto ?? "",
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
          contratoId: "",
        };
      }

      return {
        ...anterior,
        [name]: value,
      };
    });
  };

  const guardarProyecto = async (evento) => {
    evento.preventDefault();

    try {
      setError("");

      const datos = {
        ...formulario,
        contratoId: formulario.contratoId || null,
        presupuesto:
          formulario.presupuesto === "" ? null : Number(formulario.presupuesto),
      };

      if (proyectoEditando) {
        await actualizarProyecto(proyectoEditando.id, datos);
      } else {
        await crearProyecto(datos);
      }

      setMostrarModal(false);
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const borrarProyecto = async (proyecto) => {
    const confirmar = window.confirm(
      `Do you want to delete the project "${proyecto.nombre}"?`,
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");
      await eliminarProyecto(proyecto.id);
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  // Validate dates using YYYY-MM-DD.
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

  // Convert formatted spreadsheet numbers to numeric values.
  const convertirPresupuesto = (valorOriginal) => {
    const texto = String(valorOriginal ?? "")
      .trim()
      .replace(/\s/g, "")
      .replace(/COP/gi, "");

    if (texto === "") {
      return null;
    }

    let numeroTexto = texto;

    // Colombian thousands: 5.000.000
    if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(texto)) {
      numeroTexto = texto.replace(/\./g, "").replace(",", ".");
    }
    // English thousands: 5,000,000
    else if (/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(texto)) {
      numeroTexto = texto.replace(/,/g, "");
    }
    // Decimal comma: 5000000,50
    else if (/^\d+,\d{1,2}$/.test(texto)) {
      numeroTexto = texto.replace(",", ".");
    }

    const numero = Number(numeroTexto);

    if (!Number.isFinite(numero) || numero < 0) {
      throw new Error(
        `Invalid budget: "${valorOriginal}". Enter a non-negative number.`,
      );
    }

    return numero;
  };

  // Transform Excel rows into the project API format.
  const transformarProyectoExcel = (fila) => {
    const nombre = String(fila.nombre || "").trim();
    const descripcion = String(fila.descripcion || "").trim();
    const clienteNit = String(fila.clienteNit || "").trim();
    const contratoNumero = String(fila.contratoNumero || "").trim();
    const fechaInicio = String(fila.fechaInicio || "").trim();
    const fechaFinEstimada = String(fila.fechaFinEstimada || "").trim();
    const presupuesto = convertirPresupuesto(fila.presupuesto);

    const estadoTexto = String(fila.estado || "Planned")

    if (!nombre) {
      throw new Error("Project name is required.");
    }

    if (!clienteNit) {
      throw new Error("Client NIT is required.");
    }

    // Only active clients are available.
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

    const clienteSeleccionado = clientesEncontrados[0];

    let contratoId = null;

    // A contract is optional, but must belong to the client.
    if (contratoNumero) {
      const contratosEncontrados = contratos.filter(
        (contrato) => String(contrato.numero ?? "").trim() === contratoNumero,
      );

      if (contratosEncontrados.length === 0) {
        throw new Error(`Contract "${contratoNumero}" was not found.`);
      }

      if (contratosEncontrados.length > 1) {
        throw new Error(
          `Multiple contracts found with number "${contratoNumero}".`,
        );
      }

      const contratoSeleccionado = contratosEncontrados[0];

      if (contratoSeleccionado.cliente?.id !== clienteSeleccionado.id) {
        throw new Error(
          `Contract "${contratoNumero}" does not belong to the selected client.`,
        );
      }

      contratoId = contratoSeleccionado.id;
    }

    if (fechaInicio && !fechaValida(fechaInicio)) {
      throw new Error("Start Date must use the YYYY-MM-DD format.");
    }

    if (fechaFinEstimada && !fechaValida(fechaFinEstimada)) {
      throw new Error("Estimated End Date must use the YYYY-MM-DD format.");
    }

    if (fechaInicio && fechaFinEstimada && fechaFinEstimada < fechaInicio) {
      throw new Error("Estimated End Date cannot be earlier than Start Date.");
    }

    const estadosValidos = {
      PLANNED: "PLANIFICADO",
      PLANIFICADO: "PLANIFICADO",
      IN_PROGRESS: "EN_PROGRESO",
      EN_PROGRESO: "EN_PROGRESO",
      PAUSED: "PAUSADO",
      PAUSADO: "PAUSADO",
      COMPLETED: "FINALIZADO",
      FINALIZADO: "FINALIZADO",
      CANCELLED: "CANCELADO",
      CANCELED: "CANCELADO",
      CANCELADO: "CANCELADO",
    };

    const estado = estadosValidos[estadoTexto];

    if (!estado) {
      throw new Error(
        "Status must be Planned, In Progress, Paused, Completed, or Cancelled.",
      );
    }

    return {
      nombre,
      descripcion,
      clienteId: clienteSeleccionado.id,
      contratoId,
      fechaInicio: fechaInicio || null,
      fechaFinEstimada: fechaFinEstimada || null,
      estado,
      presupuesto,
    };
  };

  const contratosDelCliente = contratos.filter(
    (contrato) => contrato.cliente?.id === formulario.clienteId,
  );

  return (
    <>
      {/* Page header */}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div>
          <Breadcrumb className="d-none d-md-inline-block">
            <Breadcrumb.Item href="#/dashboard/overview">
              <FontAwesomeIcon icon={faHome} />
            </Breadcrumb.Item>

            <Breadcrumb.Item active>Projects</Breadcrumb.Item>
          </Breadcrumb>

          <h2 className="h4">Projects</h2>

          <p className="mb-0">
            Plan and track projects associated with clients and contracts.
          </p>
        </div>

        <div className="d-flex flex-wrap" style={{ gap: "10px" }}>
          <Button variant="primary" onClick={abrirCrear}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            New project
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

      {/* Projects table */}
      <Card border="light" className="shadow-sm mb-4">
        <Card.Header>
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faProjectDiagram} className="me-2" />

            <h5 className="mb-0">Registered projects</h5>
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
                <th>Project</th>
                <th>Client</th>
                <th>Contract</th>
                <th>Start date</th>
                <th>Estimated end</th>
                <th>Budget</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    Loading projects...
                  </td>
                </tr>
              ) : proyectos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No projects registered yet.
                  </td>
                </tr>
              ) : (
                proyectos.map((proyecto) => (
                  <tr key={proyecto.id}>
                    <td className="fw-bold">{proyecto.nombre}</td>

                    <td>{proyecto.cliente?.razonSocial || "Not available"}</td>

                    <td>{proyecto.contrato?.numero || "No contract"}</td>

                    <td>{proyecto.fechaInicio || "-"}</td>

                    <td>{proyecto.fechaFinEstimada || "-"}</td>

                    <td>{formatearDinero(proyecto.presupuesto)}</td>

                    <td>
                      <Badge bg={colorEstado[proyecto.estado] || "secondary"}>
                        {etiquetasEstado[proyecto.estado] || proyecto.estado}
                      </Badge>
                    </td>

                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => abrirEditar(proyecto)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => borrarProyecto(proyecto)}
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

      {/* Manual registration modal */}
      <Modal
        as={Modal.Dialog}
        centered
        size="lg"
        show={mostrarModal}
        onHide={() => setMostrarModal(false)}
      >
        <Form onSubmit={guardarProyecto}>
          <Modal.Header>
            <Modal.Title>
              {proyectoEditando ? "Edit project" : "New project"}
            </Modal.Title>

            <Button
              variant="close"
              aria-label="Close"
              onClick={() => setMostrarModal(false)}
            />
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Project name</Form.Label>

              <Form.Control
                required
                name="nombre"
                value={formulario.nombre}
                onChange={cambiarCampo}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>

              <Form.Control
                as="textarea"
                rows="3"
                name="descripcion"
                value={formulario.descripcion}
                onChange={cambiarCampo}
              />
            </Form.Group>

            <div className="row">
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

              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Contract (optional)</Form.Label>

                <Form.Select
                  name="contratoId"
                  value={formulario.contratoId}
                  onChange={cambiarCampo}
                  disabled={!formulario.clienteId}
                >
                  <option value="">No associated contract</option>

                  {contratosDelCliente.map((contrato) => (
                    <option key={contrato.id} value={contrato.id}>
                      {contrato.numero}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="row">
              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Start date</Form.Label>

                <Form.Control
                  type="date"
                  name="fechaInicio"
                  value={formulario.fechaInicio}
                  onChange={cambiarCampo}
                />
              </Form.Group>

              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Estimated end date</Form.Label>

                <Form.Control
                  type="date"
                  name="fechaFinEstimada"
                  value={formulario.fechaFinEstimada}
                  onChange={cambiarCampo}
                />
              </Form.Group>
            </div>

            <div className="row">
              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Budget (COP)</Form.Label>

                <Form.Control
                  min="0"
                  type="number"
                  name="presupuesto"
                  value={formulario.presupuesto}
                  onChange={cambiarCampo}
                  placeholder="5000000"
                />
              </Form.Group>

              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Status</Form.Label>

                <Form.Select
                  required
                  name="estado"
                  value={formulario.estado}
                  onChange={cambiarCampo}
                >
                  <option value="PLANIFICADO">Planned</option>

                  <option value="EN_PROGRESO">In progress</option>

                  <option value="PAUSADO">Paused</option>

                  <option value="FINALIZADO">Completed</option>

                  <option value="CANCELADO">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setMostrarModal(false)}>
              Cancel
            </Button>

            <Button variant="primary" type="submit">
              {proyectoEditando ? "Save changes" : "Create project"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Excel import modal */}
      <ImportarExcelModal
        show={mostrarImportacion}
        onHide={() => setMostrarImportacion(false)}
        campos={[
          "nombre",
          "descripcion",
          "clienteId",
          "contratoId",
          "fechaInicio",
          "fechaFinEstimada",
          "presupuesto",
          "estado",
        ]}
        transformarFila={transformarProyectoExcel}
        onSave={crearProyecto}
        onSaved={async () => {
          await cargarDatos();
        }}
        mapeoColumnas={{
          nombre: ["Project Name", "Nombre proyecto", "Nombre del proyecto"],
          descripcion: ["Description", "Descripción", "Descripcion"],
          clienteNit: ["Client NIT", "NIT cliente", "NIT del cliente"],
          contratoNumero: [
            "Contract Number",
            "Número de contrato",
            "Numero de contrato"
          ],
          fechaInicio: ["Start Date", "Fecha inicio", "Fecha de inicio"],
          fechaFinEstimada: [
            "Estimated End Date",
            "Fecha fin estimada",
            "Fecha estimada de finalización"
          ],
          presupuesto: ["Budget", "Presupuesto"],
          estado: ["Status", "Estado"]
        }}
      />
    </>
  );
}