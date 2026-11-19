import { apiFetch } from "./apiFetch";

const API_URL = "https://telecooperaciones-production.up.railway.app/api/recomendaciones";

async function manejarRespuesta(response) {
    if (!response.ok) {
        let mensaje = "Could not load recommendations.";

        try {
            const error = await response.json();
            mensaje = error.detail || error.message || mensaje;
        } catch {
            // Sin mensaje adicional.
        }

        throw new Error(mensaje);
    }

    return response.json();
}

export const obtenerRecomendaciones = (
    clienteId,
    presupuesto,
    limite = 5
) => {
    const parametros = new URLSearchParams({
        limite: String(limite)
    });

    if (presupuesto) {
        parametros.append("presupuesto", presupuesto);
    }

    return apiFetch(
        `${API_URL}/clientes/${clienteId}?${parametros.toString()}`
    ).then(manejarRespuesta);
};