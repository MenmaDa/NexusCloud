import { apiFetch } from "./apiFetch";

const API_BASE = "https://telecooperaciones-production.up.railway.app/api";

async function manejarRespuesta(response) {
    if (!response.ok) {
        let mensaje = "Could not load administration information.";

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

const consultar = async (ruta) => {
    const response = await apiFetch(`${API_BASE}${ruta}`);

    if (!response.ok) {
        let mensaje = `Request failed: ${ruta}`;

        try {
            const error = await response.json();
            mensaje = error.detail || error.message || mensaje;
        } catch {
            // Sin detalle adicional.
        }

        throw new Error(`${ruta}: ${mensaje}`);
    }

    return response.json();
};

export const obtenerDatosAdministracion = async () => {
    const [
        usuarios,
        roles,
        empleados,
        sedes,
        auditorias
    ] = await Promise.all([
        consultar("/usuarios"),
        consultar("/roles"),
        consultar("/empleados"),
        consultar("/sedes"),
        consultar("/auditorias")
    ]);

    return {
        usuarios,
        roles,
        empleados,
        sedes,
        auditorias
    };
};