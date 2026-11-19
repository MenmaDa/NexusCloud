import { apiFetch } from "./apiFetch";

const API_URL = "https://telecooperaciones-production.up.railway.app/api/infraestructura";

async function manejarRespuesta(response) {
    if (!response.ok) {
        let mensaje = "Could not complete the monitoring operation.";

        try {
            const error = await response.json();
            mensaje = error.detail || error.message || mensaje;
        } catch {
            // Sin detalle adicional.
        }

        throw new Error(mensaje);
    }

    return response.json();
}

export const verificarInfraestructura = (infraestructuraId) =>
    apiFetch(
        `${API_URL}/${infraestructuraId}/monitoreo/verificar`,
        { method: "POST" }
    ).then(manejarRespuesta);

export const obtenerResumenMonitoreo = (infraestructuraId) =>
    apiFetch(
        `${API_URL}/${infraestructuraId}/monitoreo/resumen`
    ).then(manejarRespuesta);