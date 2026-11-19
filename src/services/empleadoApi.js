import { apiFetch } from "./apiFetch";
const API_URL = "https://telecooperaciones-production.up.railway.app/api/empleados";

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

export async function listarEmpleados() {
  return manejarRespuesta(await apiFetch(API_URL));
}

export async function crearEmpleado(empleado) {
  return manejarRespuesta(await apiFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(empleado)
  }));
}

export async function actualizarEmpleado(id, empleado) {
  return manejarRespuesta(await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(empleado)
  }));
}

export async function eliminarEmpleado(id) {
  return manejarRespuesta(await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE"
  }));
}