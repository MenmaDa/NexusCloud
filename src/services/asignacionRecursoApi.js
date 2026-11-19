import { apiFetch } from "./apiFetch";

const API_URL = "https://telecooperaciones-production.up.railway.app/api/asignaciones-recursos";

async function manejarRespuesta(response) {
    if (!response.ok) {
        let mensaje = "Could not complete the resource assignment operation.";

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

export const listarAsignacionesRecursos = () =>
    apiFetch(API_URL).then(manejarRespuesta);

export const crearAsignacionRecurso = (asignacion) =>
    apiFetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(asignacion)
    }).then(manejarRespuesta);

export const actualizarAsignacionRecurso = (id, asignacion) =>
    apiFetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(asignacion)
    }).then(manejarRespuesta);

export const eliminarAsignacionRecurso = (id) =>
    apiFetch(`${API_URL}/${id}`, {
        method: "DELETE"
    }).then(manejarRespuesta);