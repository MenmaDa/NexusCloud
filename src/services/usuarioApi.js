import { apiFetch } from "./apiFetch";

const API_URL = "https://telecooperaciones-production.up.railway.app/api/usuarios";

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

export const listarUsuarios = () =>
  apiFetch(API_URL).then(manejarRespuesta);

export const crearUsuario = (usuario) =>
  apiFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario)
  }).then(manejarRespuesta);

export const actualizarUsuario = (id, usuario) =>
  apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario)
  }).then(manejarRespuesta);

export const eliminarUsuario = (id) =>
  apiFetch(`${API_URL}/${id}`, {
    method: "DELETE"
  }).then(manejarRespuesta);