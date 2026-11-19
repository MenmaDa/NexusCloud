import { apiFetch } from "./apiFetch";

const API_URL = "https://telecooperaciones-production.up.railway.app/api/pagos";

async function manejarRespuesta(response) {
  if (!response.ok) {
    let mensaje = "Could not complete the payment operation.";

    try {
      const error = await response.json();
      mensaje = error.message || mensaje;
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

export const listarPagosPorFactura = (facturaId) =>
  apiFetch(`${API_URL}/factura/${facturaId}`).then(manejarRespuesta);

export const crearPago = (pago) =>
  apiFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pago)
  }).then(manejarRespuesta);

export const eliminarPago = (id) =>
  apiFetch(`${API_URL}/${id}`, {
    method: "DELETE"
  }).then(manejarRespuesta);