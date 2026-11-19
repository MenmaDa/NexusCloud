import { apiFetch } from "./apiFetch";

const API_URL = "https://telecooperaciones-production.up.railway.app/api/dashboard/resumen";

async function manejarRespuesta(response) {
    if (!response.ok) {
        let mensaje = "Could not load dashboard information.";

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

export const obtenerResumenDashboard = () =>
    apiFetch(API_URL).then(manejarRespuesta);