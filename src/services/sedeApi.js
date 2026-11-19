import { apiFetch } from "./apiFetch";
const API_URL = "https://telecooperaciones-production.up.railway.app/api/sedes";

async function manejarRespuesta(response) {
  if (!response.ok) {
    let mensaje = "Could not complete the operation.";

    try {
      const error = await response.json();
      mensaje = error.message || mensaje;
    } catch {
      // La API no devolvió detalle.
    }

    throw new Error(mensaje);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function listarSedes() {
  return manejarRespuesta(await apiFetch(API_URL));
}

export async function crearSede(sede) {
  return manejarRespuesta(await apiFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sede)
  }));
}

export async function actualizarSede(id, sede) {
  return manejarRespuesta(await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sede)
  }));
}

export async function eliminarSede(id) {
  return manejarRespuesta(await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE"
  }));
}