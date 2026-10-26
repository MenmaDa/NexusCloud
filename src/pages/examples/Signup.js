import React from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Container,
  Row
} from "@themesberg/react-bootstrap";

import { Routes } from "../../routes";

export default function Signup() {
  return (
    <main>
      <section className="vh-lg-100 mt-5 mt-lg-0 bg-soft d-flex align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={8} lg={6}>
              <Card border="light" className="shadow-soft p-4 p-lg-5 text-center">
                <Card.Body>
                  <h1 className="h3 mb-3">Request system access</h1>

                  <p className="text-gray">
                    Employee accounts are created by a system administrator.
                    The administrator assigns the employee, access roles and
                    permissions required for their work.
                  </p>

                  <Link to={Routes.Signin.path}>
                    <Button variant="primary">
                      Back to sign in
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
}