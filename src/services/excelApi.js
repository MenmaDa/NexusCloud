import { apiFetch } from "./apiFetch";

const API_URL = "http://localhost:8080/api/excel";

export async function leerArchivoExcel(archivo) {
  if (!archivo) {
    throw new Error("Debes seleccionar un archivo Excel.");
  }

  if (!archivo.name.toLowerCase().endsWith(".xlsx")) {
    throw new Error("Solo se permiten archivos .xlsx");
  }

  const formData = new FormData();
  formData.append("archivo", archivo);

  const respuesta = await apiFetch(`${API_URL}/leer`, {
    method: "POST",
    body: formData,
  });

  if (!respuesta.ok) {
    throw new Error(
      `No se pudo leer el Excel. Código HTTP: ${respuesta.status}`,
    );
  }

  return respuesta.json();
}
