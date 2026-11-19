import { apiFetch } from "./apiFetch";

const API_URL = "https://telecooperaciones-production.up.railway.app/api/facturas";

async function manejarRespuesta(response) {
  if (!response.ok) {
    let mensaje = "Could not complete the billing operation.";

    try {
      const error = await response.json();
      mensaje = error.detail || error.message || mensaje;
    } catch {
      // Sin detalle adicional.
    }

    throw new Error(mensaje);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const listarFacturas = () =>
  apiFetch(API_URL).then(manejarRespuesta);

export const crearFactura = (factura) =>
  apiFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(factura)
  }).then(manejarRespuesta);

export const actualizarFactura = (id, factura) =>
  apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(factura)
  }).then(manejarRespuesta);

export const eliminarFactura = (id) =>
  apiFetch(`${API_URL}/${id}`, {
    method: "DELETE"
  }).then(manejarRespuesta);