import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckSquare,
  faEdit,
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

import { listarProyectos } from "../../services/proyectoApi";
import { listarEmpleados } from "../../services/empleadoApi";

import {
  actualizarTarea,
  crearTarea,
  eliminarTarea,
  listarTareas,
} from "../../services/tareaApi";

import ImportarExcelModal from "../components/ImportarExcelModal";

const formularioInicial = {
  titulo: "",
  descripcion: "",
  proyectoId: "",
  responsableId: "",
  fechaLimite: "",
  horasEstimadas: "",
  horasReales: "",
  estado: "PENDIENTE",
};

const colorEstado = {
  PENDIENTE: "secondary",
  EN_PROGRESO: "warning",
  BLOQUEADA: "danger",
  TERMINADA: "success",
};

const etiquetasEstado = {
  PENDIENTE: "Pending",
  EN_PROGRESO: "In progress",
  BLOQUEADA: "Blocked",
  TERMINADA: "Completed",
};

export default function TasksPage() {
  const [tareas, setTareas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [tareaEditando, setTareaEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarImportacion, setMostrarImportacion] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const [datosTareas, datosProyectos, datosEmpleados] = await Promise.all([
        listarTareas(),
        listarProyectos(),
        listarEmpleados(),
      ]);

      setTareas(datosTareas);
      setProyectos(datosProyectos);

      setEmpleados(
        datosEmpleados.filter((empleado) => empleado.activo !== false),
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
    setTareaEditando(null);
    setFormulario(formularioInicial);
    setError("");
    setMostrarModal(true);
  };

  const abrirEditar = (tarea) => {
    setTareaEditando(tarea);

    setFormulario({
      titulo: tarea.titulo || "",
      descripcion: tarea.descripcion || "",
      proyectoId: tarea.proyecto?.id || "",
      responsableId: tarea.responsable?.id || "",
      fechaLimite: tarea.fechaLimite || "",
      horasEstimadas: tarea.horasEstimadas ?? "",
      horasReales: tarea.horasReales ?? "",
      estado: tarea.estado || "PENDIENTE",
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

  const guardarTarea = async (evento) => {
    evento.preventDefault();

    try {
      setError("");

      const datos = {
        ...formulario,
        responsableId: formulario.responsableId || null,
        horasEstimadas:
          formulario.horasEstimadas === ""
            ? null
            : Number(formulario.horasEstimadas),
        horasReales:
          formulario.horasReales === "" ? null : Number(formulario.horasReales),
      };

      if (tareaEditando) {
        await actualizarTarea(tareaEditando.id, datos);
      } else {
        await crearTarea(datos);
      }

      setMostrarModal(false);
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const borrarTarea = async (tarea) => {
    if (!window.confirm(`Do you want to delete the task "${tarea.titulo}"?`)) {
      return;
    }

    try {
      setError("");
      await eliminarTarea(tarea.id);
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  // Validate dates in YYYY-MM-DD format.
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

  // Validate optional non-negative integer values.
  const validarHoras = (valorOriginal, campo) => {
    const texto = String(valorOriginal ?? "").trim();

    if (texto === "") {
      return null;
    }

    if (!/^\d+$/.test(texto)) {
      throw new Error(`${campo} must be a non-negative whole number.`);
    }

    const numero = Number(texto);

    if (!Number.isSafeInteger(numero)) {
      throw new Error(`${campo} contains an invalid number.`);
    }

    return numero;
  };

  // Transform Excel rows into the existing task API format.
  const transformarTareaExcel = (fila) => {
    const titulo = String(fila.titulo || "").trim();
    const descripcion = String(fila.descripcion || "").trim();
    const nombreProyecto = String(fila.nombreProyecto || "").trim();

    const correoResponsable = String(fila.correoResponsable || "")
      .trim()
      .toLowerCase();

    const fechaLimite = String(fila.fechaLimite || "").trim();

    const horasEstimadas = validarHoras(
      fila.horasEstimadas,
      "Estimated Hours"
    );

    const horasReales = validarHoras(
      fila.horasReales,
      "Actual Hours"
    );

    const estadoTexto = String(fila.estado || "Pending")

    if (!titulo) {
      throw new Error("Task title is required.");
    }

    if (!nombreProyecto) {
      throw new Error("Project Name is required.");
    }

    const proyectosEncontrados = proyectos.filter(
      (proyecto) =>
        String(proyecto.nombre ?? "")
          .trim()
          .toLowerCase() === nombreProyecto.toLowerCase(),
    );

    if (proyectosEncontrados.length === 0) {
      throw new Error(`Project "${nombreProyecto}" was not found.`);
    }

    if (proyectosEncontrados.length > 1) {
      throw new Error(`Multiple projects found with name "${nombreProyecto}".`);
    }

    const proyectoId = proyectosEncontrados[0].id;

    let responsableId = null;

    if (correoResponsable) {
      const empleadosEncontrados = empleados.filter(
        (empleado) =>
          String(empleado.email ?? "")
            .trim()
            .toLowerCase() === correoResponsable,
      );

      if (empleadosEncontrados.length === 0) {
        throw new Error(
          `No active employee found with email "${correoResponsable}".`,
        );
      }

      if (empleadosEncontrados.length > 1) {
        throw new Error(
          `Multiple employees found with email "${correoResponsable}".`,
        );
      }

      responsableId = empleadosEncontrados[0].id;
    }

    if (fechaLimite && !fechaValida(fechaLimite)) {
      throw new Error("Due Date must use the YYYY-MM-DD format.");
    }

    const estadosValidos = {
      PENDING: "PENDIENTE",
      PENDIENTE: "PENDIENTE",
      IN_PROGRESS: "EN_PROGRESO",
      EN_PROGRESO: "EN_PROGRESO",
      BLOCKED: "BLOQUEADA",
      BLOQUEADA: "BLOQUEADA",
      COMPLETED: "TERMINADA",
      TERMINADA: "TERMINADA",
    };

    const estado = estadosValidos[estadoTexto];

    if (!estado) {
      throw new Error(
        "Status must be Pending, In Progress, Blocked, or Completed.",
      );
    }

    return {
      titulo,
      descripcion,
      proyectoId,
      responsableId,
      fechaLimite: fechaLimite || null,
      horasEstimadas,
      horasReales,
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

            <Breadcrumb.Item active>Tasks</Breadcrumb.Item>
          </Breadcrumb>

          <h2 className="h4">Tasks</h2>

          <p className="mb-0">
            Organize project activities and assign responsible employees.
          </p>
        </div>

        <div className="d-flex flex-wrap" style={{ gap: "10px" }}>
          <Button variant="primary" onClick={abrirCrear}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            New task
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

      {/* Tasks table */}
      <Card border="light" className="shadow-sm mb-4">
        <Card.Header>
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faCheckSquare} className="me-2" />
            <h5 className="mb-0">Registered tasks</h5>
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
                <th>Task</th>
                <th>Project</th>
                <th>Responsible</th>
                <th>Due date</th>
                <th>Estimated / Actual</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Loading tasks...
                  </td>
                </tr>
              ) : tareas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No tasks registered yet.
                  </td>
                </tr>
              ) : (
                tareas.map((tarea) => (
                  <tr key={tarea.id}>
                    <td>
                      <span className="fw-bold d-block">{tarea.titulo}</span>

                      <small className="text-gray">
                        {tarea.descripcion || "No description"}
                      </small>
                    </td>

                    <td>{tarea.proyecto?.nombre || "Not available"}</td>

                    <td>
                      {tarea.responsable
                        ? `${tarea.responsable.nombres} ${tarea.responsable.apellidos}`
                        : "Unassigned"}
                    </td>

                    <td>{tarea.fechaLimite || "-"}</td>

                    <td>
                      {tarea.horasEstimadas ?? 0} h / {tarea.horasReales ?? 0} h
                    </td>

                    <td>
                      <Badge bg={colorEstado[tarea.estado] || "secondary"}>
                        {etiquetasEstado[tarea.estado] || tarea.estado}
                      </Badge>
                    </td>

                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => abrirEditar(tarea)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => borrarTarea(tarea)}
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
        show={mostrarModal}
        onHide={() => setMostrarModal(false)}
        size="lg"
      >
        <Form onSubmit={guardarTarea}>
          <Modal.Header>
            <Modal.Title>
              {tareaEditando ? "Edit task" : "New task"}
            </Modal.Title>

            <Button
              variant="close"
              aria-label="Close"
              onClick={() => setMostrarModal(false)}
            />
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Task title</Form.Label>

              <Form.Control
                required
                name="titulo"
                value={formulario.titulo}
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
                <Form.Label>Project</Form.Label>

                <Form.Select
                  required
                  name="proyectoId"
                  value={formulario.proyectoId}
                  onChange={cambiarCampo}
                >
                  <option value="">Select a project</option>

                  {proyectos.map((proyecto) => (
                    <option key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Responsible employee (optional)</Form.Label>

                <Form.Select
                  name="responsableId"
                  value={formulario.responsableId}
                  onChange={cambiarCampo}
                >
                  <option value="">Unassigned</option>

                  {empleados.map((empleado) => (
                    <option key={empleado.id} value={empleado.id}>
                      {empleado.nombres} {empleado.apellidos}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="row">
              <Form.Group className="col-md-4 mb-3">
                <Form.Label>Due date</Form.Label>

                <Form.Control
                  type="date"
                  name="fechaLimite"
                  value={formulario.fechaLimite}
                  onChange={cambiarCampo}
                />
              </Form.Group>

              <Form.Group className="col-md-4 mb-3">
                <Form.Label>Estimated hours</Form.Label>

                <Form.Control
                  min="0"
                  type="number"
                  name="horasEstimadas"
                  value={formulario.horasEstimadas}
                  onChange={cambiarCampo}
                />
              </Form.Group>

              <Form.Group className="col-md-4 mb-3">
                <Form.Label>Actual hours</Form.Label>

                <Form.Control
                  min="0"
                  type="number"
                  name="horasReales"
                  value={formulario.horasReales}
                  onChange={cambiarCampo}
                />
              </Form.Group>
            </div>

            <Form.Group>
              <Form.Label>Status</Form.Label>

              <Form.Select
                required
                name="estado"
                value={formulario.estado}
                onChange={cambiarCampo}
              >
                <option value="PENDIENTE">Pending</option>
                <option value="EN_PROGRESO">In progress</option>
                <option value="BLOQUEADA">Blocked</option>
                <option value="TERMINADA">Completed</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setMostrarModal(false)}>
              Cancel
            </Button>

            <Button variant="primary" type="submit">
              {tareaEditando ? "Save changes" : "Create task"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Excel import modal */}
      <ImportarExcelModal
        show={mostrarImportacion}
        onHide={() => setMostrarImportacion(false)}
        campos={[
          "titulo",
          "descripcion",
          "proyectoId",
          "responsableId",
          "fechaLimite",
          "horasEstimadas",
          "horasReales",
          "estado",
        ]}
        transformarFila={transformarTareaExcel}
        onSave={crearTarea}
        onSaved={async () => {
          await cargarDatos();
        }}
        mapeoColumnas={{
          titulo: ["Task Title", "Título", "Titulo", "Nombre tarea"],
          descripcion: ["Description", "Descripción", "Descripcion"],
          nombreProyecto: [
            "Project Name",
            "Proyecto",
            "Nombre proyecto"
          ],
          correoResponsable: [
            "Responsible Email",
            "Correo responsable",
            "Email responsable"
          ],
          fechaLimite: ["Due Date", "Fecha límite", "Fecha limite"],
          horasEstimadas: [
            "Estimated Hours",
            "Horas estimadas"
          ],
          horasReales: ["Actual Hours", "Horas reales"],
          estado: ["Status", "Estado"]
        }}
      />
    </>
  );
}