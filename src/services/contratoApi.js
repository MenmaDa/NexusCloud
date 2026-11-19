import { apiFetch } from "./apiFetch";

const API_URL = "https://telecooperaciones-production.up.railway.app/api/contratos";

async function manejarRespuesta(response) {
  if (!response.ok) {
    let mensaje = "No fue posible completar la operación.";

    try {
      const error = await response.json();
      mensaje = error.message || mensaje;
    } catch {
      // La respuesta no trae un JSON de error.
    }

    throw new Error(mensaje);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function listarContratos() {
  const response = await apiFetch(API_URL);
  return manejarRespuesta(response);
}

export async function crearContrato(contrato) {
  const response = await apiFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contrato)
  });

  return manejarRespuesta(response);
}

export async function actualizarContrato(id, contrato) {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contrato)
  });

  return manejarRespuesta(response);
}

export async function eliminarContrato(id) {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });

  return manejarRespuesta(response);
}