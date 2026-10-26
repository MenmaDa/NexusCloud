import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { subirFotoPerfil } from "../../services/archivoApi";
import {
  faEdit,
  faHome,
  faPlus,
  faTrash,
  faUserCog
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

import { listarEmpleados } from "../../services/empleadoApi";
import { listarRoles } from "../../services/rolApi";
import {
  actualizarUsuario,
  crearUsuario,
  eliminarUsuario,
  listarUsuarios
} from "../../services/usuarioApi";

const formularioInicial = {
  email: "",
  password: "",
  fotoPerfilUrl: "",
  habilitado: true,
  empleadoId: "",
  rolesIds: []
};

export default function UsersPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [roles, setRoles] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [error, setError] = useState("");
  const [archivoFoto, setArchivoFoto] = useState(null);

  const cargarDatos = async () => {
    try {
      setError("");

      const [datosUsuarios, datosEmpleados, datosRoles] =
        await Promise.all([
          listarUsuarios(),
          listarEmpleados(),
          listarRoles()
        ]);

      setUsuarios(datosUsuarios);
      setEmpleados(datosEmpleados);
      setRoles(datosRoles);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const buscarEmpleadoDeUsuario = (usuarioId) =>
    empleados.find((empleado) => empleado.usuario?.id === usuarioId);

  const abrirCrear = () => {
    setUsuarioEditando(null);
    setFormulario(formularioInicial);
    setError("");
    setArchivoFoto(null);
    setMostrarModal(true);
  };

  const abrirEditar = (usuario) => {
    const empleado = buscarEmpleadoDeUsuario(usuario.id);

    setUsuarioEditando(usuario);
    setArchivoFoto(null);
    setFormulario({
      email: usuario.email || "",
      password: "",
      fotoPerfilUrl: usuario.fotoPerfilUrl || "",
      habilitado: usuario.habilitado,
      empleadoId: empleado?.id || "",
      rolesIds: usuario.roles?.map((rol) => rol.id) || []
    });

    setError("");
    setMostrarModal(true);
  };

  const cambiarRoles = (evento) => {
    const rolesSeleccionados = Array.from(
      evento.target.selectedOptions,
      (opcion) => opcion.value
    );

    setFormulario((anterior) => ({
      ...anterior,
      rolesIds: rolesSeleccionados
    }));
  };

  const guardarUsuario = async (evento) => {
    evento.preventDefault();

    try {
      setError("");

      let datosUsuario = { ...formulario };

      if (archivoFoto) {
        const resultadoImagen = await subirFotoPerfil(archivoFoto);

        datosUsuario = {
          ...datosUsuario,
          fotoPerfilUrl: resultadoImagen.url
        };
      }

      if (usuarioEditando) {
        await actualizarUsuario(usuarioEditando.id, datosUsuario);
      } else {
        await crearUsuario(datosUsuario);
      }

      setMostrarModal(false);
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const borrarUsuario = async (usuario) => {
    if (!window.confirm(`¿Deseas eliminar el usuario ${usuario.email}?`)) {
      return;
    }

    try {
      await eliminarUsuario(usuario.id);
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const empleadosDisponibles = empleados.filter((empleado) => {
    return !empleado.usuario
      || empleado.usuario.id === usuarioEditando?.id;
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center py-4">
        <div>
          <Breadcrumb className="d-none d-md-inline-block">
            <Breadcrumb.Item href="#/dashboard/overview">
              <FontAwesomeIcon icon={faHome} />
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Users</Breadcrumb.Item>
          </Breadcrumb>

          <h2 className="h4">Users</h2>
          <p className="mb-0">
            Create access accounts and assign roles to employees.
          </p>
        </div>

        <Button variant="primary" onClick={abrirCrear}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          New user
        </Button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <Card border="light" className="shadow-sm">
        <Card.Header>
          <FontAwesomeIcon icon={faUserCog} className="me-2" />
          <strong>System users</strong>
        </Card.Header>

        <Card.Body className="p-0">
          <Table responsive hover className="user-table align-items-center mb-0">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Email</th>
                <th>Employee</th>
                <th>Roles</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No users registered yet.
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => {
                  const empleado = buscarEmpleadoDeUsuario(usuario.id);

                  const iniciales = empleado
                    ? `${empleado.nombres?.charAt(0) || ""}${empleado.apellidos?.charAt(0) || ""}`
                    : usuario.email.charAt(0).toUpperCase();

                  return (
                    <tr key={usuario.id}>
                      <td>
                        {usuario.fotoPerfilUrl ? (
                          <img
                            src={usuario.fotoPerfilUrl}
                            alt={`Profile of ${usuario.email}`}
                            width="38"
                            height="38"
                            style={{
                              objectFit: "cover",
                              borderRadius: "50%"
                            }}
                          />
                        ) : (
                          <div
                            className="d-flex align-items-center justify-content-center bg-primary text-white fw-bold"
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "50%"
                            }}
                          >
                            {iniciales}
                          </div>
                        )}
                      </td>
                      <td className="fw-bold">{usuario.email}</td>
                      <td>
                        {empleado
                          ? `${empleado.nombres} ${empleado.apellidos}`
                          : "Not linked"}
                      </td>
                      <td>
                        {usuario.roles?.map((rol) => (
                          <Badge
                            key={rol.id}
                            bg="primary"
                            className="me-1"
                          >
                            {rol.nombre}
                          </Badge>
                        ))}
                      </td>
                      <td>
                        <Badge bg={usuario.habilitado ? "success" : "danger"}>
                          {usuario.habilitado ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-2"
                          onClick={() => abrirEditar(usuario)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => borrarUsuario(usuario)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal
        as={Modal.Dialog}
        centered
        size="lg"
        show={mostrarModal}
        onHide={() => setMostrarModal(false)}
      >
        <Form onSubmit={guardarUsuario}>
          <Modal.Header>
            <Modal.Title>
              {usuarioEditando ? "Edit user" : "New user"}
            </Modal.Title>
            <Button
              variant="close"
              onClick={() => setMostrarModal(false)}
            />
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Employee</Form.Label>
              <Form.Select
                required
                value={formulario.empleadoId}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    empleadoId: e.target.value
                  })
                }
              >
                <option value="">Select an employee</option>

                {empleadosDisponibles.map((empleado) => (
                  <option key={empleado.id} value={empleado.id}>
                    {empleado.nombres} {empleado.apellidos} — {empleado.cargo || "No position"}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Login email</Form.Label>
              <Form.Control
                required
                type="email"
                value={formulario.email}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    email: e.target.value
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Profile image</Form.Label>

              <Form.Control
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const archivo = e.target.files?.[0];

                  if (!archivo) {
                    return;
                  }

                  setArchivoFoto(archivo);

                  setFormulario({
                    ...formulario,
                    fotoPerfilUrl: URL.createObjectURL(archivo)
                  });
                }}
              />

              <Form.Text className="text-muted">
                PNG, JPG or WEBP. Maximum size: 5 MB.
              </Form.Text>

              {formulario.fotoPerfilUrl && (
                <div className="mt-3 text-center">
                  <img
                    src={formulario.fotoPerfilUrl}
                    alt="Profile preview"
                    width="80"
                    height="80"
                    style={{
                      objectFit: "cover",
                      borderRadius: "50%"
                    }}
                  />
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Password {usuarioEditando && "(leave empty to keep current password)"}
              </Form.Label>
              <Form.Control
                required={!usuarioEditando}
                type="password"
                value={formulario.password}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    password: e.target.value
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Roles</Form.Label>
              <Form.Select
                required
                multiple
                value={formulario.rolesIds}
                onChange={cambiarRoles}
                style={{ minHeight: "130px" }}
              >
                {roles.map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre}
                  </option>
                ))}
              </Form.Select>

              <Form.Text className="text-muted">
                Use Ctrl (Windows) or Command (Mac) to select multiple roles.
              </Form.Text>
            </Form.Group>

            <Form.Check
              type="switch"
              id="usuario-habilitado"
              label="User enabled"
              checked={formulario.habilitado}
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  habilitado: e.target.checked
                })
              }
            />
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setMostrarModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {usuarioEditando ? "Save changes" : "Create user"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}