import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faHome,
  faPlus,
  faProjectDiagram,
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
import { listarContratos } from "../../services/contratoApi";
import {
  actualizarProyecto,
  crearProyecto,
  eliminarProyecto,
  listarProyectos
} from "../../services/proyectoApi";

const formularioInicial = {
  nombre: "",
  descripcion: "",
  clienteId: "",
  contratoId: "",
  fechaInicio: "",
  fechaFinEstimada: "",
  estado: "PLANIFICADO",
  presupuesto: ""
};

const colorEstado = {
  PLANIFICADO: "primary",
  EN_PROGRESO: "warning",
  PAUSADO: "secondary",
  FINALIZADO: "success",
  CANCELADO: "danger"
};

const formatearDinero = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(valor || 0);

export default function ProjectsPage() {
  const [proyectos, setProyectos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [proyectoEditando, setProyectoEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const [datosProyectos, datosClientes, datosContratos] =
        await Promise.all([
          listarProyectos(),
          listarClientes(),
          listarContratos()
        ]);

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
      presupuesto: proyecto.presupuesto || ""
    });

    setError("");
    setMostrarModal(true);
  };

  const cambiarCampo = (evento) => {
    const { name, value } = evento.target;

    setFormulario((anterior) => {
      // Al cambiar de cliente, se elimina el contrato seleccionado,
      // porque pertenece al cliente anterior.
      if (name === "clienteId") {
        return {
          ...anterior,
          clienteId: value,
          contratoId: ""
        };
      }

      return {
        ...anterior,
        [name]: value
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
        presupuesto: formulario.presupuesto
          ? Number(formulario.presupuesto)
          : null
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
      `¿Deseas eliminar el proyecto "${proyecto.nombre}"?`
    );

    if (!confirmar) return;

    try {
      setError("");
      await eliminarProyecto(proyecto.id);
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const contratosDelCliente = contratos.filter(
    (contrato) => contrato.cliente?.id === formulario.clienteId
  );

  return (
    <>
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

        <Button variant="primary" onClick={abrirCrear}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          New project
        </Button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <Card border="light" className="shadow-sm mb-4">
        <Card.Header>
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faProjectDiagram} className="me-2" />
            <h5 className="mb-0">Registered projects</h5>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <Table responsive hover className="user-table align-items-center mb-0">
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
                        {proyecto.estado}
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

      <Modal
        as={Modal.Dialog}
        centered
        show={mostrarModal}
        onHide={() => setMostrarModal(false)}
        size="lg"
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
            <Button
              variant="secondary"
              onClick={() => setMostrarModal(false)}
            >
              Cancel
            </Button>

            <Button variant="primary" type="submit">
              {proyectoEditando ? "Save changes" : "Create project"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}