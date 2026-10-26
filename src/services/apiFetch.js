import { cerrarSesion, obtenerToken } from "./authApi";

export async function apiFetch(url, opciones = {}) {
  const token = obtenerToken();

  const headers = {
    ...(opciones.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...opciones,
    headers
  });

  if (response.status === 401) {
    cerrarSesion();
    window.location.hash = "#/examples/sign-in";
  }

  return response;
}