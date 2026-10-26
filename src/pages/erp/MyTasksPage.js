import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheckSquare,
    faHome
} from "@fortawesome/free-solid-svg-icons";
import {
    Badge,
    Breadcrumb,
    Card,
    Table
} from "@themesberg/react-bootstrap";

import { faEdit } from "@fortawesome/free-solid-svg-icons";
import {
    Button,
    Form,
    Modal
} from "@themesberg/react-bootstrap";

import {
    actualizarMiProgreso,
    listarMisTareas
} from "../../services/tareaApi";

const colorEstado = {
    PENDIENTE: "secondary",
    EN_PROGRESO: "warning",
    BLOQUEADA: "danger",
    TERMINADA: "success"
};

export default function MyTasksPage() {
    const [tareas, setTareas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarTareas = async () => {
            try {
                setCargando(true);
                setError("");

                const datos = await listarMisTareas();
                setTareas(datos);
            } catch (err) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        };

        cargarTareas();
    }, []);

    const [tareaEditando, setTareaEditando] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [progreso, setProgreso] = useState({
        estado: "PENDIENTE",
        horasReales: ""
    });

    const abrirProgreso = (tarea) => {
        setTareaEditando(tarea);

        setProgreso({
            estado: tarea.estado || "PENDIENTE",
            horasReales: tarea.horasReales ?? ""
        });

        setMostrarModal(true);
    };

    const guardarProgreso = async (evento) => {
        evento.preventDefault();

        try {
            const tareaActualizada = await actualizarMiProgreso(
                tareaEditando.id,
                {
                    estado: progreso.estado,
                    horasReales: progreso.horasReales === ""
                        ? null
                        : Number(progreso.horasReales)
                }
            );

            setTareas((anteriores) =>
                anteriores.map((tarea) =>
                    tarea.id === tareaActualizada.id
                        ? tareaActualizada
                        : tarea
                )
            );

            setMostrarModal(false);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                <div>
                    <Breadcrumb className="d-none d-md-inline-block">
                        <Breadcrumb.Item href="#/dashboard/overview">
                            <FontAwesomeIcon icon={faHome} />
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active>My Tasks</Breadcrumb.Item>
                    </Breadcrumb>

                    <h2 className="h4">My Tasks</h2>
                    <p className="mb-0">
                        Review the tasks assigned specifically to you.
                    </p>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <Card border="light" className="shadow-sm">
                <Card.Header>
                    <FontAwesomeIcon icon={faCheckSquare} className="me-2" />
                    <strong>Assigned tasks</strong>
                </Card.Header>

                <Card.Body className="p-0">
                    <Table responsive hover className="user-table align-items-center mb-0">
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Project</th>
                                <th>Due date</th>
                                <th>Estimated hours</th>
                                <th>Actual hours</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {cargando ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">
                                        Loading your tasks...
                                    </td>
                                </tr>
                            ) : tareas.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">
                                        You have no assigned tasks.
                                    </td>
                                </tr>
                            ) : (
                                tareas.map((tarea) => (
                                    <tr key={tarea.id}>
                                        <td>
                                            <span className="fw-bold d-block">
                                                {tarea.titulo}
                                            </span>

                                            <small className="text-gray">
                                                {tarea.descripcion || "No description"}
                                            </small>
                                        </td>

                                        <td>{tarea.proyecto?.nombre || "-"}</td>
                                        <td>{tarea.fechaLimite || "-"}</td>
                                        <td>{tarea.horasEstimadas ?? 0} h</td>
                                        <td>{tarea.horasReales ?? 0} h</td>

                                        <td>
                                            <Badge bg={colorEstado[tarea.estado] || "secondary"}>
                                                {tarea.estado}
                                            </Badge>
                                        </td>
                                        <td className="text-end">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => abrirProgreso(tarea)}
                                            >
                                                <FontAwesomeIcon icon={faEdit} className="me-1" />
                                                Update
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
            <Modal
                as={Modal.Dialog}
                centered
                show={mostrarModal}
                onHide={() => setMostrarModal(false)}
            >
                <Form onSubmit={guardarProgreso}>
                    <Modal.Header>
                        <Modal.Title>Update task progress</Modal.Title>
                        <Button
                            variant="close"
                            onClick={() => setMostrarModal(false)}
                        />
                    </Modal.Header>

                    <Modal.Body>
                        <p className="fw-bold">{tareaEditando?.titulo}</p>

                        <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                value={progreso.estado}
                                onChange={(e) =>
                                    setProgreso({
                                        ...progreso,
                                        estado: e.target.value
                                    })
                                }
                            >
                                <option value="PENDIENTE">Pending</option>
                                <option value="EN_PROGRESO">In progress</option>
                                <option value="BLOQUEADA">Blocked</option>
                                <option value="TERMINADA">Completed</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Actual hours</Form.Label>
                            <Form.Control
                                min="0"
                                type="number"
                                value={progreso.horasReales}
                                onChange={(e) =>
                                    setProgreso({
                                        ...progreso,
                                        horasReales: e.target.value
                                    })
                                }
                            />
                        </Form.Group>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => setMostrarModal(false)}
                        >
                            Cancel
                        </Button>

                        <Button variant="primary" type="submit">
                            Save progress
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}