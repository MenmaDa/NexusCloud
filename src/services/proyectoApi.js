import { apiFetch } from "./apiFetch";

const API_URL = "https://telecooperaciones-production.up.railway.app/api/proyectos";

async function manejarRespuesta(response) {
  if (!response.ok) {
    let mensaje = "No fue possible to complete the operation.";

    try {
      const error = await response.json();
      mensaje = error.message || mensaje;
    } catch {
      // La API no envió un detalle de error.
    }

    throw new Error(mensaje);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function listarProyectos() {
  return manejarRespuesta(await apiFetch(API_URL));
}

export async function crearProyecto(proyecto) {
  return manejarRespuesta(await apiFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proyecto)
  }));
}

export async function actualizarProyecto(id, proyecto) {
  return manejarRespuesta(await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proyecto)
  }));
}

export async function eliminarProyecto(id) {
  return manejarRespuesta(await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE"
  }));
}