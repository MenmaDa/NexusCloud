import { apiFetch } from "./apiFetch";

const API_URL = "https://telecooperaciones-production.up.railway.app/api/reportes";

async function manejarRespuesta(response) {
    if (!response.ok) {
        let mensaje = "Could not load reports.";

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

export const obtenerReporteFinanciero = () =>
    apiFetch(`${API_URL}/financiero`).then(manejarRespuesta);

export const obtenerReporteCartera = () =>
    apiFetch(`${API_URL}/cartera`).then(manejarRespuesta);

export const obtenerRentabilidadProyectos = () =>
    apiFetch(`${API_URL}/rentabilidad-proyectos`).then(manejarRespuesta);