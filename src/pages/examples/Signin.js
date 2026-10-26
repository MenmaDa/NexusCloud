import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row
} from "@themesberg/react-bootstrap";

import { Routes } from "../../routes";
import {
  guardarSesion,
  iniciarSesion
} from "../../services/authApi";

export default function Signin() {
  const history = useHistory();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarInicioSesion = async (evento) => {
    evento.preventDefault();

    try {
      setCargando(true);
      setError("");

      const datos = await iniciarSesion(email, password);

      guardarSesion(datos);

      history.push(Routes.DashboardOverview.path);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main>
      <section className="vh-lg-100 mt-5 mt-lg-0 bg-soft d-flex align-items-center">
        <Container>
          <Row className="justify-content-center form-bg-image">
            <Col xs={12} className="d-flex align-items-center justify-content-center">
              <div className="bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100 fmxw-500">
                <div className="text-center text-md-center mb-4 mt-md-0">
                  <h1 className="mb-0 h3">Sign in to Nexus ERP</h1>
                  <p className="text-gray mb-0">
                    Access projects, tasks and company operations.
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <Form onSubmit={manejarInicioSesion}>
                  <Form.Group className="mb-4">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      required
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      required
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={cargando}
                  >
                    {cargando ? "Signing in..." : "Sign in"}
                  </Button>
                </Form>

                <div className="d-flex justify-content-center align-items-center mt-4">
                  <span className="fw-normal">
                    Need access?{" "}
                    <Link to={Routes.Signup.path} className="fw-bold">
                      Request an account
                    </Link>
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
}