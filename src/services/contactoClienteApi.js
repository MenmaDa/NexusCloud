import { apiFetch } from "./apiFetch";
const API_URL = "https://telecooperaciones-production.up.railway.app/api/contactos-clientes";

async function manejarRespuesta(response) {
  if (!response.ok) {
    let mensaje = "No fue possible to complete the operation.";

    try {
      const error = await response.json();
      mensaje = error.message || mensaje;
    } catch {
      // La respuesta no trae detalle de error.
    }

    throw new Error(mensaje);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function listarContactosClientes() {
  const response = await apiFetch(API_URL);
  return manejarRespuesta(response);
}

export async function crearContactoCliente(contacto) {
  const response = await apiFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contacto)
  });

  return manejarRespuesta(response);
}

export async function actualizarContactoCliente(id, contacto) {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contacto)
  });

  return manejarRespuesta(response);
}

export async function eliminarContactoCliente(id) {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });

  return manejarRespuesta(response);
}