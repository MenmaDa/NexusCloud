import { apiFetch } from "./apiFetch";

const API_URL = "https://telecooperaciones-production.up.railway.app/api/infraestructura";

async function manejarRespuesta(response) {
    if (!response.ok) {
        let mensaje = "Could not complete the infrastructure operation.";

        try {
            const error = await response.json();
            mensaje = error.detail || error.message || mensaje;
        } catch {
            // Sin detalle adicional.
        }

        throw new Error(mensaje);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export const listarInfraestructuras = () =>
    apiFetch(API_URL).then(manejarRespuesta);

export const crearInfraestructura = (infraestructura) =>
    apiFetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(infraestructura)
    }).then(manejarRespuesta);

export const actualizarInfraestructura = (id, infraestructura) =>
    apiFetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(infraestructura)
    }).then(manejarRespuesta);

export const eliminarInfraestructura = (id) =>
    apiFetch(`${API_URL}/${id}`, {
        method: "DELETE"
    }).then(manejarRespuesta);

export const importarInfraestructura = async (archivo) => {
  const formData = new FormData();
  formData.append("archivo", archivo);

  const response = await apiFetch(
    "https://telecooperaciones-production.up.railway.app/api/infraestructura/importacion",
    {
      method: "POST",
      body: formData
    }
  );

  if (!response.ok) {
    let mensaje = "Could not import the infrastructure file.";

    try {
      const error = await response.json();
      mensaje = error.detail || error.message || mensaje;
    } catch {
      // Sin detalle adicional.
    }

    throw new Error(mensaje);
  }

  return response.json();
};