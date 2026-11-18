import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faEdit,
  faHome,
  faPlus,
  faTrash,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons";

import {
  Breadcrumb,
  Button,
  Card,
  Form,
  Modal,
  Table,
} from "@themesberg/react-bootstrap";

import {
  actualizarSede,
  crearSede,
  eliminarSede,
  listarSedes,
} from "../../services/sedeApi";

import ImportarExcelModal from "../components/ImportarExcelModal";

const formularioInicial = {
  nombre: "",
  ciudad: "",
  direccion: "",
  telefono: "",
};

export default function BranchesPage() {
  const [sedes, setSedes] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [sedeEditando, setSedeEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarImportacion, setMostrarImportacion] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarSedes = async () => {
    try {
      setCargando(true);
      setError("");
      setSedes(await listarSedes());
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSedes();
  }, []);

  const abrirCrear = () => {
    setSedeEditando(null);
    setFormulario(formularioInicial);
    setError("");
    setMostrarModal(true);
  };

  const abrirEditar = (sede) => {
    setSedeEditando(sede);
    setFormulario({
      nombre: sede.nombre || "",
      ciudad: sede.ciudad || "",
      direccion: sede.direccion || "",
      telefono: sede.telefono || "",
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

  const guardarSede = async (evento) => {
    evento.preventDefault();

    try {
      setError("");

      if (sedeEditando) {
        await actualizarSede(sedeEditando.id, formulario);
      } else {
        await crearSede(formulario);
      }

      setMostrarModal(false);
      await cargarSedes();
    } catch (err) {
      setError(err.message);
    }
  };

  const borrarSede = async (sede) => {
    if (!window.confirm(`Do you want to delete the branch "${sede.nombre}"?`)) {
      return;
    }

    try {
      setError("");
      await eliminarSede(sede.id);
      await cargarSedes();
    } catch (err) {
      setError(err.message);
    }
  };

  // Excel import: map spreadsheet columns to backend fields
  const transformarSedeExcel = (fila) => {
    const nombre = String(fila.nombre || "").trim();

    if (!nombre) {
      throw new Error("Branch name is required.");
    }

    return {
      nombre,
      ciudad: String(fila.ciudad || "").trim(),
      direccion: String(fila.direccion || "").trim(),
      telefono: String(fila.telefono || "").trim()
    };
  };

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div>
          <Breadcrumb className="d-none d-md-inline-block">
            <Breadcrumb.Item href="#/dashboard/overview">
              <FontAwesomeIcon icon={faHome} />
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Branches</Breadcrumb.Item>
          </Breadcrumb>

          <h2 className="h4">Branches</h2>

          <p className="mb-0">
            Manage company offices and operational locations.
          </p>
        </div>

        <div className="d-flex flex-wrap" style={{ gap: "10px" }}>
          <Button variant="primary" onClick={abrirCrear}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            New branch
          </Button>

          <Button
            variant="outline-primary"
            onClick={() => setMostrarImportacion(true)}
          >
            <FontAwesomeIcon icon={faFileExcel} className="me-2" />
            Import Excel
          </Button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <Card border="light" className="shadow-sm mb-4">
        <Card.Header>
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faBuilding} className="me-2" />
            <h5 className="mb-0">Registered branches</h5>
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
                <th>Branch</th>
                <th>City</th>
                <th>Address</th>
                <th>Phone</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Loading branches...
                  </td>
                </tr>
              ) : sedes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No branches registered yet.
                  </td>
                </tr>
              ) : (
                sedes.map((sede) => (
                  <tr key={sede.id}>
                    <td className="fw-bold">{sede.nombre}</td>
                    <td>{sede.ciudad || "-"}</td>
                    <td>{sede.direccion || "-"}</td>
                    <td>{sede.telefono || "-"}</td>

                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => abrirEditar(sede)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => borrarSede(sede)}
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
        <Form onSubmit={guardarSede}>
          <Modal.Header>
            <Modal.Title>
              {sedeEditando ? "Edit branch" : "New branch"}
            </Modal.Title>

            <Button
              variant="close"
              aria-label="Close"
              onClick={() => setMostrarModal(false)}
            />
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Branch name</Form.Label>
              <Form.Control
                required
                name="nombre"
                value={formulario.nombre}
                onChange={cambiarCampo}
                placeholder="Example: Bogota Headquarters"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control
                name="ciudad"
                value={formulario.ciudad}
                onChange={cambiarCampo}
                placeholder="Example: Bogota"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                name="direccion"
                value={formulario.direccion}
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
              {sedeEditando ? "Save changes" : "Create branch"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Excel import modal */}
      <ImportarExcelModal
        show={mostrarImportacion}
        onHide={() => setMostrarImportacion(false)}
        campos={["nombre", "ciudad", "direccion", "telefono"]}
        transformarFila={transformarSedeExcel}
        onSave={crearSede}
        onSaved={cargarSedes}
        mapeoColumnas={{
          nombre: [
            "Name",
            "Nombre",
            "Branch",
            "Branch name",
            "Sede",
            "Nombre sede",
            "Nombre de sede"
          ],
          ciudad: ["City", "Ciudad"],
          direccion: ["Address", "Direccion", "Dirección"],
          telefono: ["Phone", "Telephone", "Telefono", "Teléfono"]
        }}
      />
    </>
  );
}