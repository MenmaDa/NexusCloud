const API_URL = "http://localhost:8080/api/tareas";

async function manejarRespuesta(response) {
  if (!response.ok) {
    let mensaje = "No fue possible to complete the operation.";

    try {
      const error = await response.json();
      mensaje = error.message || mensaje;
    } catch {
      // La API no devolvió un JSON de error.
    }

    throw new Error(mensaje);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function listarTareas() {
  return manejarRespuesta(await fetch(API_URL));
}

export async function crearTarea(tarea) {
  return manejarRespuesta(await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tarea)
  }));
}

export async function actualizarTarea(id, tarea) {
  return manejarRespuesta(await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tarea)
  }));
}

export async function eliminarTarea(id) {
  return manejarRespuesta(await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  }));
}