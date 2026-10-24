import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faHome,
  faPlus,
  faTrash,
  faUserTie
} from "@fortawesome/free-solid-svg-icons";
import {
  Breadcrumb,
  Button,
  Card,
  Form,
  Modal,
  Table
} from "@themesberg/react-bootstrap";

import { listarSedes } from "../../services/sedeApi";
import {
  actualizarEmpleado,
  crearEmpleado,
  eliminarEmpleado,
  listarEmpleados
} from "../../services/empleadoApi";

const formularioInicial = {
  nombres: "",
  apellidos: "",
  email: "",
  cargo: "",
  costoHora: "",
  sedeId: ""
};

const formatearDinero = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(valor || 0);

export default function EmployeesPage() {
  const [empleados, setEmpleados] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [empleadoEditando, setEmpleadoEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const [datosEmpleados, datosSedes] = await Promise.all([
        listarEmpleados(),
        listarSedes()
      ]);

      setEmpleados(datosEmpleados);
      setSedes(datosSedes.filter((sede) => sede.activo !== false));
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
    setEmpleadoEditando(null);
    setFormulario(formularioInicial);
    setError("");
    setMostrarModal(true);
  };

  const abrirEditar = (empleado) => {
    setEmpleadoEditando(empleado);

    setFormulario({
      nombres: empleado.nombres || "",
      apellidos: empleado.apellidos || "",
      email: empleado.email || "",
      cargo: empleado.cargo || "",
      costoHora: empleado.costoHora ?? "",
      sedeId: empleado.sede?.id || ""
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

  const guardarEmpleado = async (evento) => {
    evento.preventDefault();

    try {
      setError("");

      const datos = {
        ...formulario,
        sedeId: formulario.sedeId || null,
        costoHora: formulario.costoHora === ""
          ? null
          : Number(formulario.costoHora)
      };

      if (empleadoEditando) {
        await actualizarEmpleado(empleadoEditando.id, datos);
      } else {
        await crearEmpleado(datos);
      }

      setMostrarModal(false);
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const borrarEmpleado = async (empleado) => {
    const nombreCompleto = `${empleado.nombres} ${empleado.apellidos}`;

    if (!window.confirm(`¿Deseas eliminar al empleado ${nombreCompleto}?`)) {
      return;
    }

    try {
      setError("");
      await eliminarEmpleado(empleado.id);
      await cargarDatos();
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
            <Breadcrumb.Item active>Employees</Breadcrumb.Item>
          </Breadcrumb>

          <h2 className="h4">Employees</h2>
          <p className="mb-0">
            Manage technical and administrative team members.
          </p>
        </div>

        <Button variant="primary" onClick={abrirCrear}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          New employee
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
            <FontAwesomeIcon icon={faUserTie} className="me-2" />
            <h5 className="mb-0">Registered employees</h5>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <Table responsive hover className="user-table align-items-center mb-0">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Email</th>
                <th>Position</th>
                <th>Branch</th>
                <th>Hourly cost</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Loading employees...
                  </td>
                </tr>
              ) : empleados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No employees registered yet.
                  </td>
                </tr>
              ) : (
                empleados.map((empleado) => (
                  <tr key={empleado.id}>
                    <td className="fw-bold">
                      {empleado.nombres} {empleado.apellidos}
                    </td>
                    <td>{empleado.email}</td>
                    <td>{empleado.cargo || "-"}</td>
                    <td>{empleado.sede?.nombre || "Unassigned"}</td>
                    <td>{formatearDinero(empleado.costoHora)}</td>
                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => abrirEditar(empleado)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => borrarEmpleado(empleado)}
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
        <Form onSubmit={guardarEmpleado}>
          <Modal.Header>
            <Modal.Title>
              {empleadoEditando ? "Edit employee" : "New employee"}
            </Modal.Title>

            <Button
              variant="close"
              aria-label="Close"
              onClick={() => setMostrarModal(false)}
            />
          </Modal.Header>

          <Modal.Body>
            <div className="row">
              <Form.Group className="col-md-6 mb-3">
                <Form.Label>First name</Form.Label>
                <Form.Control
                  required
                  name="nombres"
                  value={formulario.nombres}
                  onChange={cambiarCampo}
                />
              </Form.Group>

              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Last name</Form.Label>
                <Form.Control
                  required
                  name="apellidos"
                  value={formulario.apellidos}
                  onChange={cambiarCampo}
                />
              </Form.Group>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                required
                type="email"
                name="email"
                value={formulario.email}
                onChange={cambiarCampo}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Position</Form.Label>
              <Form.Control
                name="cargo"
                value={formulario.cargo}
                onChange={cambiarCampo}
                placeholder="Example: Network Technician"
              />
            </Form.Group>

            <div className="row">
              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Hourly cost (COP)</Form.Label>
                <Form.Control
                  min="0"
                  type="number"
                  name="costoHora"
                  value={formulario.costoHora}
                  onChange={cambiarCampo}
                  placeholder="30000"
                />
              </Form.Group>

              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Branch</Form.Label>
                <Form.Select
                  name="sedeId"
                  value={formulario.sedeId}
                  onChange={cambiarCampo}
                >
                  <option value="">Unassigned</option>

                  {sedes.map((sede) => (
                    <option key={sede.id} value={sede.id}>
                      {sede.nombre}
                    </option>
                  ))}
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
              {empleadoEditando ? "Save changes" : "Create employee"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}