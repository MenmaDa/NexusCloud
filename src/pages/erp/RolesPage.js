import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faHome,
  faPlus,
  faTrash,
  faUserShield
} from "@fortawesome/free-solid-svg-icons";
import {
  Breadcrumb,
  Button,
  Card,
  Form,
  Modal,
  Table
} from "@themesberg/react-bootstrap";

import {
  actualizarRol,
  crearRol,
  eliminarRol,
  listarRoles
} from "../../services/rolApi";

const formularioInicial = {
  nombre: "",
  descripcion: ""
};

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [rolEditando, setRolEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [error, setError] = useState("");

  const cargarRoles = async () => {
    try {
      setError("");
      setRoles(await listarRoles());
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargarRoles();
  }, []);

  const abrirCrear = () => {
    setRolEditando(null);
    setFormulario(formularioInicial);
    setMostrarModal(true);
  };

  const abrirEditar = (rol) => {
    setRolEditando(rol);
    setFormulario({
      nombre: rol.nombre || "",
      descripcion: rol.descripcion || ""
    });
    setMostrarModal(true);
  };

  const guardarRol = async (evento) => {
    evento.preventDefault();

    try {
      setError("");

      if (rolEditando) {
        await actualizarRol(rolEditando.id, formulario);
      } else {
        await crearRol(formulario);
      }

      setMostrarModal(false);
      await cargarRoles();
    } catch (err) {
      setError(err.message);
    }
  };

  const borrarRol = async (rol) => {
    if (!window.confirm(`¿Deseas eliminar el rol ${rol.nombre}?`)) {
      return;
    }

    try {
      await eliminarRol(rol.id);
      await cargarRoles();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center py-4">
        <div>
          <Breadcrumb className="d-none d-md-inline-block">
            <Breadcrumb.Item href="#/dashboard/overview">
              <FontAwesomeIcon icon={faHome} />
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Roles</Breadcrumb.Item>
          </Breadcrumb>

          <h2 className="h4">Roles</h2>
          <p className="mb-0">
            Define permissions and responsibilities in the ERP.
          </p>
        </div>

        <Button variant="primary" onClick={abrirCrear}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          New role
        </Button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <Card border="light" className="shadow-sm">
        <Card.Header>
          <FontAwesomeIcon icon={faUserShield} className="me-2" />
          <strong>System roles</strong>
        </Card.Header>

        <Card.Body className="p-0">
          <Table responsive hover className="user-table align-items-center mb-0">
            <thead>
              <tr>
                <th>Role</th>
                <th>Description</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    No roles registered yet.
                  </td>
                </tr>
              ) : (
                roles.map((rol) => (
                  <tr key={rol.id}>
                    <td className="fw-bold">{rol.nombre}</td>
                    <td>{rol.descripcion || "-"}</td>
                    <td className="text-end">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => abrirEditar(rol)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => borrarRol(rol)}
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
        <Form onSubmit={guardarRol}>
          <Modal.Header>
            <Modal.Title>
              {rolEditando ? "Edit role" : "New role"}
            </Modal.Title>
            <Button
              variant="close"
              onClick={() => setMostrarModal(false)}
            />
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Role name</Form.Label>
              <Form.Control
                required
                name="nombre"
                value={formulario.nombre}
                onChange={(e) =>
                  setFormulario({ ...formulario, nombre: e.target.value })
                }
                placeholder="Example: TECNICO"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows="3"
                name="descripcion"
                value={formulario.descripcion}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    descripcion: e.target.value
                  })
                }
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
            <Button type="submit" variant="primary">
              Save role
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}