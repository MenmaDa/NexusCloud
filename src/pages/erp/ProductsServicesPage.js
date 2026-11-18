import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faHome,
  faPlus,
  faTrash,
  faFileExcel,
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

import ImportarExcelModal from "../components/ImportarExcelModal";

import {
  actualizarProductoServicio,
  crearProductoServicio,
  eliminarProductoServicio,
  listarProductosServicios,
} from "../../services/productoServicioApi";

const productoInicial = {
  nombre: "",
  categoria: "",
  tipo: "PRODUCTO",
  precio: "",
  puntuacionCalidad: 1,
  stock: "",
  descripcion: "",
  activo: true,
};

export default function ProductsServicesPage() {
  const [productos, setProductos] = useState([]);
  const [producto, setProducto] = useState(productoInicial);
  const [editando, setEditando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarImportacion, setMostrarImportacion] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    cargarProductos();
  }, []);

  async function cargarProductos() {
    try {
      setCargando(true);
      setError("");

      const datos = await listarProductosServicios();
      setProductos(datos);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  function abrirCrear() {
    setProducto(productoInicial);
    setEditando(false);
    setError("");
    setMostrarModal(true);
  }

  function abrirEditar(productoSeleccionado) {
    setProducto({
      ...productoSeleccionado,
      stock:
        productoSeleccionado.stock === null ? "" : productoSeleccionado.stock,
    });

    setEditando(true);
    setError("");
    setMostrarModal(true);
  }

  function manejarCambio(evento) {
    const { name, value, type, checked } = evento.target;

    setProducto({
      ...producto,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  async function guardarProducto(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setError("");

      const datosParaEnviar = {
        ...producto,
        precio: Number(producto.precio),
        puntuacionCalidad: Number(producto.puntuacionCalidad),
        stock:
          producto.tipo === "SERVICIO" || producto.stock === ""
            ? null
            : Number(producto.stock),
      };

      if (editando) {
        await actualizarProductoServicio(producto.id, datosParaEnviar);

        setMensaje("Product or service updated successfully.");
      } else {
        await crearProductoServicio(datosParaEnviar);
        setMensaje("Product or service created successfully.");
      }

      setMostrarModal(false);
      await cargarProductos();
    } catch (err) {
      setError("The product or service could not be saved.");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarProducto(id) {
    const confirmar = window.confirm(
      "Do you want to delete this product or service?",
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");
      await eliminarProductoServicio(id);
      setMensaje("Product or service deleted successfully.");
      await cargarProductos();
    } catch (err) {
      setError("The product or service could not be deleted.");
    }
  }

  // =========================================
  // IMPORTACIÓN DE PRODUCTOS DESDE EXCEL
  // =========================================

  function transformarProductoExcel(fila) {
    const nombre = String(fila.nombre || "").trim();
    const categoria = String(fila.categoria || "").trim();
    const tipo = String(fila.tipo || "PRODUCTO").trim().toUpperCase();

    if (!nombre) {
      throw new Error("El nombre es obligatorio.");
    }

    if (!categoria) {
      throw new Error("La categoría es obligatoria.");
    }

    if (!["PRODUCTO", "SERVICIO"].includes(tipo)) {
      throw new Error("El tipo debe ser PRODUCTO o SERVICIO.");
    }

    function numeroObligatorio(valor, campo, minimo, maximo) {
      const texto = String(valor ?? "").trim();
      const numero = Number(texto);

      if (
        texto === "" ||
        !Number.isFinite(numero) ||
        numero < minimo ||
        (maximo !== undefined && numero > maximo)
      ) {
        throw new Error(`El campo ${campo} contiene un valor inválido.`);
      }

      return numero;
    }

    const precio = numeroObligatorio(fila.precio, "Precio", 0);
    const puntuacionCalidad = numeroObligatorio(
      fila.puntuacionCalidad,
      "Calidad",
      1,
      5
    );

    if (!Number.isInteger(puntuacionCalidad)) {
      throw new Error("La calidad debe ser un número entero entre 1 y 5.");
    }

    let stock = null;

    if (tipo === "PRODUCTO") {
      stock = numeroObligatorio(fila.stock, "Stock", 0);


      if (!Number.isInteger(stock)) {
        throw new Error("El stock debe ser un número entero.");
      }
    }

    const descripcion = String(fila.descripcion || "").trim();
    const activoTexto = String(fila.activo || "true").trim().toLowerCase();

    const valoresValidos = ["true", "false", "1", "0", "si", "sí", "no"];

    if (!valoresValidos.includes(activoTexto)) {
      throw new Error("El campo Activo debe ser verdadero o falso.");
    }

    const activo = ["true", "1", "si", "sí"].includes(activoTexto);

    return {
      nombre,
      categoria,
      tipo,
      precio,
      puntuacionCalidad,
      stock,
      descripcion,
      activo,
    };
  }

  return (
    <>
      {/* ENCABEZADO */}

      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div className="d-block mb-4 mb-md-0">
          <Breadcrumb
            className="d-none d-md-inline-block"
            listProps={{
              className: "breadcrumb-dark breadcrumb-transparent",
            }}
          >
            <Breadcrumb.Item>
              <FontAwesomeIcon icon={faHome} />
            </Breadcrumb.Item>

            <Breadcrumb.Item>Nexus ERP</Breadcrumb.Item>

            <Breadcrumb.Item active>Products and Services</Breadcrumb.Item>
          </Breadcrumb>

          <h4>Products and Services</h4>

          <p className="mb-0">
            Manage the catalog used for invoices and recommendations.
          </p>
        </div>

        {/* BOTONES DE REGISTRO E IMPORTACIÓN */}

        <div className="d-flex flex-wrap" style={{ gap: "10px" }}>
          <Button variant="primary" onClick={abrirCrear}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            New product or service
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

      {/* MENSAJES */}

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

      {/* TABLA DE PRODUCTOS */}

      <Card border="light" className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Catalog</h5>
        </Card.Header>

        <Card.Body className="p-0">
          <Table
            responsive
            className="table-centered table-nowrap rounded mb-0"
          >
            <thead className="thead-light">
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Price</th>
                <th>Quality</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {cargando && (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    Loading catalog...
                  </td>
                </tr>
              )}

              {!cargando && productos.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No products or services registered yet.
                  </td>
                </tr>
              )}

              {!cargando &&
                productos.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="fw-normal">{item.nombre}</span>
                    </td>

                    <td>{item.categoria}</td>

                    <td>
                      <Badge bg="primary">{item.tipo}</Badge>
                    </td>

                    <td>${Number(item.precio).toLocaleString("es-CO")}</td>

                    <td>{item.puntuacionCalidad}/5</td>

                    <td>
                      {item.tipo === "SERVICIO" ? "Not applicable" : item.stock}
                    </td>

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
                        onClick={() => eliminarProducto(item.id)}
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

      {/* MODAL DE REGISTRO MANUAL */}

      <Modal
        as={Modal.Dialog}
        centered
        show={mostrarModal}
        onHide={() => setMostrarModal(false)}
      >
        <Form onSubmit={guardarProducto}>
          <Modal.Header>
            <Modal.Title>
              {editando ? "Edit product or service" : "New product or service"}
            </Modal.Title>

            <Button
              variant="close"
              aria-label="Close"
              onClick={() => setMostrarModal(false)}
            />
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>

              <Form.Control
                required
                name="nombre"
                value={producto.nombre}
                onChange={manejarCambio}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>

              <Form.Control
                required
                name="categoria"
                value={producto.categoria}
                onChange={manejarCambio}
                placeholder="Security / CCTV"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>

              <Form.Select
                name="tipo"
                value={producto.tipo}
                onChange={manejarCambio}
              >
                <option value="PRODUCTO">Product</option>

                <option value="SERVICIO">Service</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price (COP)</Form.Label>

              <Form.Control
                required
                min="0"
                type="number"
                name="precio"
                value={producto.precio}
                onChange={manejarCambio}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quality score</Form.Label>

              <Form.Control
                required
                min="1"
                max="5"
                type="number"
                name="puntuacionCalidad"
                value={producto.puntuacionCalidad}
                onChange={manejarCambio}
              />
            </Form.Group>

            {producto.tipo === "PRODUCTO" && (
              <Form.Group className="mb-3">
                <Form.Label>Stock</Form.Label>

                <Form.Control
                  required
                  min="0"
                  type="number"
                  name="stock"
                  value={producto.stock}
                  onChange={manejarCambio}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>

              <Form.Control
                as="textarea"
                rows="3"
                name="descripcion"
                value={producto.descripcion || ""}
                onChange={manejarCambio}
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              name="activo"
              label="Active"
              checked={producto.activo}
              onChange={manejarCambio}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setMostrarModal(false)}>
              Cancel
            </Button>

            <Button variant="primary" type="submit" disabled={guardando}>
              {guardando ? "Saving..." : "Save"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL DE IMPORTACIÓN DE EXCEL */}

      <ImportarExcelModal
        show={mostrarImportacion}
        onHide={() => setMostrarImportacion(false)}
        campos={[
          "nombre",
          "categoria",
          "tipo",
          "precio",
          "puntuacionCalidad",
          "stock",
          "descripcion",
          "activo",
        ]}
        transformarFila={transformarProductoExcel}
        onSave={crearProductoServicio}
        onSaved={async () => {
          await cargarProductos();
        }}
        mapeoColumnas={{
          nombre: ["Nombre", "Name", "Product name", "Service name"],
          categoria: ["Categoría", "Categoria", "Category"],
          tipo: ["Tipo", "Type"],
          precio: ["Precio", "Price", "Unit price"],
          puntuacionCalidad: ["Calidad", "Quality", "Quality score"],
          stock: ["Stock", "Inventory", "Quantity"],
          descripcion: ["Descripción", "Descripcion", "Description"],
          activo: ["Activo", "Active", "Enabled"]
        }}
      />
    </>
  );
}