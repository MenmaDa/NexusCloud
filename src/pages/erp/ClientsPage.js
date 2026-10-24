import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
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

import {
  actualizarCliente,
  crearCliente,
  eliminarCliente,
  listarClientes
} from "../../services/clienteApi";

const clienteInicial = {
  razonSocial: "",
  nit: "",
  email: "",
  telefono: "",
  direccion: "",
  activo: true
};

export default function ClientsPage() {
  const [clientes, setClientes] = useState([]);
  const [cliente, setCliente] = useState(clienteInicial);
  const [editando, setEditando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    cargarClientes();
  }, []);

  async function cargarClientes() {
    try {
      setCargando(true);
      setError("");

      const datos = await listarClientes();
      setClientes(datos);
    } catch (err) {
      setError("Could not load clients.");
    } finally {
      setCargando(false);
    }
  }

  function abrirCrear() {
    setCliente(clienteInicial);
    setEditando(false);
    setError("");
    setMostrarModal(true);
  }

  function abrirEditar(clienteSeleccionado) {
    setCliente(clienteSeleccionado);
    setEditando(true);
    setError("");
    setMostrarModal(true);
  }

  function manejarCambio(evento) {
    const { name, value, type, checked } = evento.target;

    setCliente({
      ...cliente,
      [name]: type === "checkbox" ? checked : value
    });
  }

  async function guardarCliente(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setError("");

      if (editando) {
        await actualizarCliente(cliente.id, cliente);
        setMensaje("Client updated successfully.");
      } else {
        await crearCliente(cliente);
        setMensaje("Client created successfully.");
      }

      setMostrarModal(false);
      await cargarClientes();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function borrarCliente(id) {
    const confirmar = window.confirm(
      "Do you want to delete this client?"
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");
      await eliminarCliente(id);
      setMensaje("Client deleted successfully.");
      await cargarClientes();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div className="d-block mb-4 mb-md-0">
          <Breadcrumb
            className="d-none d-md-inline-block"
            listProps={{
              className: "breadcrumb-dark breadcrumb-transparent"
            }}
          >
            <Breadcrumb.Item>
              <FontAwesomeIcon icon={faHome} />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Nexus ERP</Breadcrumb.Item>
            <Breadcrumb.Item active>Clients</Breadcrumb.Item>
          </Breadcrumb>

          <h4>Clients</h4>
          <p className="mb-0">
            Manage company clients and their main contact information.
          </p>
        </div>

        <Button variant="primary" onClick={abrirCrear}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          New client
        </Button>
      </div>

      {mensaje && (
        <div className="alert alert-success" role="alert">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <Card border="light" className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Client list</h5>
        </Card.Header>

        <Card.Body className="p-0">
          <Table responsive className="table-centered table-nowrap rounded mb-0">
            <thead className="thead-light">
              <tr>
                <th>Company name</th>
                <th>NIT</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {cargando && (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Loading clients...
                  </td>
                </tr>
              )}

              {!cargando && clientes.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No clients registered yet.
                  </td>
                </tr>
              )}

              {!cargando &&
                clientes.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-normal">
                      {item.razonSocial}
                    </td>
                    <td>{item.nit}</td>
                    <td>{item.email}</td>
                    <td>{item.telefono}</td>
                    <td>{item.direccion}</td>
                    <td>
                      <Badge bg={item.activo ? "success" : "danger"}>
                        {item.activo ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => abrirEditar(item)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => borrarCliente(item.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                ))}
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
        <Form onSubmit={guardarCliente}>
          <Modal.Header>
            <Modal.Title>
              {editando ? "Edit client" : "New client"}
            </Modal.Title>

            <Button
              variant="close"
              aria-label="Close"
              onClick={() => setMostrarModal(false)}
            />
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Company name</Form.Label>
              <Form.Control
                required
                name="razonSocial"
                value={cliente.razonSocial}
                onChange={manejarCambio}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>NIT</Form.Label>
              <Form.Control
                required
                name="nit"
                value={cliente.nit}
                onChange={manejarCambio}
                placeholder="900123456-1"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                required
                type="email"
                name="email"
                value={cliente.email}
                onChange={manejarCambio}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                required
                name="telefono"
                value={cliente.telefono}
                onChange={manejarCambio}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                required
                name="direccion"
                value={cliente.direccion}
                onChange={manejarCambio}
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              name="activo"
              label="Active client"
              checked={cliente.activo}
              onChange={manejarCambio}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setMostrarModal(false)}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              type="submit"
              disabled={guardando}
            >
              {guardando ? "Saving..." : "Save client"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}