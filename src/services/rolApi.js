import { apiFetch } from "./apiFetch";

const API_URL = "https://telecooperaciones-production.up.railway.app/api/roles";

async function manejarRespuesta(response) {
  if (!response.ok) {
    let mensaje = "Could not complete the operation.";

    try {
      const error = await response.json();
      mensaje = error.message || mensaje;
    } catch {
      // La API no devolvió un JSON con detalle.
    }

    throw new Error(mensaje);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const listarRoles = () =>
  apiFetch(API_URL).then(manejarRespuesta);

export const crearRol = (rol) =>
  apiFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rol)
  }).then(manejarRespuesta);

export const actualizarRol = (id, rol) =>
  apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rol)
  }).then(manejarRespuesta);

export const eliminarRol = (id) =>
  apiFetch(`${API_URL}/${id}`, {
    method: "DELETE"
  }).then(manejarRespuesta);