import { apiFetch } from "./apiFetch";
const API_URL = "https://telecooperaciones-production.up.railway.app/api/productos-servicios";

async function manejarRespuesta(respuesta) {
  if (!respuesta.ok) {
    const mensaje = await respuesta.text();
    throw new Error(mensaje || "The request could not be completed");
  }

  if (respuesta.status === 204) {
    return null;
  }

  return respuesta.json();
}

export async function listarProductosServicios() {
  const respuesta = await apiFetch(API_URL);
  return manejarRespuesta(respuesta);
}

export async function crearProductoServicio(productoServicio) {
  const respuesta = await apiFetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(productoServicio)
  });

  return manejarRespuesta(respuesta);
}

export async function actualizarProductoServicio(id, productoServicio) {
  const respuesta = await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(productoServicio)
  });

  return manejarRespuesta(respuesta);
}

export async function eliminarProductoServicio(id) {
  const respuesta = await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });

  return manejarRespuesta(respuesta);
}