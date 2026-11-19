import { apiFetch } from "./apiFetch";

const API_URL = "https://telecooperaciones-production.up.railway.app/api/archivos";

export async function subirFotoPerfil(archivo) {
  const datos = new FormData();
  datos.append("archivo", archivo);

  const response = await apiFetch(`${API_URL}/perfiles`, {
    method: "POST",
    body: datos
  });

  if (!response.ok) {
    let mensaje = "Could not upload the profile image.";

    try {
      const error = await response.json();
      mensaje = error.message || mensaje;
    } catch {
      // La API no devolvió detalle.
    }

    throw new Error(mensaje);
  }

  return response.json();
}