
import React, { useState } from "react";
import SimpleBar from "simplebar-react";
import { useLocation } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserTie,
  faBuilding,
  faCheckSquare,
  faAddressBook,
  faChartPie,
  faUsers,
  faProjectDiagram,
  faFileContract,
  faFileInvoiceDollar,
  faUserCog,
  faNetworkWired,
  faLightbulb,
  faCog,
  faSignOutAlt,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import { Nav, Badge, Image, Button, Dropdown, Accordion, Navbar } from '@themesberg/react-bootstrap';
import { Link } from 'react-router-dom';

import { Routes } from "../routes";
import ReactHero from "../assets/img/technologies/react-hero-logo.svg";
import ProfilePicture from "../assets/img/team/profile-picture-3.jpg";

export default (props = {}) => {
  const location = useLocation();
  const { pathname } = location;
  const [show, setShow] = useState(false);
  const showClass = show ? "show" : "";

  const onCollapse = () => setShow(!show);

  const CollapsableNavItem = (props) => {
    const { eventKey, title, icon, children = null } = props;
    const defaultKey = pathname.indexOf(eventKey) !== -1 ? eventKey : "";

    return (
      <Accordion as={Nav.Item} defaultActiveKey={defaultKey}>
        <Accordion.Item eventKey={eventKey}>
          <Accordion.Button as={Nav.Link} className="d-flex justify-content-between align-items-center">
            <span>
              <span className="sidebar-icon"><FontAwesomeIcon icon={icon} /> </span>
              <span className="sidebar-text">{title}</span>
            </span>
          </Accordion.Button>
          <Accordion.Body className="multi-level">
            <Nav className="flex-column">
              {children}
            </Nav>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  };

  const NavItem = (props) => {
    const { title, link, external, target, icon, image, badgeText, badgeBg = "secondary", badgeColor = "primary" } = props;
    const classNames = badgeText ? "d-flex justify-content-start align-items-center justify-content-between" : "";
    const navItemClassName = link === pathname ? "active" : "";
    const linkProps = external ? { href: link } : { as: Link, to: link };

    return (
      <Nav.Item className={navItemClassName} onClick={() => setShow(false)}>
        <Nav.Link {...linkProps} target={target} className={classNames}>
          <span>
            {icon ? <span className="sidebar-icon"><FontAwesomeIcon icon={icon} /> </span> : null}
            {image ? <Image src={image} width={20} height={20} className="sidebar-icon svg-icon" /> : null}

            <span className="sidebar-text">{title}</span>
          </span>
          {badgeText ? (
            <Badge pill bg={badgeBg} text={badgeColor} className="badge-md notification-count ms-2">{badgeText}</Badge>
          ) : null}
        </Nav.Link>
      </Nav.Item>
    );
  };

  return (
    <>
      <Navbar expand={false} collapseOnSelect variant="dark" className="navbar-theme-primary px-4 d-md-none">
        <Navbar.Brand className="me-lg-5" as={Link} to={Routes.DashboardOverview.path}>
          <Image src={ReactHero} className="navbar-brand-light" />
        </Navbar.Brand>
        <Navbar.Toggle as={Button} aria-controls="main-navbar" onClick={onCollapse}>
          <span className="navbar-toggler-icon" />
        </Navbar.Toggle>
      </Navbar>
      <CSSTransition timeout={300} in={show} classNames="sidebar-transition">
        <SimpleBar className={`collapse ${showClass} sidebar d-md-block bg-primary text-white`}>
          <div className="sidebar-inner px-4 pt-3">
            <div className="user-card d-flex d-md-none align-items-center justify-content-between justify-content-md-center pb-4">
              <div className="d-flex align-items-center">
                <div className="user-avatar lg-avatar me-4">
                  <Image src={ProfilePicture} className="card-img-top rounded-circle border-white" />
                </div>
                <div className="d-block">
                  <h6>Hi, Jane</h6>
                  <Button as={Link} variant="secondary" size="xs" to={Routes.Signin.path} className="text-dark">
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Sign Out
                  </Button>
                </div>
              </div>
              <Nav.Link className="collapse-close d-md-none" onClick={onCollapse}>
                <FontAwesomeIcon icon={faTimes} />
              </Nav.Link>
            </div>
            <Nav className="flex-column pt-3 pt-md-0">
              <NavItem
                title="Nexus Safe-Cloud ERP"
                link={Routes.DashboardOverview.path}
                image={ReactHero}
              />

              <NavItem
                title="Dashboard"
                link={Routes.DashboardOverview.path}
                icon={faChartPie}
              />

              <Dropdown.Divider className="my-3 border-indigo" />

              <NavItem
                title="Clients"
                link={Routes.Clientes.path}
                icon={faUsers}
              />

              <Nav.Item>
                <Nav.Link as={Link} to={Routes.ContactosClientes.path}>
                  <span className="sidebar-icon">
                    <FontAwesomeIcon icon={faAddressBook} />
                  </span>
                  <span className="sidebar-text">Client Contacts</span>
                </Nav.Link>
              </Nav.Item>

              <NavItem
                title="Projects"
                link={Routes.Proyectos.path}
                icon={faProjectDiagram}
              />

              <Nav.Item>
                <Nav.Link as={Link} to={Routes.Tareas.path}>
                  <span className="sidebar-icon">
                    <FontAwesomeIcon icon={faCheckSquare} />
                  </span>
                  <span className="sidebar-text">Tasks</span>
                </Nav.Link>
              </Nav.Item>

              <NavItem
                title="Contracts"
                link={Routes.Contratos.path}
                icon={faFileContract}
              />

              <NavItem
                title="Billing"
                link={Routes.Facturas.path}
                icon={faFileInvoiceDollar}
              />

              <NavItem
                title="Products and Services"
                link={Routes.ProductosServicios.path}
                icon={faNetworkWired}
              />

              <NavItem
                title="Resources"
                link={Routes.Recursos.path}
                icon={faUserCog}
              />

              <Nav.Item>
                <Nav.Link as={Link} to={Routes.Sedes.path}>
                  <span className="sidebar-icon">
                    <FontAwesomeIcon icon={faBuilding} />
                  </span>
                  <span className="sidebar-text">Branches</span>
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link as={Link} to={Routes.Empleados.path}>
                  <span className="sidebar-icon">
                    <FontAwesomeIcon icon={faUserTie} />
                  </span>
                  <span className="sidebar-text">Employees</span>
                </Nav.Link>
              </Nav.Item>

              <NavItem
                title="Infrastructure"
                link={Routes.Infraestructura.path}
                icon={faNetworkWired}
              />

              <NavItem
                title="Recommendations"
                link={Routes.Recomendaciones.path}
                icon={faLightbulb}
                badgeText="AI"
                badgeBg="secondary"
                badgeColor="primary"
              />

              <Dropdown.Divider className="my-3 border-indigo" />

              <NavItem
                title="Administration"
                link={Routes.Administracion.path}
                icon={faCog}
              />
            </Nav>
          </div>
        </SimpleBar>
      </CSSTransition>
    </>
  );
};
