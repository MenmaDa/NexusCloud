import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import {
  Breadcrumb,
  Card
} from "@themesberg/react-bootstrap";

const ModulePage = ({ title, description }) => (
  <>
    <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
      <div className="d-block mb-4 mb-md-0">
        <Breadcrumb
          className="d-none d-md-inline-block"
          listProps={{
            className: "breadcrumb-dark breadcrumb-transparent"
          }}
        >
          <Breadcrumb.Item>
            <FontAwesomeIcon icon={faHome} />
          </Breadcrumb.Item>
          <Breadcrumb.Item>Nexus ERP</Breadcrumb.Item>
          <Breadcrumb.Item active>{title}</Breadcrumb.Item>
        </Breadcrumb>

        <h4>{title}</h4>
        <p className="mb-0">{description}</p>
      </div>
    </div>

    <Card border="light" className="shadow-sm">
      <Card.Body className="text-center py-5">
        <h5>{title} module</h5>
        <p className="mb-0">
          This module will be connected to the Spring Boot API.
        </p>
      </Card.Body>
    </Card>
  </>
);

export const ClientsPage = () => (
  <ModulePage
    title="Clients"
    description="Manage clients and contact information."
  />
);

export const ProjectsPage = () => (
  <ModulePage
    title="Projects"
    description="Manage projects, tasks, milestones, and assignments."
  />
);

export const ContractsPage = () => (
  <ModulePage
    title="Contracts"
    description="Manage client contracts, dates, and values."
  />
);

export const BillingPage = () => (
  <ModulePage
    title="Billing"
    description="Manage invoices, payments, and overdue accounts."
  />
);

export { default as ResourcesPage } from "./ResourcesPage";

export { default as InfrastructurePage } from "./InfrastructurePage";

export { default as RecommendationsPage } from "./RecommendationsPage";

export { default as AdministrationPage } from "./AdministrationPage";