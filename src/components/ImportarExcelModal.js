import React, { useState } from "react";
import { Button, Modal, Table, Form, Alert } from "@themesberg/react-bootstrap";
import { leerArchivoExcel } from "../services/excelApi";

export default function ImportarExcelModal({
  show,
  onHide,
  campos,
  transformarFila,
  onSave,
  onSaved,
}) {
  const [archivo, setArchivo] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [errores, setErrores] = useState([]);
  const [erroresGuardado, setErroresGuardado] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("warning");

  function cambiarArchivo(e) {
    setArchivo(e.target.files[0] || null);
    setRegistros([]);
    setErrores([]);
    setErroresGuardado([]);
    setMensaje("");
  }

  async function procesarArchivo() {
    if (!archivo) {
      setMensaje("Please select an Excel file.");
      setTipoMensaje("warning");
      return;
    }

    setCargando(true);
    setMensaje("");
    setRegistros([]);
    setErrores([]);
    setErroresGuardado([]);

    try {
      const resultado = await leerArchivoExcel(archivo);
      const validos = [];
      const invalidos = [];

      resultado.registros.forEach((fila, indice) => {
        try {
          validos.push(transformarFila(fila));
        } catch (error) {
          invalidos.push({
            fila: indice + 2,
            mensaje: error.message,
          });
        }
      });

      setRegistros(validos);
      setErrores(invalidos);

      if (validos.length === 0 && invalidos.length === 0) {
        setMensaje("The Excel file contains no records.");
        setTipoMensaje("warning");
      }
    } catch (error) {
      setMensaje(error.message || "Failed to read the Excel file.");
      setTipoMensaje("danger");
    } finally {
      setCargando(false);
    }
  }

  async function guardarRegistros() {
    if (registros.length === 0) {
      setMensaje("No records to save.");
      setTipoMensaje("warning");
      return;
    }

    if (typeof onSave !== "function") {
      setMensaje("The save service is not configured.");
      setTipoMensaje("danger");
      return;
    }

    setGuardando(true);
    setMensaje("");
    setErroresGuardado([]);

    let guardados = 0;
    const pendientes = [];
    const fallidos = [];

    for (let indice = 0; indice < registros.length; indice++) {
      const registro = registros[indice];

      try {
        await onSave(registro);
        guardados++;
      } catch (error) {
        pendientes.push(registro);
        fallidos.push({
          fila: indice + 1,
          mensaje: error.message || "Failed to save record.",
        });
      }
    }

    setRegistros(pendientes);
    setErroresGuardado(fallidos);
    setGuardando(false);

    if (fallidos.length === 0) {
      setTipoMensaje("success");
      setMensaje(`${guardados} records saved successfully.`);
    } else {
      setTipoMensaje("warning");
      setMensaje(
        `${guardados} records saved successfully. ` +
          `${fallidos.length} records failed.`,
      );
    }

    if (guardados > 0 && typeof onSaved === "function") {
      await onSaved();
    }
  }

  return (
    <Modal
      show={show}
      onHide={guardando || cargando ? undefined : onHide}
      size="xl"
      centered
    >
      <Modal.Header>
        <Modal.Title>Import Records from Excel</Modal.Title>
        <Button
          variant="close"
          onClick={onHide}
          disabled={guardando || cargando}
        />
      </Modal.Header>

      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Select Excel File (.xlsx)</Form.Label>

          <Form.Control
            type="file"
            accept=".xlsx"
            onChange={cambiarArchivo}
            disabled={guardando || cargando}
          />
        </Form.Group>

        <Button
          onClick={procesarArchivo}
          disabled={cargando || guardando || !archivo}
        >
          {cargando ? "Processing..." : "Read Excel"}
        </Button>

        {mensaje && (
          <Alert variant={tipoMensaje} className="mt-3">
            {mensaje}
          </Alert>
        )}

        {errores.length > 0 && (
          <Alert variant="danger" className="mt-3">
            <strong>Validation Errors:</strong>
            <ul className="mb-0">
              {errores.map((error, indice) => (
                <li key={indice}>
                  Row {error.fila}: {error.mensaje}
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {erroresGuardado.length > 0 && (
          <Alert variant="danger" className="mt-3">
            <strong>Save Errors:</strong>
            <ul className="mb-0">
              {erroresGuardado.map((error, indice) => (
                <li key={indice}>
                  Record {error.fila}: {error.mensaje}
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {registros.length > 0 && (
          <>
            <h5 className="mt-4">Preview: {registros.length} Records</h5>

            <div style={{ maxHeight: 350, overflow: "auto" }}>
              <Table responsive bordered hover>
                <thead>
                  <tr>
                    {campos.map((campo) => (
                      <th key={campo}>{campo}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {registros.map((registro, indice) => (
                    <tr key={indice}>
                      {campos.map((campo) => (
                        <td key={campo}>
                          {registro[campo] === null ||
                          registro[campo] === undefined
                            ? ""
                            : String(registro[campo])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onHide}
          disabled={guardando || cargando}
        >
          Close
        </Button>

        <Button
          variant="success"
          onClick={guardarRegistros}
          disabled={guardando || cargando || registros.length === 0}
        >
          {guardando
            ? "Saving Records..."
            : `Save Records (${registros.length})`}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
