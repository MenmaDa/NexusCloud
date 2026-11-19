import { apiFetch } from "./apiFetch";

const API_URL = "https://telecooperaciones-production.up.railway.app/api/notificaciones";

async function manejarRespuesta(response) {
  if (!response.ok) {
    throw new Error("Could not load notifications.");
  }

  return response.json();
}

export function listarMisNotificaciones() {
  return apiFetch(`${API_URL}/mis-notificaciones`)
    .then(manejarRespuesta);
}

export function contarNoLeidas() {
  return apiFetch(`${API_URL}/no-leidas/count`)
    .then(manejarRespuesta);
}

export function marcarNotificacionLeida(id) {
  return apiFetch(`${API_URL}/${id}/leida`, {
    method: "PATCH"
  }).then(manejarRespuesta);
}