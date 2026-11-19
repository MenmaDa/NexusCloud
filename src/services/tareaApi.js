import { apiFetch } from "./apiFetch";

const API_URL = "https://telecooperaciones-production.up.railway.app/api/tareas";

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

export async function listarTareas() {
  return manejarRespuesta(await apiFetch(API_URL));
}

export async function listarMisTareas() {
  return manejarRespuesta(
    await apiFetch(`${API_URL}/mis-tareas`)
  );
}

export async function crearTarea(tarea) {
  return manejarRespuesta(await apiFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tarea)
  }));
}

export async function actualizarTarea(id, tarea) {
  return manejarRespuesta(await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tarea)
  }));
}

export async function eliminarTarea(id) {
  return manejarRespuesta(await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE"
  }));
}

export async function actualizarMiProgreso(id, progreso) {
  return manejarRespuesta(
    await apiFetch(`${API_URL}/${id}/mi-progreso`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(progreso)
    })
  );
}