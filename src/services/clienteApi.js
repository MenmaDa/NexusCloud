const API_URL = "http://localhost:8080/api/clientes";

async function manejarRespuesta(respuesta) {
  if (!respuesta.ok) {
    const mensaje = await respuesta.text();
    throw new Error(mensaje || "The request could not be completed");
  }

  if (respuesta.status === 204) {
    return null;
  }

  return respuesta.json();
}

export async function listarClientes() {
  const respuesta = await fetch(API_URL);
  return manejarRespuesta(respuesta);
}

export async function crearCliente(cliente) {
  const respuesta = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(cliente)
  });

  return manejarRespuesta(respuesta);
}

export async function actualizarCliente(id, cliente) {
  const respuesta = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(cliente)
  });

  return manejarRespuesta(respuesta);
}

export async function eliminarCliente(id) {
  const respuesta = await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });

  return manejarRespuesta(respuesta);
}