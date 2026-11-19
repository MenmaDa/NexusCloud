import { apiFetch } from "./apiFetch";

const API_URL = "https://telecooperaciones-production.up.railway.app/api/auth";

export async function iniciarSesion(email, password) {
  const response = await apiFetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    let mensaje = "Invalid email or password.";

    try {
      const error = await response.json();
      mensaje = error.message || mensaje;
    } catch {
      // La API no devolvió un detalle.
    }

    throw new Error(mensaje);
  }

  return response.json();
}

export function guardarSesion(datos) {
  localStorage.setItem("nexus_token", datos.token);
  localStorage.setItem("nexus_email", datos.email);
  localStorage.setItem("nexus_nombre", datos.nombre || datos.email);
  localStorage.setItem("nexus_foto", datos.fotoPerfilUrl || "");
  localStorage.setItem(
    "nexus_roles",
    JSON.stringify(datos.roles || [])
  );
}

export function cerrarSesion() {
  localStorage.removeItem("nexus_token");
  localStorage.removeItem("nexus_email");
  localStorage.removeItem("nexus_roles");
  localStorage.removeItem("nexus_nombre");
  localStorage.removeItem("nexus_foto");
}

export function obtenerToken() {
  return localStorage.getItem("nexus_token");
}

export function estaAutenticado() {
  return Boolean(obtenerToken());
}

export function obtenerRoles() {
  return JSON.parse(
    localStorage.getItem("nexus_roles") || "[]"
  );
}

export function obtenerNombreUsuario() {
  return localStorage.getItem("nexus_nombre") || "User";
}

export function obtenerFotoPerfil() {
  return localStorage.getItem("nexus_foto") || "";
}