import { apiFetch } from "./apiFetch";

const BASE_URL = "https://telecooperaciones-production.up.railway.app/api/infraestructura";

async function manejarRespuesta(response) {
  if (!response.ok) {
    let mensaje = "Could not complete the network address operation.";

    try {
      const error = await response.json();
      mensaje = error.detail || error.message || mensaje;
    } catch {
      // El backend no devolvió JSON.
    }

    throw new Error(mensaje);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const listarDireccionesRed = (infraestructuraId) =>
  apiFetch(`${BASE_URL}/${infraestructuraId}/direcciones-red`)
    .then(manejarRespuesta);

export const crearDireccionRed = (infraestructuraId, direccion) =>
  apiFetch(`${BASE_URL}/${infraestructuraId}/direcciones-red`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(direccion)
  }).then(manejarRespuesta);

export const actualizarDireccionRed = (
  infraestructuraId,
  direccionId,
  direccion
) =>
  apiFetch(
    `${BASE_URL}/${infraestructuraId}/direcciones-red/${direccionId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(direccion)
    }
  ).then(manejarRespuesta);

export const eliminarDireccionRed = (
  infraestructuraId,
  direccionId
) =>
  apiFetch(
    `${BASE_URL}/${infraestructuraId}/direcciones-red/${direccionId}`,
    { method: "DELETE" }
  ).then(manejarRespuesta);