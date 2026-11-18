import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressBook,
  faEdit,
  faFileExcel,
  faHome,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import {
  Breadcrumb,
  Button,
  Card,
  Form,
  Modal,
  Table,
} from "@themesberg/react-bootstrap";

import { listarClientes } from "../../services/clienteApi";

import {
  actualizarContactoCliente,
  crearContactoCliente,
  eliminarContactoCliente,
  listarContactosClientes,
} from "../../services/contactoClienteApi";

import ImportarExcelModal from "../components/ImportarExcelModal";

const formularioInicial = {
  nombres: "",
  apellidos: "",
  cargo: "",
  email: "",
  telefono: "",
  clienteId: "",
};

export default function ClientContactsPage() {
  const [contactos, setContactos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [contactoEditando, setContactoEditando] = useState(null);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarImportacion, setMostrarImportacion] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const [datosContactos, datosClientes] = await Promise.all([
        listarContactosClientes(),
        listarClientes(),
      ]);

      setContactos(datosContactos);
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
    setContactoEditando(null);
    setFormulario(formularioInicial);
    setError("");
    setMostrarModal(true);
  };

  const abrirEditar = (contacto) => {
    setContactoEditando(contacto);

    setFormulario({
      nombres: contacto.nombres || "",
      apellidos: contacto.apellidos || "",
      cargo: contacto.cargo || "",
      email: contacto.email || "",
      telefono: contacto.telefono || "",
      clienteId: contacto.cliente?.id || "",
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

  const guardarContacto = async (evento) => {
    evento.preventDefault();

    try {
      setError("");

      if (contactoEditando) {
        await actualizarContactoCliente(contactoEditando.id, formulario);
      } else {
        await crearContactoCliente(formulario);
      }

      setMostrarModal(false);
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const borrarContacto = async (contacto) => {
    const confirmar = window.confirm(
      `Do you want to delete ${contacto.nombres} ${contacto.apellidos}?`,
    );

    if (!confirmar) return;

    try {
      setError("");
      await eliminarContactoCliente(contacto.id);
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  // Convert Excel rows to the contact API format
  const transformarContactoExcel = (fila) => {
    const nombres = String(fila.nombres || "").trim();
    const apellidos = String(fila.apellidos || "").trim();
    const cargo = String(fila.cargo || "").trim();
    const email = String(fila.email || "").trim();
    const telefono = String(fila.telefono || "").trim();
    const clienteNit = String(fila.clienteNit || "").trim();

    if (!nombres) {
      throw new Error("First name is required.");
    }

    if (!apellidos) {
      throw new Error("Last name is required.");
    }

    if (!clienteNit) {
      throw new Error("Client NIT is required.");
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email address.");
    }

    const clientesEncontrados = clientes.filter(
      (cliente) => String(cliente.nit ?? "").trim() === clienteNit,
    );

    if (clientesEncontrados.length === 0) {
      throw new Error(`No active client found with NIT "${clienteNit}".`);
    }

    if (clientesEncontrados.length > 1) {
      throw new Error(`Multiple clients found with NIT "${clienteNit}".`);
    }

    return {
      nombres,
      apellidos,
      cargo,
      email,
      telefono,
      clienteId: clientesEncontrados[0].id,
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

            <Breadcrumb.Item active>Client Contacts</Breadcrumb.Item>
          </Breadcrumb>

          <h2 className="h4">Client Contacts</h2>

          <p className="mb-0">
            Manage the people who represent each client company.
          </p>
        </div>

        <div className="d-flex flex-wrap" style={{ gap: "10px" }}>
          <Button variant="primary" onClick={abrirCrear}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            New contact
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

      {/* Contacts table */}
      <Card border="light" className="shadow-sm mb-4">
        <Card.Header>
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faAddressBook} className="me-2" />
            <h5 className="mb-0">Registered contacts</h5>
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
                <th>Contact</th>
                <th>Client</th>
                <th>Position</th>
                <th>Email</th>
                <th>Phone</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Loading contacts...
                  </td>
                </tr>
              ) : contactos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No contacts registered yet.
                  </td>
                </tr>
              ) : (
                contactos.map((contacto) => (
                  <tr key={contacto.id}>
                    <td className="fw-bold">
                      {contacto.nombres} {contacto.apellidos}
                    </td>

                    <td>{contacto.cliente?.razonSocial || "Not available"}</td>

                    <td>{contacto.cargo || "-"}</td>
                    <td>{contacto.email || "-"}</td>
                    <td>{contacto.telefono || "-"}</td>

                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => abrirEditar(contacto)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => borrarContacto(contacto)}
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
      >
        <Form onSubmit={guardarContacto}>
          <Modal.Header>
            <Modal.Title>
              {contactoEditando ? "Edit contact" : "New contact"}
            </Modal.Title>

            <Button
              variant="close"
              aria-label="Close"
              onClick={() => setMostrarModal(false)}
            />
          </Modal.Header>

          <Modal.Body>
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
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

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
              <Form.Label>Position</Form.Label>

              <Form.Control
                name="cargo"
                value={formulario.cargo}
                onChange={cambiarCampo}
                placeholder="Example: Technical Manager"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>

              <Form.Control
                type="email"
                name="email"
                value={formulario.email}
                onChange={cambiarCampo}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Phone</Form.Label>

              <Form.Control
                name="telefono"
                value={formulario.telefono}
                onChange={cambiarCampo}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setMostrarModal(false)}>
              Cancel
            </Button>

            <Button variant="primary" type="submit">
              {contactoEditando ? "Save changes" : "Create contact"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Excel import modal */}
      <ImportarExcelModal
        show={mostrarImportacion}
        onHide={() => setMostrarImportacion(false)}
        campos={[
          "nombres",
          "apellidos",
          "cargo",
          "email",
          "telefono",
          "clienteId",
        ]}
        transformarFila={transformarContactoExcel}
        onSave={crearContactoCliente}
        onSaved={async () => {
          await cargarDatos();
        }}
        mapeoColumnas={{
          nombres: ["First Name", "Nombre", "Nombres", "Names"],
          apellidos: ["Last Name", "Apellido", "Apellidos", "Surnames"],
          cargo: ["Position", "Cargo", "Job title"],
          email: ["Email", "Correo", "Correo electrónico"],
          telefono: ["Phone", "Teléfono", "Telefono", "Mobile"],
          clienteNit: [
            "Client NIT",
            "NIT cliente",
            "NIT del cliente",
            "Client tax ID"
          ]
        }}
      />
    </>
  );
}