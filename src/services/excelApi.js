import { apiFetch } from "./apiFetch";

const API_URL = "https://telecooperaciones-production.up.railway.app/api/excel";

export async function leerArchivoExcel(archivo, hoja = null) {
  if (!archivo) {
    throw new Error("Debes seleccionar un archivo Excel.");
  }

  if (!archivo.name.toLowerCase().endsWith(".xlsx")) {
    throw new Error("Solo se permiten archivos .xlsx.");
  }

  const formData = new FormData();
  formData.append("archivo", archivo);

  const url = hoja
    ? `${API_URL}/leer?hoja=${encodeURIComponent(hoja)}`
    : `${API_URL}/leer`;

  const respuesta = await apiFetch(url, {
    method: "POST",
    body: formData
  });

  if (!respuesta.ok) {
    let mensaje = `No se pudo leer el Excel. Código HTTP: ${respuesta.status}`;

    try {
      const error = await respuesta.json();
      mensaje = error.detail || error.message || mensaje;
    } catch {
      // El backend no devolvió JSON.
    }

    throw new Error(mensaje);
  }

  return respuesta.json();
}